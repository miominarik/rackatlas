<?php

namespace App\Http\Controllers;

use App\Models\DatabaseMetric;
use App\Models\Server;
use App\Models\ServerError;
use App\Services\Database\ReplicationTopology;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DatabaseController extends Controller
{
    /** The most points drawn in a chart, longer histories are thinned out. */
    private const MAX_POINTS = 300;

    /** Length of the selectable chart ranges, in seconds. */
    private const RANGES = ['1h' => 3600, '6h' => 21600, '24h' => 86400, '7d' => 604800, '30d' => 2592000];

    /**
     * The MySQL servers of the current team with their latest reading.
     */
    public function index(Request $request, ReplicationTopology $topology): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('databases/index', ['team' => null]);
        }

        $servers = $team->servers()->mysql()->with('latestDatabaseMetric')->orderBy('name')->get();

        return Inertia::render('databases/index', [
            'team' => $team->only('id', 'name'),
            'canManage' => $request->user()->can('permit', [$team, 'databases.edit']),
            'canKill' => $request->user()->can('permit', [$team, 'database_kill.edit']),
            'databases' => $servers->map(fn (Server $server) => [
                'id' => $server->id,
                'name' => $server->name,
                'host' => $server->host,
                'port' => $server->port,
                'status' => $server->status->value,
                'last_checked_at' => $server->last_checked_at?->toIso8601String(),
                'metric' => $this->presentMetric($server->latestDatabaseMetric),
            ])->values(),
            'replication' => $topology->build($servers),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * One MySQL server: its latest reading, a chart of the chosen range and the latest errors.
     */
    public function show(Request $request, Server $server): Response
    {
        abort_unless($server->isMysql(), 404);
        $this->authorize('permit', [$server->team, 'databases.view']);

        $server->load('latestDatabaseMetric');

        $range = array_key_exists((string) $request->query('range'), self::RANGES) ? (string) $request->query('range') : '24h';

        $history = $server->databaseMetrics()
            ->where('collected_at', '>=', now()->subSeconds(self::RANGES[$range]))
            ->orderBy('collected_at')
            ->get();

        $step = max(1, (int) ceil($history->count() / self::MAX_POINTS));
        $points = $history->values()->filter(fn ($metric, int $i) => $i % $step === 0)->values();

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
            'canManage' => request()->user()->can('permit', [$server->team, 'databases.edit']),
            'canKill' => request()->user()->can('permit', [$server->team, 'database_kill.edit']),
            'range' => $range,
            'ranges' => array_keys(self::RANGES),
            'range_seconds' => self::RANGES[$range],
            'history' => $points->map(fn (DatabaseMetric $metric, int $i) => [
                'at' => $metric->collected_at->toIso8601String(),
                'queries_per_second' => $metric->queries_per_second !== null ? (float) $metric->queries_per_second : null,
                'threads_connected' => $metric->threads_connected,
                'threads_running' => $metric->threads_running,
                'bytes_received_per_second' => $this->rate($points[$i - 1] ?? null, $metric, 'bytes_received_total'),
                'bytes_sent_per_second' => $this->rate($points[$i - 1] ?? null, $metric, 'bytes_sent_total'),
                'selects_per_second' => $this->rate($points[$i - 1] ?? null, $metric, 'com_select_total'),
                'inserts_per_second' => $this->rate($points[$i - 1] ?? null, $metric, 'com_insert_total'),
                'updates_per_second' => $this->rate($points[$i - 1] ?? null, $metric, 'com_update_total'),
                'deletes_per_second' => $this->rate($points[$i - 1] ?? null, $metric, 'com_delete_total'),
                'replica_lag_seconds' => $metric->replica_lag_seconds,
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
     * Average growth per second of a counter between two readings. A restart of the server
     * resets the counters, so there is no value then.
     */
    private function rate(?DatabaseMetric $previous, DatabaseMetric $current, string $counter): ?float
    {
        if ($previous === null || $current->{$counter} < $previous->{$counter}) {
            return null;
        }

        $seconds = $previous->collected_at->diffInSeconds($current->collected_at, true);

        return $seconds > 0 ? round(($current->{$counter} - $previous->{$counter}) / $seconds, 2) : null;
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
            'replication' => $metric->replica_io_running === null ? null : [
                'source' => $metric->replica_source,
                'io_running' => $metric->replica_io_running,
                'sql_running' => $metric->replica_sql_running,
                'lag_seconds' => $metric->replica_lag_seconds,
                'error' => $metric->replica_error,
            ],
        ];
    }
}
