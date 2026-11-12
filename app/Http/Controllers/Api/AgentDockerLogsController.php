<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentDockerLogsController extends Controller
{
    private const MAX_BODY_BYTES = 450000;

    /**
     * Receive the log of one container that somebody asked for (plain text, the container is in the X-Container header).
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Server $server */
        $server = $request->attributes->get('agent_server');

        if ((int) $request->header('Content-Length') > self::MAX_BODY_BYTES) {
            return response()->json(['message' => 'The log is too large.'], 413);
        }

        $body = $request->getContent();

        if (strlen($body) > self::MAX_BODY_BYTES) {
            return response()->json(['message' => 'The log is too large.'], 413);
        }

        $container = $server->dockerContainers()->where('container_id', (string) $request->header('X-Container'))->first();

        if ($container === null) {
            return response()->json(['message' => 'Unknown container.'], 404);
        }

        $container->forceFill([
            'logs' => mb_convert_encoding($body, 'UTF-8', 'UTF-8'),
            'logs_updated_at' => now(),
            'logs_requested_at' => null,
        ])->save();

        return response()->json(['ok' => true]);
    }
}
