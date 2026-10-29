<?php

namespace App\Http\Controllers;

use App\Http\Requests\UpdateDashboardRequest;
use App\Models\DashboardPreference;
use App\Models\Server;
use App\Models\ServerError;
use App\Models\ServerLog;
use App\Models\ServerMetric;
use App\Models\ServerMetricDisk;
use App\Support\DashboardSettings;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
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

        $preference = DashboardPreference::where('user_id', $user->id)->where('team_id', $team->id)->first();

        return Inertia::render('dashboard', [
            'team' => $team->only('id', 'name'),
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
     * Save the dashboard layout of the signed-in user for the current team.
     */
    public function update(UpdateDashboardRequest $request): RedirectResponse
    {
        $team = $request->user()->currentTeam();

        DashboardPreference::updateOrCreate(
            ['user_id' => $request->user()->id, 'team_id' => $team->id],
            ['settings' => DashboardSettings::resolve($request->validated())],
        );

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Dashboard saved.')]);

        return back();
    }

    /**
     * Go back to the default layout.
     */
    public function reset(Request $request): RedirectResponse
    {
        $team = $request->user()->currentTeam();

        DashboardPreference::where('user_id', $request->user()->id)->where('team_id', $team?->id)->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Dashboard reset to the defaults.')]);

        return back();
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
     * @param  \Illuminate\Support\Collection<int, Server>  $servers
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
     * @param  \Illuminate\Support\Collection<int, Server>  $servers
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
     */
    private function recentLogs($servers)
    {
        $names = $servers->pluck('name', 'id');

        return ServerLog::query()
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
     * @param  \Illuminate\Support\Collection<int, Server>  $servers
     * @return \Illuminate\Support\Collection<int, array<string, mixed>>
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
