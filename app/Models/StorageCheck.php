<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * The result of one check of a storage container, kept for the charts.
 *
 * @property int $id
 * @property int $storage_monitor_id
 * @property Carbon $checked_at
 * @property bool $ok
 * @property int|null $response_ms
 * @property int|null $blob_count
 * @property int|null $total_bytes
 * @property string|null $error
 */
#[Fillable(['storage_monitor_id', 'checked_at', 'ok', 'response_ms', 'blob_count', 'total_bytes', 'error'])]
class StorageCheck extends Model
{
    use Prunable;

    public const RETENTION_DAYS = 35;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'checked_at' => 'datetime',
            'ok' => 'boolean',
        ];
    }

    public function storageMonitor(): BelongsTo
    {
        return $this->belongsTo(StorageMonitor::class);
    }

    public function prunable(): Builder
    {
        return static::where('checked_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
