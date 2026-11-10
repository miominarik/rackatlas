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
     * The servers of the current team that run Redis, with their latest reading: servers added as Redis, and
     * servers whose agent reports the Redis on the machine. Cluster nodes are grouped into clusters.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('redis/index', ['team' => null]);
        }

        $servers = $team->servers()
            ->with('latestRedisMetric')
            ->where(fn ($query) => $query->redis()->orWhereHas('redisMetrics'))
            ->orderBy('name')
            ->get();

        $presented = $servers->map(fn (Server $server) => [
            'id' => $server->id,
            'name' => $server->name,
            'host' => $server->host,
            'port' => $server->port,
            'status' => $server->status->value,
            'last_checked_at' => $server->last_checked_at?->toIso8601String(),
            'via_agent' => ! $server->isRedis(),
            'metric' => $this->presentMetric($server->latestRedisMetric),
        ]);

        return Inertia::render('redis/index', [
            'team' => $team->only('id', 'name'),
            'canManage' => $request->user()->can('permit', [$team, 'redis.edit']),
            'servers' => $presented->values(),
            'clusters' => $this->clusters($presented),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Servers whose reading shows a cluster, grouped: two servers belong to one cluster when one of them
     * is listed among the nodes the other one sees.
     *
     * @param  Collection<int, array<string, mixed>>  $servers
     * @return array<int, array<string, mixed>>
     */
    private function clusters(Collection $servers): array
    {
        $members = $servers->filter(fn (array $server) => isset($server['metric']['cluster']['myself']))->values();
        $parent = $members->keys()->all();

        $find = function (int $i) use (&$parent, &$find): int {
            return $parent[$i] === $i ? $i : $parent[$i] = $find($parent[$i]);
        };

        foreach ($members as $i => $server) {
            $seen = collect($server['metric']['cluster']['nodes'])->pluck('id');

            foreach ($members as $j => $other) {
                if ($seen->contains($other['metric']['cluster']['myself'])) {
                    $parent[$find($i)] = $find($j);
                }
            }
        }

        return $members
            ->groupBy(fn (array $server, int $i) => $find($i))
            ->map(function (Collection $group) {
                // The view of the most recent reading is the one shown for the cluster.
                $latest = $group->sortByDesc(fn (array $server) => $server['metric']['collected_at'])->first();
                $cluster = $latest['metric']['cluster'];
                $ownIds = $group->pluck('metric.cluster.myself')->all();
                $problems = [];

                if ($cluster['state'] !== 'ok') {
                    $problems[] = ['type' => 'state', 'detail' => $cluster['state']];
                }

                if ($cluster['slots_assigned'] < 16384) {
                    $problems[] = ['type' => 'slots_unassigned', 'detail' => (string) (16384 - $cluster['slots_assigned'])];
                }

                foreach ($cluster['nodes'] as $node) {
                    $broken = array_intersect($node['flags'], ['fail', 'fail?', 'handshake', 'noaddr']);

                    if ($broken !== [] || $node['link_state'] !== 'connected') {
                        $problems[] = ['type' => 'node', 'detail' => $node['address'].' ('.implode(',', $broken ?: [$node['link_state']]).')'];
                    }
                }

                $unmonitored = collect($cluster['nodes'])->filter(fn (array $node) => ! in_array($node['id'], $ownIds, true))->count();

                return [
                    'state' => $cluster['state'],
                    'slots_assigned' => $cluster['slots_assigned'],
                    'slots_fail' => $cluster['slots_fail'],
                    'slots_pfail' => $cluster['slots_pfail'],
                    'known_nodes' => $cluster['known_nodes'],
                    'size' => $cluster['size'],
                    'current_epoch' => $cluster['current_epoch'],
                    'problems' => $problems,
                    'unmonitored_nodes' => $unmonitored,
                    'nodes' => $cluster['nodes'],
                    'server_ids' => $group->pluck('id')->values(),
                    'collected_at' => $latest['metric']['collected_at'],
                ];
            })
            ->sortByDesc('known_nodes')
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
            'cluster' => $metric->cluster,
        ];
    }
}
