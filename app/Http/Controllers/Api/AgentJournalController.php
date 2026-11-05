<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentJournalController extends Controller
{
    private const MAX_BODY_BYTES = 450000;

    /**
     * Receive the journal of one service that somebody asked for (plain text, the unit is in the X-Unit header).
     */
    public function __invoke(Request $request): JsonResponse
    {
        /** @var Server $server */
        $server = $request->attributes->get('agent_server');

        if ((int) $request->header('Content-Length') > self::MAX_BODY_BYTES) {
            return response()->json(['message' => 'The journal is too large.'], 413);
        }

        $body = $request->getContent();

        if (strlen($body) > self::MAX_BODY_BYTES) {
            return response()->json(['message' => 'The journal is too large.'], 413);
        }

        $service = $server->services()->where('unit', (string) $request->header('X-Unit'))->first();

        if ($service === null) {
            return response()->json(['message' => 'Unknown service.'], 404);
        }

        $service->forceFill([
            'journal' => mb_convert_encoding($body, 'UTF-8', 'UTF-8'),
            'journal_updated_at' => now(),
            'journal_requested_at' => null,
        ])->save();

        return response()->json(['ok' => true]);
    }
}
