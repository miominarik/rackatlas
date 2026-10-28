<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $server_id
 * @property \Illuminate\Support\Carbon $collected_at
 * @property string $cpu_percent
 * @property int $cpu_cores
 * @property string $load_1
 * @property string $load_5
 * @property string $load_15
 * @property int $memory_total
 * @property int $memory_used
 * @property int $swap_total
 * @property int $swap_used
 * @property int $uptime_seconds
 */
#[Fillable([
    'server_id', 'collected_at', 'cpu_percent', 'cpu_cores', 'load_1', 'load_5', 'load_15',
    'memory_total', 'memory_used', 'swap_total', 'swap_used', 'uptime_seconds',
])]
class ServerMetric extends Model
{
    use Prunable;

    public const RETENTION_DAYS = 30;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'collected_at' => 'datetime',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function disks(): HasMany
    {
        return $this->hasMany(ServerMetricDisk::class);
    }

    public function prunable(): Builder
    {
        return static::where('collected_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
