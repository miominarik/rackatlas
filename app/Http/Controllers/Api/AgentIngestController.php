<?php

namespace App\Http\Controllers\Api;

use App\Enums\ServerErrorType;
use App\Exceptions\MetricsCollectionException;
use App\Http\Controllers\Controller;
use App\Models\DockerContainer;
use App\Models\Server;
use App\Models\ServerService;
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

        // Judge by the header first, so an oversized body is never read into memory.
        if ((int) $request->header('Content-Length') > self::MAX_BODY_BYTES) {
            return response()->json(['message' => 'The report is too large.'], 413);
        }

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

        // The services whose journal somebody asked for. The agent sends them in a separate request.
        $journal = $server->services()
            ->whereNotNull('journal_requested_at')
            ->where('journal_requested_at', '>', now()->subMinutes(ServerService::JOURNAL_REQUEST_MINUTES))
            ->orderBy('journal_requested_at')
            ->limit(2)
            ->pluck('unit')
            ->filter(fn (string $unit) => preg_match('/^[A-Za-z0-9][A-Za-z0-9:_.@-]*\.service$/', $unit) === 1)
            ->values();

        return response()->json([
            'ok' => true,
            'journal' => $journal,
            ...$this->docker($server),
        ]);
    }

    /**
     * What the agent has to do about Docker: whether to report the containers at all, the actions somebody asked
     * for ("start:<id>") and the containers whose log somebody wants. Each action is handed out once.
     *
     * @return array<string, mixed>
     */
    private function docker(Server $server): array
    {
        if (! $server->has_docker) {
            return ['docker' => false];
        }

        $since = now()->subMinutes(DockerContainer::REQUEST_MINUTES);

        $pending = $server->dockerContainers()
            ->whereNotNull('pending_action')
            ->whereNull('action_sent_at')
            ->where('action_requested_at', '>', $since)
            ->orderBy('action_requested_at')
            ->limit(2)
            ->get();

        $actions = $pending->map(fn (DockerContainer $container) => $container->pending_action.':'.$container->container_id)->values();

        if ($pending->isNotEmpty()) {
            $server->dockerContainers()->whereKey($pending->modelKeys())->update(['action_sent_at' => now()]);
        }

        $logs = $server->dockerContainers()
            ->where('logs_requested_at', '>', $since)
            ->orderBy('logs_requested_at')
            ->limit(1)
            ->pluck('container_id')
            ->values();

        return ['docker' => true, 'docker_actions' => $actions, 'docker_logs' => $logs];
    }
}
