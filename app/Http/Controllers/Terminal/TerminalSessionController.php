<?php

namespace App\Http\Controllers\Terminal;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Jobs\RunTerminalSession;
use App\Services\Terminal\TerminalSessions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * The browser side of a terminal session. The SSH shell itself is held by {@see RunTerminalSession};
 * these endpoints prepare it and pass keystrokes in. The output comes back through Reverb.
 */
class TerminalSessionController extends Controller
{
    public function __construct(private TerminalSessions $sessions) {}

    /**
     * Prepare a session and start the worker; the browser then subscribes to its private channel.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate(['server_id' => ['required', 'integer']]);

        if (! self::isEnabled()) {
            return response()->json(['message' => __('The terminal is not set up on this installation.')], 503);
        }

        $team = $request->user()->currentTeam();
        $server = $team?->servers()->find($data['server_id']);

        abort_if($server === null, 404);
        $this->authorize('manage', $team);

        if ($server->auth_type === ServerAuthType::Agent) {
            return response()->json(['message' => __('This server reports through the agent and has no SSH access.')], 422);
        }

        $id = $this->sessions->create($request->user()->id, $server->id);

        RunTerminalSession::dispatch($id);

        return response()->json(['id' => $id, 'channel' => "terminal.{$id}"]);
    }

    /**
     * The browser is subscribed to the channel: the worker may start sending.
     */
    public function attach(Request $request, string $session): JsonResponse
    {
        $this->ownSession($request, $session);

        $this->sessions->markAttached($session);

        return response()->json(['ok' => true]);
    }

    /**
     * Keystrokes (and pasted text) for the shell.
     */
    public function input(Request $request, string $session): JsonResponse
    {
        $this->ownSession($request, $session);

        $data = $request->validate(['data' => ['required', 'string', 'max:65536']]);

        $this->sessions->pushInput($session, $data['data']);

        return response()->json(['ok' => true]);
    }

    public function resize(Request $request, string $session): JsonResponse
    {
        $this->ownSession($request, $session);

        $data = $request->validate([
            'cols' => ['required', 'integer', 'between:10,500'],
            'rows' => ['required', 'integer', 'between:2,200'],
        ]);

        $this->sessions->setSize($session, $data['cols'], $data['rows']);

        return response()->json(['ok' => true]);
    }

    public function destroy(Request $request, string $session): JsonResponse
    {
        $this->ownSession($request, $session);

        $this->sessions->close($session);

        return response()->json(['ok' => true]);
    }

    /** The terminal needs Reverb to carry the output back. */
    public static function isEnabled(): bool
    {
        return config('broadcasting.default') === 'reverb' && filled(config('broadcasting.connections.reverb.key'));
    }

    private function ownSession(Request $request, string $session): void
    {
        abort_unless($this->sessions->ownedBy($session, $request->user()->id), 404);
    }
}
