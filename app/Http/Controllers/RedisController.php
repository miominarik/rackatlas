<?php

namespace App\Http\Controllers;

use App\Models\RedisMetric;
use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class RedisController extends Controller
{
    /**
     * The Redis servers of the current team with their latest reading, and the state of Redis Sentinel
     * for the servers that are linked through it.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('redis/index', ['team' => null]);
        }

        $servers = $team->servers()->redisFamily()->with(['latestRedisMetric', 'sentinelGroup'])->orderBy('name')->get();

        return Inertia::render('redis/index', [
            'team' => $team->only('id', 'name'),
            'canManage' => $request->user()->can('permit', [$team, 'redis.edit']),
            'servers' => $servers->filter(fn (Server $server) => $server->isRedis())->map(fn (Server $server) => [
                'id' => $server->id,
                'name' => $server->name,
                'host' => $server->host,
                'port' => $server->port,
                'status' => $server->status->value,
                'last_checked_at' => $server->last_checked_at?->toIso8601String(),
                'sentinel_master_name' => $server->sentinelGroup?->master_name,
                'metric' => $this->presentMetric($server->latestRedisMetric),
            ])->values(),
            'sentinels' => $this->sentinelGroups($servers),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * One entry for every Redis Sentinel setup: what the Sentinel of each member reports. The members are
     * Redis servers that run a Sentinel and servers that only run a Sentinel.
     *
     * @param  Collection<int, Server>  $servers
     * @return array<int, array<string, mixed>>
     */
    private function sentinelGroups(Collection $servers): array
    {
        return $servers
            ->filter(fn (Server $server) => $server->sentinelGroup !== null)
            ->groupBy('sentinel_group_id')
            ->map(function (Collection $members) {
                $reports = $members->map(fn (Server $member) => [
                    'server_id' => $member->id,
                    'server_name' => $member->name,
                    'type' => $member->type->value,
                    'status' => $member->status->value,
                    'port' => $member->sentinel_port,
                    'role' => $member->latestRedisMetric?->role,
                    'collected_at' => $member->latestRedisMetric?->collected_at->toIso8601String(),
                    'sentinel' => $member->latestRedisMetric?->sentinel,
                ])->values();

                $masters = $reports
                    ->map(fn (array $report) => $report['sentinel']['reachable'] ?? false
                        ? ($report['sentinel']['master_ip'].':'.$report['sentinel']['master_port'])
                        : null)
                    ->filter()
                    ->unique();

                return [
                    'master_name' => $members->first()->sentinelGroup->master_name,
                    'members' => $reports->all(),
                    // The Sentinels disagree when they point at different masters.
                    'agree' => $masters->count() <= 1,
                    'masters' => $masters->values(),
                ];
            })
            ->sortBy('master_name')
            ->values()
            ->all();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function presentMetric(?RedisMetric $metric): ?array
    {
        if ($metric === null) {
            return null;
        }

        return [
            'collected_at' => $metric->collected_at->toIso8601String(),
            'version' => $metric->version,
            'role' => $metric->role,
            'uptime_seconds' => $metric->uptime_seconds,
            'connected_clients' => $metric->connected_clients,
            'blocked_clients' => $metric->blocked_clients,
            'max_clients' => $metric->max_clients,
            'used_memory' => $metric->used_memory,
            'max_memory' => $metric->max_memory,
            'memory_percent' => $metric->memoryPercent(),
            'used_memory_rss' => $metric->used_memory_rss,
            'commands_per_second' => $metric->commands_per_second !== null ? (float) $metric->commands_per_second : null,
            'hit_rate_percent' => $metric->hitRatePercent(),
            'evicted_keys_total' => $metric->evicted_keys_total,
            'rejected_connections_total' => $metric->rejected_connections_total,
            'keys_count' => $metric->keys_count,
            'connected_replicas' => $metric->connected_replicas,
            'master' => $metric->master_host,
            'master_link_status' => $metric->master_link_status,
            'master_last_io_seconds_ago' => $metric->master_last_io_seconds_ago,
            'persistence_ok' => $metric->persistence_ok,
        ];
    }
}
