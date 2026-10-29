<?php

namespace App\Services\Ssh;

use App\Enums\ServerStatus;
use App\Exceptions\MetricsCollectionException;
use App\Models\Server;
use Illuminate\Support\Facades\DB;

class AgentIngestor
{
    public function __construct(
        private readonly MetricsParser $metrics,
        private readonly LogParser $logs,
        private readonly ServerMetricsCollector $collector,
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

        DB::transaction(function () use ($server, $data, $entries, $failedNow, $agentVersion) {
            $this->collector->store($server, $data);

            $entries = $this->withoutKnown($server, $entries);

            if ($entries !== []) {
                $server->logs()->createMany($entries);
            }

            $server->forceFill([
                'status' => ServerStatus::Online,
                'last_checked_at' => now(),
                'last_seen_at' => now(),
                'agent_version' => $agentVersion ? mb_substr($agentVersion, 0, 32) : $server->agent_version,
                'failed_units' => $failedNow,
            ])->save();
        });
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
