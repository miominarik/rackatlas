<?php

namespace App\Http\Controllers\Terminal;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

class TerminalSessionController extends Controller
{
    public const TICKET_PREFIX = 'terminal-ticket:';

    /**
     * Prepare a session: a one-time ticket the browser hands to the terminal Node app.
     * The Node app exchanges it for the login details, which never reach the browser.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['server_id' => ['required', 'integer']]);

        if (blank(config('terminal.secret'))) {
            return response()->json(['message' => __('The terminal is not set up on this installation.')], 503);
        }

        $team = $request->user()->currentTeam();
        $server = $team?->servers()->find($data['server_id']);

        abort_if($server === null, 404);
        $this->authorize('manage', $team);

        if (! $server->canOpenTerminal()) {
            return response()->json(['message' => __('This server reports through the agent and has no SSH access.')], 422);
        }

        $token = Str::random(48);

        Cache::put(self::TICKET_PREFIX.hash('sha256', $token), [
            'server_id' => $server->id,
            'user_id' => $request->user()->id,
        ], now()->addSeconds((int) config('terminal.ticket_ttl')));

        return response()->json(['token' => $token, 'url' => config('terminal.url')]);
    }
}
