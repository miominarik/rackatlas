<?php

namespace App\Services\Ssh;

use App\Enums\ServerStatus;
use App\Exceptions\MetricsCollectionException;
use App\Models\Server;
use App\Services\Alerts\AlertEvaluator;
use App\Services\Redis\RedisParser;
use Illuminate\Support\Facades\DB;

class AgentIngestor
{
    public function __construct(
        private readonly MetricsParser $metrics,
        private readonly LogParser $logs,
        private readonly ServerMetricsCollector $collector,
        private readonly AlertEvaluator $alerts,
        private readonly ServiceSync $services,
        private readonly RedisParser $redis,
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

        $systemInfo = $this->metrics->systemInfo($sections['SYSTEM'] ?? null);
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

        $redisMetrics = $this->redisMetrics($server, $sections);
        $redisFailed = false;

        foreach ($sections as $name => $body) {
            if (preg_match('/^REDIS_ERROR(_\d+)?$/', $name) === 1) {
                $redisFailed = true;
                $entries[] = [
                    'level' => 'error',
                    'source' => 'redis',
                    'message' => 'Redis: '.mb_substr(trim($body), 0, 300),
                    'count' => 1,
                    'occurred_at' => now(),
                ];
            }
        }

        $fresh = [];

        DB::transaction(function () use ($server, $data, $sections, $entries, $failedNow, $systemInfo, $agentVersion, $redisMetrics, &$fresh) {
            $this->collector->store($server, $data);

            foreach ($redisMetrics as $redisMetric) {
                $server->redisMetrics()->create($redisMetric);
            }

            if (isset($sections['SERVICES'])) {
                $this->services->sync($server, $sections['SERVICES']);
            }

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
                'system_info' => $systemInfo ?? $server->system_info,
            ])->save();
        });

        $this->resolveRecoveredUnits($server, $failedNow);

        if ($redisMetrics !== [] && ! $redisFailed) {
            $server->logs()->open()->where('source', 'redis')->update(['resolved_at' => now(), 'resolved_by' => null]);
        }

        // Live: a problem is reported as soon as the agent sends the report that shows it.
        $this->alerts->evaluate($server);
        $this->alerts->notifyLogs($server, $fresh);
    }

    /**
     * The readings of the Redis instances on this machine. The first instance is sent in the sections REDIS_INFO,
     * REDIS_CLUSTER_INFO and REDIS_CLUSTER_NODES, the next ones with the suffix _1, _2 and so on.
     *
     * @param  array<string, string>  $sections
     * @return array<int, array<string, mixed>>
     */
    private function redisMetrics(Server $server, array $sections): array
    {
        $readings = [];

        foreach (array_keys($sections) as $name) {
            if (preg_match('/^REDIS_INFO(_\d+)?$/', $name, $match) !== 1) {
                continue;
            }

            $suffix = $match[1] ?? '';
            $info = $this->redis->keyValues($sections[$name]);

            if (! isset($info['redis_version'])) {
                continue;
            }

            $data = $this->redis->metric($info);
            $data['cluster'] = isset($sections['REDIS_CLUSTER_INFO'.$suffix])
                ? $this->redis->cluster($sections['REDIS_CLUSTER_INFO'.$suffix], $sections['REDIS_CLUSTER_NODES'.$suffix] ?? '')
                : null;

            $previous = $server->redisMetrics()->where('port', $data['port'])->latest('collected_at')->first();
            $seconds = $previous?->collected_at->diffInSeconds(now(), true);
            // A restart resets the counter, so there is no value then.
            $data['commands_per_second'] = $previous !== null && $seconds > 0 && $data['commands_total'] >= $previous->commands_total
                ? round(($data['commands_total'] - $previous->commands_total) / $seconds, 2)
                : null;
            $data['collected_at'] = now();
            $readings[] = $data;
        }

        return $readings;
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
