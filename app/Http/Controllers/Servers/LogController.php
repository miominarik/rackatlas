<?php

namespace App\Http\Controllers\Servers;

use App\Http\Controllers\Controller;
use App\Models\ServerLog;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
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
            'status' => ['nullable', 'in:open,resolved,all'],
        ]);
        $status = $filters['status'] ?? 'open';

        $servers = $team->servers()->orderBy('name')->get(['id', 'name']);

        $scoped = fn () => ServerLog::query()
            ->whereIn('server_id', $servers->pluck('id'))
            ->when($filters['server'] ?? null, fn ($query, $id) => $query->where('server_id', $id))
            ->when($filters['level'] ?? null, fn ($query, $level) => $query->where('level', $level));

        $logs = $scoped()
            ->with('resolver:id,name')
            ->when($status === 'open', fn ($query) => $query->open())
            ->when($status === 'resolved', fn ($query) => $query->whereNotNull('resolved_at'))
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
                'resolved_at' => $log->resolved_at?->toIso8601String(),
                'resolved_by' => $log->resolver?->name,
            ]);

        return Inertia::render('servers/logs', [
            'team' => $team->only('id', 'name'),
            'logs' => $logs,
            'servers' => $servers,
            'filters' => [
                'server' => isset($filters['server']) ? (int) $filters['server'] : null,
                'level' => $filters['level'] ?? null,
                'status' => $status,
            ],
            'open_count' => $scoped()->open()->count(),
            'retention_days' => ServerLog::RETENTION_DAYS,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Mark one entry as resolved by the signed-in user.
     */
    public function resolve(Request $request, ServerLog $log): RedirectResponse
    {
        $this->authorizeLog($request, $log);

        $log->update(['resolved_at' => now(), 'resolved_by' => $request->user()->id]);

        return back();
    }

    public function reopen(Request $request, ServerLog $log): RedirectResponse
    {
        $this->authorizeLog($request, $log);

        $log->update(['resolved_at' => null, 'resolved_by' => null]);

        return back();
    }

    /**
     * Resolve every open entry that matches the server and level filters of the page.
     */
    public function resolveAll(Request $request): RedirectResponse
    {
        $team = $request->user()->currentTeam();

        abort_if($team === null, 404);

        $filters = $request->validate([
            'server' => ['nullable', 'integer'],
            'level' => ['nullable', 'in:'.implode(',', ServerLog::LEVELS)],
        ]);

        $count = ServerLog::query()
            ->open()
            ->whereIn('server_id', $team->servers()->select('id'))
            ->when($filters['server'] ?? null, fn ($query, $id) => $query->where('server_id', $id))
            ->when($filters['level'] ?? null, fn ($query, $level) => $query->where('level', $level))
            ->update(['resolved_at' => now(), 'resolved_by' => $request->user()->id]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':count entries marked as resolved.', ['count' => $count])]);

        return back();
    }

    private function authorizeLog(Request $request, ServerLog $log): void
    {
        Gate::forUser($request->user())->authorize('view', $log->server->team);
    }
}
