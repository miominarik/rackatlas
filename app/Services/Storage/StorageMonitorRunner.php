<?php

namespace App\Services\Storage;

use App\Enums\AlertType;
use App\Models\NotificationPreference;
use App\Models\StorageMonitor;
use App\Notifications\StorageAlertNotification;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Checks one container, stores the result and tells the team when it stops answering or comes back.
 */
class StorageMonitorRunner
{
    /** Failed checks in a row before the team is told, so one hiccup of the network is not an alert. */
    public const FAILURES_BEFORE_ALERT = 2;

    public function __construct(private readonly AzureBlobChecker $checker) {}

    public function run(StorageMonitor $monitor): void
    {
        $result = $this->checker->check($monitor);

        $monitor->checks()->create([
            'checked_at' => now(),
            'ok' => $result['ok'],
            'response_ms' => $result['response_ms'],
            'blob_count' => $result['blob_count'],
            'total_bytes' => $result['total_bytes'],
            'error' => $result['error'],
        ]);

        $failures = $result['ok'] ? 0 : $monitor->failures + 1;

        $monitor->forceFill([
            'status' => $result['ok']
                ? StorageMonitor::STATUS_ONLINE
                : ($failures >= self::FAILURES_BEFORE_ALERT ? StorageMonitor::STATUS_OFFLINE : $monitor->status),
            'last_checked_at' => now(),
            'last_ok_at' => $result['ok'] ? now() : $monitor->last_ok_at,
            'last_error' => $result['error'],
            'failures' => $failures,
            'response_ms' => $result['response_ms'],
            // A failed check keeps the last known size.
            'blob_count' => $result['ok'] ? $result['blob_count'] : $monitor->blob_count,
            'total_bytes' => $result['ok'] ? $result['total_bytes'] : $monitor->total_bytes,
            'is_partial' => $result['ok'] ? $result['partial'] : $monitor->is_partial,
        ])->save();

        $this->alert($monitor);
    }

    /**
     * One message when the container goes down and one when it is back, not one every few minutes.
     */
    private function alert(StorageMonitor $monitor): void
    {
        try {
            Cache::lock('alerts:storage:'.$monitor->id, 30)->get(function () use ($monitor) {
                if ($monitor->failures >= self::FAILURES_BEFORE_ALERT && $monitor->alert_opened_at === null) {
                    $monitor->forceFill(['alert_opened_at' => now()])->save();
                    $this->notify($monitor, false);
                } elseif ($monitor->failures === 0 && $monitor->alert_opened_at !== null) {
                    $monitor->forceFill(['alert_opened_at' => null])->save();
                    $this->notify($monitor, true);
                }
            });
        } catch (Throwable $e) {
            // A broken notification must never break the checks.
            report($e);
        }
    }

    private function notify(StorageMonitor $monitor, bool $resolved): void
    {
        $notification = new StorageAlertNotification($monitor->id, $monitor->name, (string) $monitor->last_error, $resolved);

        $monitor->team->members()->with('notificationPreference')->get()
            ->filter(fn ($user) => NotificationPreference::for($user)->wants(AlertType::Offline, $resolved) && $notification->via($user) !== [])
            ->each(fn ($user) => $user->notify($notification));
    }
}
