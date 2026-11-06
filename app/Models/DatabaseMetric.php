<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * One reading of the status of a MySQL server. The *_total columns are counters since the start of the server.
 *
 * @property int $id
 * @property int $server_id
 * @property Carbon $collected_at
 * @property string|null $version
 * @property int $uptime_seconds
 * @property int $threads_connected
 * @property int $threads_running
 * @property int $max_connections
 * @property int $questions_total
 * @property string|null $queries_per_second
 * @property int $slow_queries_total
 * @property int $aborted_connects_total
 * @property int|null $buffer_pool_size
 * @property int $bytes_received_total
 * @property int $bytes_sent_total
 * @property int $com_select_total
 * @property int $com_insert_total
 * @property int $com_update_total
 * @property int $com_delete_total
 * @property bool|null $replica_io_running
 * @property bool|null $replica_sql_running
 * @property int|null $replica_lag_seconds
 * @property string|null $replica_source
 * @property string|null $replica_error
 */
#[Fillable([
    'server_id', 'collected_at', 'version', 'uptime_seconds', 'threads_connected', 'threads_running', 'max_connections',
    'questions_total', 'queries_per_second', 'slow_queries_total', 'aborted_connects_total', 'buffer_pool_size',
    'bytes_received_total', 'bytes_sent_total', 'com_select_total', 'com_insert_total', 'com_update_total', 'com_delete_total',
    'replica_io_running', 'replica_sql_running', 'replica_lag_seconds', 'replica_source', 'replica_error',
])]
class DatabaseMetric extends Model
{
    use Prunable;

    public const RETENTION_DAYS = 30;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
            'replica_io_running' => 'boolean',
            'replica_sql_running' => 'boolean',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    /**
     * How much of the allowed connections are in use, in percent.
     */
    public function connectionsPercent(): float
    {
        return $this->max_connections > 0 ? round($this->threads_connected / $this->max_connections * 100, 1) : 0.0;
    }

    public function prunable(): Builder
    {
        return static::where('collected_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
