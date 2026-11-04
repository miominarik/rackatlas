<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentTerminalController extends Controller
{
    /**
     * Tell the terminal service on a server whether it should connect and where to.
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Server $server */
        $server = $request->attributes->get('agent_server');

        $enabled = $server->opensTerminalViaAgent() && filled(config('terminal.secret'));

        return response()->json([
            'enabled' => $enabled,
            'url' => $enabled ? config('terminal.url') : null,
        ]);
    }
}
