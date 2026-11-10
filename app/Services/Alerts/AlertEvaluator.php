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

    /** Percent of connections or memory in use at which a database or Redis alert is raised. */
    private const SATURATION_LIMIT = 90;

    /** A replica this many seconds behind its source raises an alert. */
    private const REPLICA_LAG_LIMIT = 300;

    /** A reading older than this is no longer proof that a database or Redis problem is gone. */
    private const FRESH_MINUTES = 5;

    /**
     * Compare the current state of the server with its open alerts. Safe to call as often
     * as needed: at most one evaluation of a server runs at a time.
     */
    public function evaluate(Server $server): void
    {
        // Maintenance: nothing is opened or resolved, so the state is judged again once it ends.
        if ($server->in_maintenance) {
            return;
        }

        try {
            Cache::lock('alerts:server:'.$server->id, 30)->get(function () use ($server) {
                $fresh = $server->fresh();

                if (! $fresh->in_maintenance) {
                    $this->sync($fresh);
                }
            });
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

        if ($server->in_maintenance || $server->ignoresAlert('logs') || $critical === [] || ! Cache::add('alerts:log:'.$server->id, true, now()->addMinutes(self::LOG_THROTTLE_MINUTES))) {
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
            if (isset($detected[$key]) || ($offline && $key !== 'offline') || ($server->status === ServerStatus::Unknown) || ! $this->hasFreshReading($server, $key)) {
                continue;
            }

            $alert->update(['resolved_at' => now()]);

            // A source that was switched off meanwhile is closed without a message.
            if (! $server->ignoresAlert($this->source($key))) {
                $this->notify($server, $alert->type, $key, $alert->context ?? [], true);
            }
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
                if ($server->ignoresAlert($key)) {
                    continue;
                }

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

            foreach ($server->ignoresAlert('disk') ? [] : $latest->disks as $disk) {
                $key = 'disk:'.$disk->mount;
                $percent = $disk->usedPercent();
                $over = in_array($key, $openKeys, true) ? $percent >= $diskLimit - self::HYSTERESIS : $percent >= $diskLimit;

                if ($over) {
                    $found[$key] = [AlertType::Resource, ['mount' => $disk->mount, 'value' => (int) round($percent), 'limit' => $diskLimit]];
                }
            }
        }

        foreach ($server->ignoresAlert('services') ? [] : $server->failed_units ?? [] as $unit) {
            $found['unit:'.$unit] = [AlertType::Service, ['unit' => $unit]];
        }

        return $found + $this->detectDatabase($server, $openKeys) + $this->detectRedis($server, $openKeys);
    }

    /**
     * Connections running out and a broken or lagging replica, judged from the newest reading.
     *
     * @param  array<int, string>  $openKeys
     * @return array<string, array{0: AlertType, 1: array<string, mixed>}>
     */
    private function detectDatabase(Server $server, array $openKeys): array
    {
        $metric = $server->databaseMetrics()->where('collected_at', '>=', now()->subMinutes(self::FRESH_MINUTES))->latest('collected_at')->first();

        if ($metric === null) {
            return [];
        }

        $found = [];
        $connections = $metric->connectionsPercent();
        $limit = self::SATURATION_LIMIT;

        if ($connections >= (in_array('db:connections', $openKeys, true) ? $limit - self::HYSTERESIS : $limit)) {
            $found['db:connections'] = [AlertType::Database, ['value' => (int) round($connections), 'limit' => $limit]];
        }

        if ($metric->replica_io_running === false || $metric->replica_sql_running === false) {
            $found['db:replication'] = [AlertType::Database, ['error' => mb_substr((string) $metric->replica_error, 0, 300)]];
        }

        $lagLimit = in_array('db:lag', $openKeys, true) ? self::REPLICA_LAG_LIMIT * 0.8 : self::REPLICA_LAG_LIMIT;

        if ($metric->replica_lag_seconds !== null && $metric->replica_lag_seconds >= $lagLimit) {
            $found['db:lag'] = [AlertType::Database, ['seconds' => $metric->replica_lag_seconds]];
        }

        return $found;
    }

    /**
     * Memory, replication, saving to disk and cluster state of every Redis instance of the server.
     *
     * @param  array<int, string>  $openKeys
     * @return array<string, array{0: AlertType, 1: array<string, mixed>}>
     */
    private function detectRedis(Server $server, array $openKeys): array
    {
        $found = [];
        $limit = self::SATURATION_LIMIT;

        $metrics = $server->redisMetrics()->where('collected_at', '>=', now()->subMinutes(self::FRESH_MINUTES))
            ->latest('collected_at')->get()->unique('port');

        foreach ($metrics as $metric) {
            $port = (int) $metric->port;
            $memory = $metric->memoryPercent();

            if ($memory !== null && $memory >= (in_array('redis:memory:'.$port, $openKeys, true) ? $limit - self::HYSTERESIS : $limit)) {
                $found['redis:memory:'.$port] = [AlertType::Redis, ['port' => $port, 'value' => (int) round($memory), 'limit' => $limit]];
            }

            if ($metric->role === 'replica' && $metric->master_link_status === 'down') {
                $found['redis:replication:'.$port] = [AlertType::Redis, ['port' => $port]];
            }

            if ($metric->persistence_ok === false) {
                $found['redis:persistence:'.$port] = [AlertType::Redis, ['port' => $port]];
            }

            $state = $metric->cluster['state'] ?? null;

            if ($state !== null && $state !== 'ok') {
                $found['redis:cluster:'.$port] = [AlertType::Redis, ['port' => $port, 'state' => $state]];
            }
        }

        return $found;
    }

    /**
     * Whether the newest reading is recent enough to say a database or Redis problem is gone.
     * Other alerts are always judged.
     */
    private function hasFreshReading(Server $server, string $key): bool
    {
        $since = now()->subMinutes(self::FRESH_MINUTES);

        if (str_starts_with($key, 'db:')) {
            return $server->databaseMetrics()->where('collected_at', '>=', $since)->exists();
        }

        if (preg_match('/^redis:[a-z]+:(\d+)$/', $key, $match) === 1) {
            $port = (int) $match[1];

            return $server->redisMetrics()->where('collected_at', '>=', $since)
                ->where(fn ($query) => $query->where('port', $port)->when($port === 0, fn ($query) => $query->orWhereNull('port')))
                ->exists();
        }

        return true;
    }

    /**
     * The source of warnings an alert key belongs to, the same names as in the settings of the server.
     */
    private function source(string $key): string
    {
        return match (true) {
            str_starts_with($key, 'disk:') => 'disk',
            str_starts_with($key, 'unit:') => 'services',
            default => $key,
        };
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
