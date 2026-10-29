<?php

namespace App\Http\Controllers\Api;

use App\Enums\ServerErrorType;
use App\Exceptions\MetricsCollectionException;
use App\Http\Controllers\Controller;
use App\Models\Server;
use App\Services\Ssh\AgentIngestor;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentIngestController extends Controller
{
    private const MAX_BODY_BYTES = 262144;

    /**
     * Receive one report of the agent (plain text, see the agent script for the format).
     */
    public function __invoke(Request $request, AgentIngestor $ingestor): JsonResponse
    {
        /** @var Server $server */
        $server = $request->attributes->get('agent_server');
        $body = $request->getContent();

        if ($body === '' || strlen($body) > self::MAX_BODY_BYTES) {
            return response()->json(['message' => 'The report is empty or too large.'], $body === '' ? 422 : 413);
        }

        try {
            $ingestor->ingest($server, $body, $request->header('X-Agent-Version'));
        } catch (MetricsCollectionException $e) {
            // The agent did reach us, so the server stays online. Only the report is bad.
            $server->errors()->create([
                'type' => ServerErrorType::Parse,
                'message' => 'The agent sent a report that could not be read: '.$e->getMessage(),
                'occurred_at' => now(),
            ]);

            return response()->json(['message' => $e->getMessage()], 422);
        }

        return response()->json(['ok' => true]);
    }
}
