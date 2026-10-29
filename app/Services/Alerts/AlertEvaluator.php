<?php

namespace App\Services\Alerts;

use App\Console\Commands\CheckAgentsCommand;
use App\Enums\AlertType;
use App\Enums\ServerStatus;
use App\Models\NotificationPreference;
use App\Models\Server;
use App\Notifications\ServerAlertNotification;
use App\Support\DashboardSettings;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Decides whether a server has a problem and tells the people of its team.
 *
 * A problem is opened once and stays open until it is gone, so a user gets one message when
 * it starts and one when it is over, not one every minute.
 */
class AlertEvaluator
{
    /** Consecutive samples above the limit before CPU or memory raises an alert. */
    private const SAMPLES = 3;

    /** A value must fall this many points below the limit before the alert closes. */
    private const HYSTERESIS = 3;

    private const LOG_THROTTLE_MINUTES = 15;

    /**
     * Compare the current state of the server with its open alerts. Safe to call as often
     * as needed: at most one evaluation of a server runs at a time.
     */
    public function evaluate(Server $server): void
    {
        try {
            Cache::lock('alerts:server:'.$server->id, 30)->get(fn () => $this->sync($server->fresh()));
        } catch (Throwable $e) {
            // A broken notification must never break the collection of metrics.
            report($e);
        }
    }

    /**
     * Tell the team about serious entries that just arrived in the log of the server.
     * Many entries at once (a crash loop) are sent as one message every few minutes.
     *
     * @param  array<int, array<string, mixed>>  $entries
     */
    public function notifyLogs(Server $server, array $entries): void
    {
        $critical = array_values(array_filter(
            $entries,
            fn (array $entry) => $entry['level'] === 'critical' && $entry['source'] !== 'systemd',
        ));

        if ($critical === [] || ! Cache::add('alerts:log:'.$server->id, true, now()->addMinutes(self::LOG_THROTTLE_MINUTES))) {
            return;
        }

        try {
            $this->notify($server, AlertType::Log, 'log', [
                'message' => mb_substr((string) $critical[0]['message'], 0, 300),
                'count' => count($critical),
            ], false);
        } catch (Throwable $e) {
            report($e);
        }
    }

    private function sync(Server $server): void
    {
        $open = $server->alerts()->whereNull('resolved_at')->get()->keyBy('key');

        // An offline server has no fresh data, so only the "offline" alert is judged.
        $offline = $server->status === ServerStatus::Offline;
        $detected = $offline ? $this->detectOffline($server) : $this->detectProblems($server, $open->keys()->all());

        foreach ($detected as $key => [$type, $context]) {
            if ($open->has($key)) {
                continue;
            }

            $server->alerts()->create([
                'type' => $type,
                'key' => $key,
                'context' => $context,
                'opened_at' => now(),
            ]);

            $this->notify($server, $type, $key, $context, false);
        }

        foreach ($open as $key => $alert) {
            if (isset($detected[$key]) || ($offline && $key !== 'offline') || ($server->status === ServerStatus::Unknown)) {
                continue;
            }

            $alert->update(['resolved_at' => now()]);

            $this->notify($server, $alert->type, $key, $alert->context ?? [], true);
        }
    }

    /**
     * @return array<string, array{0: AlertType, 1: array<string, mixed>}>
     */
    private function detectOffline(Server $server): array
    {
        $since = $server->last_seen_at ?? $server->created_at;

        if ($since === null || $since->gt(now()->subMinutes(CheckAgentsCommand::SILENT_MINUTES))) {
            return [];
        }

        return ['offline' => [AlertType::Offline, ['minutes' => (int) floor($since->diffInMinutes(now(), true))]]];
    }

    /**
     * @param  array<int, string>  $openKeys
     * @return array<string, array{0: AlertType, 1: array<string, mixed>}>
     */
    private function detectProblems(Server $server, array $openKeys): array
    {
        $found = [];
        $limits = DashboardSettings::defaults()['thresholds'];

        $metrics = $server->metrics()->latest('collected_at')->limit(self::SAMPLES)->get();
        $latest = $metrics->first();

        if ($latest !== null) {
            $series = [
                'cpu' => $metrics->map(fn ($m) => (float) $m->cpu_percent),
                'ram' => $metrics->map(fn ($m) => $m->memory_total > 0 ? $m->memory_used / $m->memory_total * 100 : 0.0),
            ];

            foreach ($series as $key => $values) {
                $limit = $limits[$key]['critical'];
                $now = $values->first();
                $isOpen = in_array($key, $openKeys, true);

                $over = $isOpen
                    ? $now >= $limit - self::HYSTERESIS
                    : $values->count() >= self::SAMPLES && $values->every(fn ($v) => $v >= $limit);

                if ($over) {
                    $found[$key] = [AlertType::Resource, ['value' => (int) round($now), 'limit' => $limit]];
                }
            }

            $diskLimit = $limits['disk']['critical'];

            foreach ($latest->disks as $disk) {
                $key = 'disk:'.$disk->mount;
                $percent = $disk->usedPercent();
                $over = in_array($key, $openKeys, true) ? $percent >= $diskLimit - self::HYSTERESIS : $percent >= $diskLimit;

                if ($over) {
                    $found[$key] = [AlertType::Resource, ['mount' => $disk->mount, 'value' => (int) round($percent), 'limit' => $diskLimit]];
                }
            }
        }

        foreach ($server->failed_units ?? [] as $unit) {
            $found['unit:'.$unit] = [AlertType::Service, ['unit' => $unit]];
        }

        return $found;
    }

    /**
     * @param  array<string, mixed>  $context
     */
    private function notify(Server $server, AlertType $type, string $key, array $context, bool $resolved): void
    {
        $notification = new ServerAlertNotification($server->name, $type, $key, $context, $resolved);

        $server->team->members()->with('notificationPreference')->get()
            ->filter(fn ($user) => NotificationPreference::for($user)->wants($type, $resolved) && $notification->via($user) !== [])
            ->each(fn ($user) => $user->notify($notification));

        Log::info('Server alert '.($resolved ? 'resolved' : 'opened'), ['server' => $server->id, 'key' => $key]);
    }
}
