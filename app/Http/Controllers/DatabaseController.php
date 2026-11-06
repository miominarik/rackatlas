<?php

namespace App\Http\Controllers;

use App\Models\DatabaseMetric;
use App\Models\Server;
use App\Models\ServerError;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DatabaseController extends Controller
{
    /** The most points drawn in a chart, longer histories are thinned out. */
    private const MAX_POINTS = 120;

    /**
     * The MySQL servers of the current team with their latest reading.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('databases/index', ['team' => null]);
        }

        $servers = $team->servers()->mysql()->with('latestDatabaseMetric')->orderBy('name')->get();

        return Inertia::render('databases/index', [
            'team' => $team->only('id', 'name'),
            'canManage' => $request->user()->can('manage', $team),
            'databases' => $servers->map(fn (Server $server) => [
                'id' => $server->id,
                'name' => $server->name,
                'host' => $server->host,
                'port' => $server->port,
                'status' => $server->status->value,
                'last_checked_at' => $server->last_checked_at?->toIso8601String(),
                'metric' => $this->presentMetric($server->latestDatabaseMetric),
            ])->values(),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * One MySQL server: its latest reading, the last day as a chart and the latest errors.
     */
    public function show(Server $server): Response
    {
        abort_unless($server->isMysql(), 404);
        $this->authorize('view', $server->team);

        $server->load('latestDatabaseMetric');

        $history = $server->databaseMetrics()
            ->where('collected_at', '>=', now()->subDay())
            ->orderBy('collected_at')
            ->get();

        $step = max(1, (int) ceil($history->count() / self::MAX_POINTS));

        return Inertia::render('databases/show', [
            'database' => [
                'id' => $server->id,
                'name' => $server->name,
                'host' => $server->host,
                'port' => $server->port,
                'username' => $server->username,
                'status' => $server->status->value,
                'last_checked_at' => $server->last_checked_at?->toIso8601String(),
                'last_seen_at' => $server->last_seen_at?->toIso8601String(),
                'metric' => $this->presentMetric($server->latestDatabaseMetric),
            ],
            'canManage' => request()->user()->can('manage', $server->team),
            'history' => $history->values()->filter(fn ($metric, int $i) => $i % $step === 0)->values()
                ->map(fn (DatabaseMetric $metric) => [
                    'at' => $metric->collected_at->toIso8601String(),
                    'queries_per_second' => $metric->queries_per_second !== null ? (float) $metric->queries_per_second : null,
                    'threads_connected' => $metric->threads_connected,
                    'threads_running' => $metric->threads_running,
                ]),
            'errors' => $server->errors()->where('occurred_at', '>=', now()->subDays(7))->latest('occurred_at')->limit(10)->get()
                ->map(fn (ServerError $error) => [
                    'id' => $error->id,
                    'type' => $error->type->value,
                    'message' => $error->message,
                    'occurred_at' => $error->occurred_at->toIso8601String(),
                ]),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * @return array<string, mixed>|null
     */
    private function presentMetric(?DatabaseMetric $metric): ?array
    {
        if ($metric === null) {
            return null;
        }

        return [
            'collected_at' => $metric->collected_at->toIso8601String(),
            'version' => $metric->version,
            'uptime_seconds' => $metric->uptime_seconds,
            'threads_connected' => $metric->threads_connected,
            'threads_running' => $metric->threads_running,
            'max_connections' => $metric->max_connections,
            'connections_percent' => $metric->connectionsPercent(),
            'queries_per_second' => $metric->queries_per_second !== null ? (float) $metric->queries_per_second : null,
            'slow_queries_total' => $metric->slow_queries_total,
            'aborted_connects_total' => $metric->aborted_connects_total,
            'buffer_pool_size' => $metric->buffer_pool_size,
            'data_bytes' => $metric->data_bytes,
            'databases_count' => $metric->databases_count,
        ];
    }
}
