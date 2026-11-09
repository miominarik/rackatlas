<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Services\Metrics\FleetReport;
use App\Services\Metrics\MetricsReport;
use App\Support\DashboardSettings;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MetricsController extends Controller
{
    /**
     * Detailed history and current state of one server of the current team.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('metrics', ['team' => null]);
        }

        $validated = $request->validate([
            'server' => ['nullable', 'string', 'regex:/^(all|\d+)$/'],
            'range' => ['nullable', 'in:'.implode(',', array_keys(MetricsReport::RANGES))],
        ]);

        $servers = $team->machines()->orderBy('name')->get(['id', 'name', 'status', 'auth_type', 'agent_version', 'last_seen_at', 'last_checked_at']);

        $range = $validated['range'] ?? '24h';
        $requested = $validated['server'] ?? 'all';

        if ($requested === 'all' && $servers->isNotEmpty()) {
            return Inertia::render('metrics', [
                'team' => $team->only('id', 'name'),
                'servers' => $servers->map(fn (Server $s) => ['id' => $s->id, 'name' => $s->name])->values(),
                'server' => null,
                'range' => $range,
                'ranges' => array_keys(MetricsReport::RANGES),
                'thresholds' => DashboardSettings::defaults()['thresholds'],
                'fleet' => (new FleetReport(
                    $team->machines()->with('latestMetric.disks')->orderBy('name')->get(),
                    $range,
                ))->build(),
            ]);
        }

        /** @var Server|null $server */
        $server = $servers->firstWhere('id', (int) $requested) ?? $servers->first();

        return Inertia::render('metrics', [
            'team' => $team->only('id', 'name'),
            'servers' => $servers->map(fn (Server $s) => ['id' => $s->id, 'name' => $s->name])->values(),
            'server' => $server ? [
                'id' => $server->id,
                'name' => $server->name,
                'status' => $server->status->value,
                'auth_type' => $server->auth_type->value,
                'agent_version' => $server->agent_version,
                'last_seen_at' => $server->last_seen_at?->toIso8601String(),
            ] : null,
            'range' => $range,
            'ranges' => array_keys(MetricsReport::RANGES),
            'thresholds' => DashboardSettings::defaults()['thresholds'],
            'fleet' => null,
            'current' => $server ? MetricsReport::current($server) : null,
            'report' => $server ? (new MetricsReport($server, $range))->build() : null,
        ]);
    }
}
