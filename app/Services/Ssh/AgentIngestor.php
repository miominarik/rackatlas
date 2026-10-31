<?php

namespace App\Services\Ssh;

use App\Enums\ServerStatus;
use App\Exceptions\MetricsCollectionException;
use App\Models\Server;
use App\Services\Alerts\AlertEvaluator;
use Illuminate\Support\Facades\DB;

class AgentIngestor
{
    public function __construct(
        private readonly MetricsParser $metrics,
        private readonly LogParser $logs,
        private readonly ServerMetricsCollector $collector,
        private readonly AlertEvaluator $alerts,
    ) {}

    /**
     * Store one report of the agent: metrics, serious log entries and the failed systemd units.
     *
     * @throws MetricsCollectionException when the report cannot be read
     */
    public function ingest(Server $server, string $body, ?string $agentVersion): void
    {
        $data = $this->metrics->parse($body);
        $sections = $this->metrics->sections($body);

        $entries = [
            ...$this->logs->parseJournal($sections['JOURNAL_CRITICAL'] ?? '', 'critical'),
            ...$this->logs->parseJournal($sections['JOURNAL_ERROR'] ?? '', 'error'),
        ];

        $failedNow = $this->logs->parseFailedUnits($sections['FAILED_UNITS'] ?? '');
        $failedBefore = $server->failed_units ?? [];

        // A unit is a news item only when it fails, not every minute it stays failed.
        foreach (array_diff($failedNow, $failedBefore) as $unit) {
            $entries[] = [
                'level' => 'error',
                'source' => 'systemd',
                'message' => "Unit {$unit} failed",
                'count' => 1,
                'occurred_at' => now(),
            ];
        }

        $fresh = [];

        DB::transaction(function () use ($server, $data, $entries, $failedNow, $agentVersion, &$fresh) {
            $this->collector->store($server, $data);

            $fresh = $this->withoutKnown($server, $this->mergeIntoOpen($server, $entries));

            if ($fresh !== []) {
                $server->logs()->createMany($fresh);
            }

            $server->forceFill([
                'status' => ServerStatus::Online,
                'last_checked_at' => now(),
                'last_seen_at' => now(),
                'agent_version' => $agentVersion ? mb_substr($agentVersion, 0, 32) : $server->agent_version,
                'failed_units' => $failedNow,
            ])->save();
        });

        $this->resolveRecoveredUnits($server, $failedNow);

        // Live: a problem is reported as soon as the agent sends the report that shows it.
        $this->alerts->evaluate($server);
        $this->alerts->notifyLogs($server, $fresh);
    }

    /**
     * A "unit failed" entry is resolved by itself as soon as the unit is not failed any more.
     *
     * @param  array<int, string>  $failedNow
     */
    private function resolveRecoveredUnits(Server $server, array $failedNow): void
    {
        $recovered = $server->logs()
            ->open()
            ->where('source', 'systemd')
            ->where('message', 'like', 'Unit % failed')
            ->get(['id', 'message'])
            ->filter(fn ($log) => preg_match('/^Unit (.+) failed$/', $log->message, $match) === 1
                && ! in_array($match[1], $failedNow, true))
            ->pluck('id');

        if ($recovered->isNotEmpty()) {
            $server->logs()->whereIn('id', $recovered)->update(['resolved_at' => now(), 'resolved_by' => null]);
        }
    }

    /**
     * A problem that is still open is not stored again: the entry of the open log only gets the new
     * occurrences added to its count. Entries of problems without an open log are returned to be created.
     * Occurrences that are not newer than the open log are the same report sent again and are ignored.
     *
     * @param  array<int, array<string, mixed>>  $entries
     * @return array<int, array<string, mixed>>
     */
    private function mergeIntoOpen(Server $server, array $entries): array
    {
        if ($entries === []) {
            return [];
        }

        $open = $server->logs()
            ->open()
            ->whereIn('source', array_values(array_unique(array_column($entries, 'source'))))
            ->orderByDesc('id')
            ->get(['id', 'level', 'source', 'message', 'count', 'occurred_at'])
            ->keyBy(fn ($log) => LogParser::signature($log->level, $log->source, $log->message));

        $new = [];

        foreach ($entries as $entry) {
            $log = $open->get(LogParser::signature($entry['level'], $entry['source'], $entry['message']));

            if ($log === null) {
                $new[] = $entry;

                continue;
            }

            if ($entry['occurred_at']->greaterThan($log->occurred_at)) {
                $server->logs()->whereKey($log->id)->update([
                    'count' => $log->count + $entry['count'],
                    'occurred_at' => $entry['occurred_at'],
                ]);
            }
        }

        return $new;
    }

    /**
     * A report that was stored but not acknowledged is sent again, and must not create
     * the same entries twice.
     *
     * @param  array<int, array<string, mixed>>  $entries
     * @return array<int, array<string, mixed>>
     */
    private function withoutKnown(Server $server, array $entries): array
    {
        if ($entries === []) {
            return [];
        }

        $since = collect($entries)->min(fn (array $entry) => $entry['occurred_at']);

        $known = $server->logs()
            ->where('occurred_at', '>=', $since)
            ->get(['level', 'source', 'message', 'occurred_at'])
            ->mapWithKeys(fn ($log) => [$this->key($log->level, $log->source, $log->message, $log->occurred_at) => true]);

        return array_values(array_filter(
            $entries,
            fn (array $entry) => ! isset($known[$this->key($entry['level'], $entry['source'], $entry['message'], $entry['occurred_at'])]),
        ));
    }

    private function key(string $level, string $source, string $message, \DateTimeInterface $time): string
    {
        return $level.'|'.$source.'|'.$time->getTimestamp().'|'.$message;
    }
}
