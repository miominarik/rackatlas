<?php

namespace App\Http\Controllers\Api;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Http\Controllers\Terminal\TerminalSessionController;
use App\Models\Server;
use App\Models\User;
use App\Services\Ssh\PublicHost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use InvalidArgumentException;

/**
 * The endpoints of the terminal Node app, guarded by the shared secret.
 */
class TerminalBridgeController extends Controller
{
    /**
     * Swap a one-time ticket for the login details of the server it was issued for.
     */
    public function exchange(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string', 'size:48'],
            'ip' => ['nullable', 'ip'],
        ]);

        $ticket = Cache::pull(TerminalSessionController::TICKET_PREFIX.hash('sha256', $data['token']));

        if ($ticket === null) {
            return response()->json(['message' => 'The ticket is invalid or expired.'], 404);
        }

        $user = User::find($ticket['user_id']);
        $server = Server::with(['team', 'sshKey'])->find($ticket['server_id']);

        if ($user === null || $server === null || ! $user->can('manage', $server->team) || ! $server->canOpenTerminal()) {
            return response()->json(['message' => 'Not allowed.'], 403);
        }

        if ($server->opensTerminalViaAgent()) {
            activity('auth')->event('terminal-opened')->causedBy($user)->performedOn($server)
                ->withProperties(['server' => $server->name, 'ip' => $data['ip'] ?? null, 'via' => 'agent'])
                ->log('terminal-opened');

            return response()->json(['mode' => 'agent', 'server_id' => $server->id, 'user_id' => $user->id]);
        }

        try {
            $host = trim(PublicHost::resolve($server->host), '[]');
        } catch (InvalidArgumentException $exception) {
            return response()->json(['message' => $exception->getMessage()], 422);
        }

        activity('auth')->event('terminal-opened')->causedBy($user)->performedOn($server)
            ->withProperties(['server' => $server->name, 'ip' => $data['ip'] ?? null])
            ->log('terminal-opened');

        return response()->json([
            'mode' => 'ssh',
            'server_id' => $server->id,
            'user_id' => $user->id,
            'host' => $host,
            'port' => $server->port,
            'username' => $server->username,
            'password' => $server->auth_type === ServerAuthType::Password ? $server->password : null,
            'private_key' => $server->auth_type === ServerAuthType::Key ? $server->sshKey?->private_key : null,
            'passphrase' => $server->auth_type === ServerAuthType::Key ? $server->sshKey?->passphrase : null,
            'fingerprint' => $server->ssh_host_fingerprint,
        ]);
    }

    /**
     * Check the token of a terminal service on a server that wants to connect to the bridge.
     */
    public function agentAuth(Request $request): JsonResponse
    {
        $data = $request->validate(['token' => ['required', 'string', 'max:100']]);

        $server = Server::findByAgentToken($data['token']);

        if ($server === null || ! $server->opensTerminalViaAgent()) {
            return response()->json(['message' => 'Not allowed.'], 403);
        }

        return response()->json(['server_id' => $server->id]);
    }

    /**
     * Record that a session ended, so the activity log shows how long a shell was open.
     */
    public function sessionEnded(Request $request): JsonResponse
    {
        $data = $request->validate([
            'server_id' => ['required', 'integer'],
            'user_id' => ['required', 'integer'],
            'seconds' => ['required', 'integer', 'min:0'],
            'via' => ['required', 'in:ssh,agent'],
        ]);

        $server = Server::find($data['server_id']);

        if ($server !== null) {
            activity('auth')->event('terminal-closed')->causedBy(User::find($data['user_id']))->performedOn($server)
                ->withProperties(['server' => $server->name, 'seconds' => $data['seconds'], 'via' => $data['via']])
                ->log('terminal-closed');
        }

        return response()->json(['ok' => true]);
    }

    /**
     * Pin the host key a server presented on the first connection, like the other SSH features do.
     */
    public function pinHostKey(Request $request): JsonResponse
    {
        $data = $request->validate([
            'server_id' => ['required', 'integer'],
            'fingerprint' => ['required', 'string', 'regex:/^SHA256:[A-Za-z0-9+\/]{43}$/'],
        ]);

        Server::whereKey($data['server_id'])->whereNull('ssh_host_fingerprint')
            ->update(['ssh_host_fingerprint' => $data['fingerprint']]);

        return response()->json(['ok' => true]);
    }
}
