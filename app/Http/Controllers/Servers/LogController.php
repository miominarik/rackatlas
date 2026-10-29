<?php

namespace App\Http\Controllers\Servers;

use App\Http\Controllers\Controller;
use App\Models\ServerLog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LogController extends Controller
{
    private const PER_PAGE = 50;

    /**
     * Serious log entries of the servers of the current team, newest first.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('servers/logs', ['team' => null]);
        }

        $filters = $request->validate([
            'server' => ['nullable', 'integer'],
            'level' => ['nullable', 'in:'.implode(',', ServerLog::LEVELS)],
        ]);

        $servers = $team->servers()->orderBy('name')->get(['id', 'name']);

        $logs = ServerLog::query()
            ->whereIn('server_id', $servers->pluck('id'))
            ->when($filters['server'] ?? null, fn ($query, $id) => $query->where('server_id', $id))
            ->when($filters['level'] ?? null, fn ($query, $level) => $query->where('level', $level))
            ->orderByDesc('occurred_at')
            ->orderByDesc('id')
            ->simplePaginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (ServerLog $log) => [
                'id' => $log->id,
                'server_id' => $log->server_id,
                'server_name' => $servers->firstWhere('id', $log->server_id)?->name,
                'level' => $log->level,
                'source' => $log->source,
                'message' => $log->message,
                'count' => $log->count,
                'occurred_at' => $log->occurred_at->toIso8601String(),
            ]);

        return Inertia::render('servers/logs', [
            'team' => $team->only('id', 'name'),
            'logs' => $logs,
            'servers' => $servers,
            'filters' => [
                'server' => isset($filters['server']) ? (int) $filters['server'] : null,
                'level' => $filters['level'] ?? null,
            ],
            'retention_days' => ServerLog::RETENTION_DAYS,
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
