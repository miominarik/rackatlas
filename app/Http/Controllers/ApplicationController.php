<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Models\ServerService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class ApplicationController extends Controller
{
    /**
     * The systemd services of the servers with the agent: what runs, what is stopped, switched off or crashed.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return Inertia::render('applications/index', ['team' => null]);
        }

        $servers = $team->servers()
            ->viaAgent()
            ->orderBy('name')
            ->with(['services' => fn ($query) => $query
                ->select(['id', 'server_id', 'unit', 'description', 'active_state', 'sub_state', 'unit_file_state', 'journal_updated_at', 'journal_requested_at'])
                ->orderBy('unit')])
            ->get(['id', 'name', 'status', 'last_seen_at']);

        return Inertia::render('applications/index', [
            'team' => $team->only('id', 'name'),
            'servers' => $servers->map(fn (Server $server) => [
                'id' => $server->id,
                'name' => $server->name,
                'status' => $server->status,
                'last_seen_at' => $server->last_seen_at?->toIso8601String(),
                'services' => $server->services
                    ->map(fn (ServerService $service) => [
                        'id' => $service->id,
                        'unit' => $service->unit,
                        'description' => $service->description,
                        'status' => $service->status(),
                        'active_state' => $service->active_state,
                        'sub_state' => $service->sub_state,
                        'unit_file_state' => $service->unit_file_state,
                        'journal_at' => $service->journal_updated_at?->toIso8601String(),
                        'journal_pending' => $service->journalIsPending(),
                    ])
                    ->sortBy(fn (array $service) => array_search($service['status'], ServerService::STATUSES, true))
                    ->values(),
            ])->values(),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Ask the agent for the journal of one service. It sends it with its next report, within a minute or two.
     */
    public function requestJournal(Request $request, ServerService $service): RedirectResponse
    {
        Gate::forUser($request->user())->authorize('permit', [$service->server->team, 'applications.view']);

        $service->forceFill(['journal_requested_at' => now()])->save();

        return back();
    }

    /**
     * Download the journal of one service, as the agent sent it last, as a text file.
     */
    public function journal(Request $request, ServerService $service): HttpResponse
    {
        Gate::forUser($request->user())->authorize('permit', [$service->server->team, 'applications.view']);

        abort_if($service->journal === null, 404);

        $name = Str::slug($service->server->name).'-'.preg_replace('/[^A-Za-z0-9._@-]/', '_', $service->unit).'-journal.txt';

        return response($service->journal."\n", 200, [
            'Content-Type' => 'text/plain; charset=UTF-8',
            'Content-Disposition' => 'attachment; filename="'.$name.'"',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
