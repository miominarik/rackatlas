<?php

namespace App\Services\Redis;

/**
 * Turns the text answers of Redis (INFO, CLUSTER INFO, CLUSTER NODES) into the values we store. Used for the
 * answers read directly by the app and for the ones sent by the agent.
 */
class RedisParser
{
    /**
     * Lines "key:value" as an array. Comment lines are skipped.
     *
     * @return array<string, string>
     */
    public function keyValues(string $raw): array
    {
        $values = [];

        foreach (preg_split('/\r?\n/', $raw) ?: [] as $line) {
            $line = trim($line);

            if ($line === '' || $line[0] === '#' || ! str_contains($line, ':')) {
                continue;
            }

            [$key, $value] = explode(':', $line, 2);
            $values[$key] = $value;
        }

        return $values;
    }

    /**
     * The columns of a redis_metrics row (without server and time) from the parsed INFO.
     *
     * @param  array<string, string>  $info
     * @return array<string, mixed>
     */
    public function metric(array $info, int $maxClients = 0): array
    {
        $persistence = array_filter([
            $info['rdb_last_bgsave_status'] ?? null,
            $info['aof_last_write_status'] ?? null,
            $info['aof_last_bgrewrite_status'] ?? null,
        ]);

        return [
            'port' => (int) ($info['rackatlas_port'] ?? $info['tcp_port'] ?? 0) ?: null,
            'version' => mb_substr((string) ($info['redis_version'] ?? ''), 0, 50) ?: null,
            'role' => mb_substr((string) ($info['role'] ?? ''), 0, 20) ?: null,
            'uptime_seconds' => (int) ($info['uptime_in_seconds'] ?? 0),
            'connected_clients' => (int) ($info['connected_clients'] ?? 0),
            'blocked_clients' => (int) ($info['blocked_clients'] ?? 0),
            'max_clients' => (int) ($info['maxclients'] ?? 0) ?: $maxClients,
            'used_memory' => (int) ($info['used_memory'] ?? 0),
            'max_memory' => (int) ($info['maxmemory'] ?? 0),
            'used_memory_rss' => (int) ($info['used_memory_rss'] ?? 0),
            'commands_total' => (int) ($info['total_commands_processed'] ?? 0),
            'keyspace_hits_total' => (int) ($info['keyspace_hits'] ?? 0),
            'keyspace_misses_total' => (int) ($info['keyspace_misses'] ?? 0),
            'evicted_keys_total' => (int) ($info['evicted_keys'] ?? 0),
            'rejected_connections_total' => (int) ($info['rejected_connections'] ?? 0),
            'keys_count' => $this->keysCount($info),
            'connected_replicas' => (int) ($info['connected_slaves'] ?? 0),
            'master_host' => isset($info['master_host']) ? mb_substr($info['master_host'].':'.($info['master_port'] ?? ''), 0, 255) : null,
            'master_link_status' => isset($info['master_link_status']) ? mb_substr((string) $info['master_link_status'], 0, 20) : null,
            'master_last_io_seconds_ago' => isset($info['master_last_io_seconds_ago']) ? (int) $info['master_last_io_seconds_ago'] : null,
            'persistence_ok' => $persistence === [] ? null : array_unique($persistence) === ['ok'],
        ];
    }

    /**
     * The number of keys in all databases, from the lines "db0:keys=3,expires=0,avg_ttl=0".
     *
     * @param  array<string, string>  $info
     */
    public function keysCount(array $info): int
    {
        $keys = 0;

        foreach ($info as $name => $value) {
            if (preg_match('/^db\d+$/', $name) === 1 && preg_match('/keys=(\d+)/', $value, $match) === 1) {
                $keys += (int) $match[1];
            }
        }

        return $keys;
    }

    /**
     * The state of the cluster as one node sees it, or null when the answers are empty.
     *
     * @return array{state: string, slots_assigned: int, slots_ok: int, slots_pfail: int, slots_fail: int, known_nodes: int, size: int, current_epoch: int, myself: string|null, nodes: array<int, array<string, mixed>>}|null
     */
    public function cluster(string $info, string $nodes): ?array
    {
        $values = $this->keyValues($info);

        if (! isset($values['cluster_state'])) {
            return null;
        }

        $parsedNodes = $this->clusterNodes($nodes);

        return [
            'state' => mb_substr(trim($values['cluster_state']), 0, 20),
            'slots_assigned' => (int) ($values['cluster_slots_assigned'] ?? 0),
            'slots_ok' => (int) ($values['cluster_slots_ok'] ?? 0),
            'slots_pfail' => (int) ($values['cluster_slots_pfail'] ?? 0),
            'slots_fail' => (int) ($values['cluster_slots_fail'] ?? 0),
            'known_nodes' => (int) ($values['cluster_known_nodes'] ?? 0),
            'size' => (int) ($values['cluster_size'] ?? 0),
            'current_epoch' => (int) ($values['cluster_current_epoch'] ?? 0),
            'myself' => collect($parsedNodes)->firstWhere('myself', true)['id'] ?? null,
            'nodes' => $parsedNodes,
        ];
    }

    /**
     * The lines of CLUSTER NODES: id address flags master ping-sent pong-recv epoch link-state slots...
     *
     * @return array<int, array{id: string, address: string, flags: array<int, string>, myself: bool, master_id: string|null, link_state: string, config_epoch: int, slots: int, migrating: bool}>
     */
    public function clusterNodes(string $raw): array
    {
        $nodes = [];

        foreach (preg_split('/\r?\n/', $raw) ?: [] as $line) {
            $parts = preg_split('/\s+/', trim($line)) ?: [];

            if (count($parts) < 8 || ! preg_match('/^[0-9a-f]{40}$/', $parts[0])) {
                continue;
            }

            $flags = explode(',', $parts[2]);
            $slots = 0;
            $migrating = false;

            foreach (array_slice($parts, 8) as $range) {
                if ($range[0] === '[') {
                    $migrating = true;

                    continue;
                }

                [$from, $to] = array_pad(explode('-', $range, 2), 2, null);
                $slots += $to === null ? 1 : max(0, (int) $to - (int) $from + 1);
            }

            $nodes[] = [
                'id' => $parts[0],
                // "ip:port@cport,hostname": keep only ip:port
                'address' => mb_substr(explode('@', $parts[1])[0], 0, 255),
                'flags' => $flags,
                'myself' => in_array('myself', $flags, true),
                'master_id' => $parts[3] === '-' ? null : $parts[3],
                'link_state' => $parts[7],
                'config_epoch' => (int) $parts[6],
                'slots' => $slots,
                'migrating' => $migrating,
            ];
        }

        return $nodes;
    }
}
