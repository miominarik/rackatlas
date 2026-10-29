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
    /** Mounts of the system itself (boot partitions, snap images, virtual file systems). Not data disks. */
    public const SYSTEM_MOUNTS = ['/boot', '/efi', '/run', '/snap', '/sys', '/dev', '/proc'];

    /** Smaller file systems (1 GiB) are no data disks and are not stored. */
    public const MIN_TOTAL_BYTES = 1073741824;

    public $timestamps = false;

    public static function isMonitored(string $device, string $mount, int $totalBytes): bool
    {
        if ($totalBytes < self::MIN_TOTAL_BYTES || str_starts_with($device, '/dev/loop')) {
            return false;
        }

        foreach (self::SYSTEM_MOUNTS as $system) {
            if ($mount === $system || str_starts_with($mount, $system.'/')) {
                return false;
            }
        }

        return true;
    }

    /**
     * The same rule for old rows in the database, which were stored before the system mounts were skipped.
     * Works on Eloquent and query builders.
     *
     * @template TBuilder of object
     *
     * @param  TBuilder  $query
     * @return TBuilder
     */
    public static function onlyMonitored(object $query, string $mountColumn = 'mount', string $deviceColumn = 'device', string $totalColumn = 'total_bytes'): object
    {
        $query->where($totalColumn, '>=', self::MIN_TOTAL_BYTES)->where($deviceColumn, 'not like', '/dev/loop%');

        foreach (self::SYSTEM_MOUNTS as $system) {
            $query->where($mountColumn, '!=', $system)->where($mountColumn, 'not like', $system.'/%');
        }

        return $query;
    }

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
