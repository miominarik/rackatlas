<?php

namespace App\Http\Controllers\Terminal;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TerminalController extends Controller
{
    /**
     * The terminal: the servers of the current team to pick from, and the sessions opened on them.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        return Inertia::render('terminal', [
            'team' => $team?->only('id', 'name'),
            'canManage' => $team !== null && $request->user()->can('manage', $team),
            'enabled' => filled(config('terminal.secret')),
            'idleMinutes' => config('terminal.idle_minutes'),
            'servers' => $team
                ? $team->servers()->with('category')->orderBy('name')->get()
                    ->map(fn (Server $server) => [
                        'id' => $server->id,
                        'name' => $server->name,
                        'host' => $server->host,
                        'port' => $server->port,
                        'username' => $server->username,
                        'provider' => $server->provider,
                        'country' => $server->country,
                        'status' => $server->status->value,
                        'category' => $server->category?->only('id', 'name', 'color'),
                        'can_connect' => $server->auth_type !== ServerAuthType::Agent,
                    ])
                : [],
        ]);
    }
}
