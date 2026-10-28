<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $server_metric_id
 * @property string $device
 * @property string $mount
 * @property string $filesystem
 * @property int $total_bytes
 * @property int $used_bytes
 */
#[Fillable(['server_metric_id', 'device', 'mount', 'filesystem', 'total_bytes', 'used_bytes'])]
class ServerMetricDisk extends Model
{
    public $timestamps = false;

    public function metric(): BelongsTo
    {
        return $this->belongsTo(ServerMetric::class, 'server_metric_id');
    }

    public function usedPercent(): float
    {
        return $this->total_bytes > 0
            ? round($this->used_bytes / $this->total_bytes * 100, 1)
            : 0.0;
    }
}
