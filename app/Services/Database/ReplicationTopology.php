<?php

namespace App\Services\Database;

use App\Models\DatabaseMetric;
use App\Models\Server;
use Illuminate\Support\Collection;

/**
 * Joins MySQL servers into replication trees. A replica reports the address of its source, and when that
 * address is a monitored server the two are linked. Servers without any link stay out of the result.
 */
class ReplicationTopology
{
    /** A replica this many seconds behind is shown as lagging. */
    public const LAG_WARNING_SECONDS = 60;

    /**
     * @param  Collection<int, Server>  $servers  with latestDatabaseMetric loaded
     * @return array<int, array{healthy: bool, source: array<string, mixed>}>
     */
    public function build(Collection $servers): array
    {
        $byAddress = $servers->keyBy(fn (Server $server) => $this->address((string) $server->host, (int) $server->port));

        /** @var array<string, array<int, array{replica: Server, link: array<string, mixed>}>> $children */
        $children = [];
        /** @var array<string, array<string, mixed>> $external */
        $external = [];
        $hasParent = [];

        foreach ($servers as $replica) {
            $metric = $replica->latestDatabaseMetric;

            if ($metric === null || $metric->replica_io_running === null) {
                continue;
            }

            foreach (array_filter(array_map('trim', explode(',', (string) $metric->replica_source))) as $source) {
                $parent = $byAddress->get(mb_strtolower($source));
                $key = $parent !== null ? 's'.$parent->id : 'x'.mb_strtolower($source);

                if ($parent !== null && $parent->is($replica)) {
                    continue;
                }

                if ($parent === null) {
                    $external[$key] = $this->externalNode($source);
                }

                $children[$key][] = ['replica' => $replica, 'link' => $this->link($metric)];
                $hasParent[$replica->id] = true;
            }
        }

        $roots = array_keys($children);
        $topologies = [];
        $seen = [];

        // A master-master pair has no server without a source, so those are started from the lowest id.
        $starts = array_values(array_filter($roots, fn (string $key) => $key[0] === 'x' || ! isset($hasParent[(int) substr($key, 1)])));
        $rest = array_values(array_filter($roots, fn (string $key) => ! in_array($key, $starts, true)));
        sort($rest);

        foreach ([...$starts, ...$rest] as $key) {
            if (isset($seen[$key])) {
                continue;
            }

            $node = $key[0] === 'x'
                ? $external[$key]
                : $this->serverNode($servers->firstWhere('id', (int) substr($key, 1)));

            $tree = $this->grow($node, $key, $children, $servers, $seen);
            $topologies[] = ['healthy' => $this->isHealthy($tree), 'source' => $tree];
        }

        return $topologies;
    }

    /**
     * @param  array<string, mixed>  $node
     * @param  array<string, array<int, array{replica: Server, link: array<string, mixed>}>>  $children
     * @param  array<string, bool>  $seen
     * @return array<string, mixed>
     */
    private function grow(array $node, string $key, array $children, Collection $servers, array &$seen): array
    {
        $seen[$key] = true;

        foreach ($children[$key] ?? [] as $child) {
            $childKey = 's'.$child['replica']->id;
            $replicaNode = $this->serverNode($child['replica']);
            $replicaNode['link'] = $child['link'];

            // A cycle (master-master) is drawn once and not followed again.
            $node['replicas'][] = isset($seen[$childKey])
                ? $replicaNode
                : $this->grow($replicaNode, $childKey, $children, $servers, $seen);
        }

        return $node;
    }

    /**
     * @param  array<string, mixed>  $node
     */
    private function isHealthy(array $node): bool
    {
        foreach ($node['replicas'] as $replica) {
            if (($replica['link']['state'] ?? 'ok') !== 'ok' || ! $this->isHealthy($replica)) {
                return false;
            }
        }

        return true;
    }

    /**
     * @return array<string, mixed>
     */
    private function serverNode(Server $server): array
    {
        $metric = $server->latestDatabaseMetric;

        return [
            'id' => $server->id,
            'name' => $server->name,
            'host' => $server->host,
            'port' => $server->port,
            'status' => $server->status->value,
            'version' => $metric?->version,
            'connections_percent' => $metric?->connectionsPercent(),
            'queries_per_second' => $metric?->queries_per_second !== null ? (float) $metric->queries_per_second : null,
            'external' => false,
            'link' => null,
            'replicas' => [],
        ];
    }

    /**
     * A source that replicas point at but that is not monitored here.
     *
     * @return array<string, mixed>
     */
    private function externalNode(string $address): array
    {
        [$host, $port] = array_pad(explode(':', $address, 2), 2, null);

        return [
            'id' => null, 'name' => $host, 'host' => $host, 'port' => $port !== null ? (int) $port : null, 'status' => 'unknown',
            'version' => null, 'connections_percent' => null, 'queries_per_second' => null,
            'external' => true, 'link' => null, 'replicas' => [],
        ];
    }

    /**
     * @return array{state: string, io_running: bool|null, sql_running: bool|null, lag_seconds: int|null, error: string|null}
     */
    private function link(DatabaseMetric $metric): array
    {
        $broken = $metric->replica_io_running === false || $metric->replica_sql_running === false;
        $lagging = $metric->replica_lag_seconds !== null && $metric->replica_lag_seconds >= self::LAG_WARNING_SECONDS;

        return [
            'state' => $broken ? 'broken' : ($lagging ? 'lagging' : 'ok'),
            'io_running' => $metric->replica_io_running,
            'sql_running' => $metric->replica_sql_running,
            'lag_seconds' => $metric->replica_lag_seconds,
            'error' => $metric->replica_error,
        ];
    }

    private function address(string $host, int $port): string
    {
        return mb_strtolower($host.':'.$port);
    }
}
