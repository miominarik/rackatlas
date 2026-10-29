<?php

namespace App\Http\Controllers;

use App\Http\Middleware\TrackDevice;
use App\Http\Requests\UpdateDashboardRequest;
use App\Models\DashboardPreference;
use App\Models\Server;
use App\Models\ServerError;
use App\Models\ServerLog;
use App\Models\ServerMetric;
use App\Models\ServerMetricDisk;
use App\Models\Team;
use App\Models\User;
use App\Models\UserDevice;
use App\Support\DashboardSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    private const HISTORY_MINUTES = 60;

    private const ERROR_HOURS = 24;

    /**
     * One screen with the state of all servers of the current team.
     */
    public function show(Request $request): Response
    {
        $user = $request->user();
        $team = $user->currentTeam();

        if ($team === null) {
            return Inertia::render('dashboard', ['team' => null]);
        }

        $servers = $team->servers()
            ->with(['category', 'latestMetric.disks'])
            ->orderBy('name')
            ->get();

        $device = TrackDevice::current($request);
        $preference = $this->preference($user, $team, $device);

        return Inertia::render('dashboard', [
            'team' => $team->only('id', 'name'),
            'device' => $device ? ['id' => $device->id, 'label' => $device->label()] : null,
            'other_devices' => $this->otherDevices($user, $team, $device),
            'settings' => DashboardSettings::resolve($preference?->settings),
            'defaults' => DashboardSettings::defaults(),
            'generated_at' => now()->toIso8601String(),
            'servers' => $servers->map(fn (Server $server) => $this->presentServer($server))->values(),
            'history' => $this->history($servers),
            'errors' => $this->recentErrors($servers),
            'logs' => $this->recentLogs($servers),
        ]);
    }

    /**
     * Save the dashboard layout of the device the user is on, for the current team.
     */
    public function update(UpdateDashboardRequest $request): RedirectResponse
    {
        $this->store($request, DashboardSettings::resolve($request->validated()));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Dashboard saved for this device.')]);

        return back();
    }

    /**
     * Go back to the default layout on this device.
     */
    public function reset(Request $request): RedirectResponse
    {
        $this->store($request, DashboardSettings::defaults());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Dashboard reset to the defaults.')]);

        return back();
    }

    /**
     * Take over the layout of another device of the user.
     */
    public function copy(Request $request): RedirectResponse
    {
        $validated = $request->validate(['device_id' => ['required', 'integer']]);

        $user = $request->user();
        $team = $user->currentTeam();
        $source = $user->devices()->active()->findOrFail($validated['device_id']);

        abort_if($team === null, 404);

        $preference = $this->preference($user, $team, $source);

        $this->store($request, DashboardSettings::resolve($preference?->settings));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Layout copied from :device.', ['device' => $source->label()])]);

        return back();
    }

    /**
     * The layout of this device, otherwise the old layout of the account, otherwise nothing (defaults).
     */
    private function preference(User $user, Team $team, ?UserDevice $device): ?DashboardPreference
    {
        $query = fn () => DashboardPreference::where('user_id', $user->id)->where('team_id', $team->id);

        return ($device ? $query()->where('device_id', $device->id)->first() : null)
            ?? $query()->whereNull('device_id')->first();
    }

    /**
     * Other devices of the user that have their own layout for this team, to copy from.
     *
     * @return array<int, array{id: int, label: string}>
     */
    private function otherDevices(User $user, Team $team, ?UserDevice $device): array
    {
        return $user->devices()->active()
            ->when($device, fn ($query) => $query->whereKeyNot($device->id))
            ->whereIn('id', DashboardPreference::where('user_id', $user->id)->where('team_id', $team->id)->whereNotNull('device_id')->select('device_id'))
            ->orderByDesc('last_active_at')
            ->get()
            ->map(fn (UserDevice $other) => ['id' => $other->id, 'label' => $other->label()])
            ->all();
    }

    /**
     * @param  array<string, mixed>  $settings
     */
    private function store(Request $request, array $settings): void
    {
        $team = $request->user()->currentTeam();

        abort_if($team === null, 404);

        DashboardPreference::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'team_id' => $team->id,
                'device_id' => TrackDevice::current($request)?->id,
            ],
            ['settings' => $settings],
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function presentServer(Server $server): array
    {
        $metric = $server->latestMetric;

        return [
            'id' => $server->id,
            'name' => $server->name,
            'host' => $server->host,
            'port' => $server->port,
            'username' => $server->username,
            'status' => $server->status->value,
            'auth_type' => $server->auth_type->value,
            'failed_units' => $server->failed_units ?? [],
            'category' => $server->category?->only('id', 'name', 'color'),
            'last_checked_at' => $server->last_checked_at?->toIso8601String(),
            'last_seen_at' => $server->last_seen_at?->toIso8601String(),
            'metrics' => $metric ? [
                'collected_at' => $metric->collected_at->toIso8601String(),
                'cpu_percent' => (float) $metric->cpu_percent,
                'cpu_cores' => $metric->cpu_cores,
                'load_1' => (float) $metric->load_1,
                'load_5' => (float) $metric->load_5,
                'load_15' => (float) $metric->load_15,
                'memory_total' => $metric->memory_total,
                'memory_used' => $metric->memory_used,
                'swap_total' => $metric->swap_total,
                'swap_used' => $metric->swap_used,
                'uptime_seconds' => $metric->uptime_seconds,
                'disks' => $metric->disks->map(fn (ServerMetricDisk $disk) => [
                    'mount' => $disk->mount,
                    'filesystem' => $disk->filesystem,
                    'total_bytes' => $disk->total_bytes,
                    'used_bytes' => $disk->used_bytes,
                ])->values(),
            ] : null,
        ];
    }

    /**
     * CPU and memory of the last hour per server, for the small charts.
     *
     * @param  Collection<int, Server>  $servers
     * @return array<int, array<int, array{cpu: float, ram: float}>>
     */
    private function history($servers): array
    {
        return ServerMetric::query()
            ->whereIn('server_id', $servers->pluck('id'))
            ->where('collected_at', '>=', now()->subMinutes(self::HISTORY_MINUTES))
            ->orderBy('collected_at')
            ->get(['server_id', 'cpu_percent', 'memory_total', 'memory_used'])
            ->groupBy('server_id')
            ->map(fn ($rows) => $rows->map(fn (ServerMetric $row) => [
                'cpu' => (float) $row->cpu_percent,
                'ram' => $row->memory_total > 0 ? round($row->memory_used / $row->memory_total * 100, 1) : 0,
            ])->values())
            ->all();
    }

    /**
     * The newest serious entries from the logs of the servers (agent only).
     *
     * @param  Collection<int, Server>  $servers
     * @return Collection<int, array<string, mixed>>
     */
    private function recentLogs($servers)
    {
        $names = $servers->pluck('name', 'id');

        return ServerLog::query()
            ->open()
            ->whereIn('server_id', $servers->pluck('id'))
            ->where('occurred_at', '>=', now()->subHours(self::ERROR_HOURS))
            ->orderByDesc('occurred_at')
            ->limit(10)
            ->get()
            ->map(fn (ServerLog $log) => [
                'id' => $log->id,
                'server_id' => $log->server_id,
                'server_name' => $names[$log->server_id] ?? '',
                'level' => $log->level,
                'source' => $log->source,
                'message' => $log->message,
                'count' => $log->count,
                'occurred_at' => $log->occurred_at->toIso8601String(),
            ]);
    }

    /**
     * @param  Collection<int, Server>  $servers
     * @return Collection<int, array<string, mixed>>
     */
    private function recentErrors($servers)
    {
        $names = $servers->pluck('name', 'id');

        return ServerError::query()
            ->whereIn('server_id', $servers->pluck('id'))
            ->where('occurred_at', '>=', now()->subHours(self::ERROR_HOURS))
            ->latest('occurred_at')
            ->limit(10)
            ->get()
            ->map(fn (ServerError $error) => [
                'id' => $error->id,
                'server_id' => $error->server_id,
                'server_name' => $names[$error->server_id] ?? '',
                'type' => $error->type->value,
                'message' => $error->message,
                'occurred_at' => $error->occurred_at->toIso8601String(),
            ]);
    }
}
