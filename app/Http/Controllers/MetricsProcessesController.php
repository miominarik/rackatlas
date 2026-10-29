<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Models\ServerMetric;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class MetricsProcessesController extends Controller
{
    /**
     * The programs that used the most CPU and the most memory inside one point of a chart:
     * the report of the busiest minute in that window.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $team = $request->user()->currentTeam();

        abort_if($team === null, 404);

        $validated = $request->validate([
            'server' => ['required', 'integer'],
            'from' => ['required', 'integer', 'min:0'],
            'to' => ['required', 'integer', 'gt:from'],
        ]);

        /** @var Server $server */
        $server = $team->servers()->findOrFail($validated['server']);

        // A window is one point of a chart, so never more than a day: a bad value cannot scan the table.
        $to = min((int) $validated['to'], (int) $validated['from'] + 86400);
        $window = fn () => $server->metrics()
            ->whereNotNull('top_processes')
            ->where('collected_at', '>=', $this->time((int) $validated['from']))
            ->where('collected_at', '<', $this->time($to));

        return response()->json([
            'agent_version' => $server->agent_version,
            'cpu' => $this->sample($window()->orderByDesc('cpu_percent')->first(), 'cpu'),
            'memory' => $this->sample($window()->orderByDesc('memory_used')->first(), 'memory'),
        ]);
    }

    /**
     * Times in the database are plain text in the time zone of the application.
     */
    private function time(int $timestamp): string
    {
        return Carbon::createFromTimestamp($timestamp)->setTimezone(config('app.timezone'))->toDateTimeString();
    }

    /**
     * @return array<string, mixed>|null
     */
    private function sample(?ServerMetric $metric, string $sortBy): ?array
    {
        if ($metric === null) {
            return null;
        }

        // Rows are lists [name, count, cpu, memory]; the first version stored them with keys.
        $processes = collect($metric->top_processes)
            ->map(fn (array $row) => array_is_list($row)
                ? ['name' => $row[0], 'count' => $row[1], 'cpu' => $row[2], 'memory' => $row[3]]
                : $row)
            ->sortByDesc($sortBy === 'cpu' ? 'cpu' : 'memory')
            ->values()
            ->all();

        return [
            'collected_at' => $metric->collected_at->toIso8601String(),
            'cpu_percent' => (float) $metric->cpu_percent,
            'memory_used' => $metric->memory_used,
            'memory_total' => $metric->memory_total,
            'processes' => $processes,
        ];
    }
}
