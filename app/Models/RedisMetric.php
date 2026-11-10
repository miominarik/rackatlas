<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One reading of the status of a Redis server. The *_total columns are counters since the start of the server.
 *
 * @property int $id
 * @property int $server_id
 * @property Carbon $collected_at
 * @property int|null $port The port of the Redis instance, a server can run more of them
 * @property string|null $version
 * @property string|null $role master or replica
 * @property int $uptime_seconds
 * @property int $connected_clients
 * @property int $blocked_clients
 * @property int $max_clients
 * @property int $used_memory
 * @property int $max_memory 0 means no limit
 * @property int $used_memory_rss
 * @property int $commands_total
 * @property string|null $commands_per_second
 * @property int $keyspace_hits_total
 * @property int $keyspace_misses_total
 * @property int $evicted_keys_total
 * @property int $rejected_connections_total
 * @property int $keys_count
 * @property int $connected_replicas
 * @property string|null $master_host
 * @property string|null $master_link_status up or down, on a replica
 * @property int|null $master_last_io_seconds_ago
 * @property bool|null $persistence_ok Whether the last save to disk worked, null when persistence is off
 * @property array<string, mixed>|null $cluster The cluster as this node sees it, null when the server is not a cluster node, see RedisParser::cluster()
 */
#[Fillable([
    'server_id', 'port', 'collected_at', 'version', 'role', 'uptime_seconds', 'connected_clients', 'blocked_clients', 'max_clients',
    'used_memory', 'max_memory', 'used_memory_rss', 'commands_total', 'commands_per_second', 'keyspace_hits_total',
    'keyspace_misses_total', 'evicted_keys_total', 'rejected_connections_total', 'keys_count', 'connected_replicas',
    'master_host', 'master_link_status', 'master_last_io_seconds_ago', 'persistence_ok', 'cluster',
])]
class RedisMetric extends Model
{
    use Prunable;

    public const RETENTION_DAYS = 30;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
            'persistence_ok' => 'boolean',
            'cluster' => 'array',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    /**
     * How much of the memory limit is used, in percent. Without a limit there is no value.
     */
    public function memoryPercent(): ?float
    {
        return $this->max_memory > 0 ? round($this->used_memory / $this->max_memory * 100, 1) : null;
    }

    /**
     * How many of the lookups found their key, in percent. Without lookups there is no value.
     */
    public function hitRatePercent(): ?float
    {
        $lookups = $this->keyspace_hits_total + $this->keyspace_misses_total;

        return $lookups > 0 ? round($this->keyspace_hits_total / $lookups * 100, 1) : null;
    }

    public function prunable(): Builder
    {
        return static::where('collected_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
