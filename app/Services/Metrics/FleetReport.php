<?php

namespace App\Services\Metrics;

use App\Models\Server;
use App\Models\ServerAlert;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * The metrics of all servers of a team side by side: one row per server with the current state
 * and a short history of CPU and memory, built from a single query for the whole fleet.
 */
class FleetReport
{
    /**
     * @param  Collection<int, Server>  $servers  Servers with `latestMetric.disks` loaded.
     */
    public function __construct(private readonly Collection $servers, private readonly string $range) {}

    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        [$length, $bucket] = MetricsReport::RANGES[$this->range];
        $since = now()->subSeconds($length);

        $history = $this->history($since->toDateTimeString(), $bucket);
        $openAlerts = $this->openAlerts();

        return [
            'range' => $this->range,
            'bucket_seconds' => $bucket,
            'generated_at' => now()->toIso8601String(),
            'servers' => $this->servers->map(fn (Server $server) => $this->row(
                $server,
                $history[$server->id] ?? [],
                $openAlerts[$server->id] ?? 0,
                $since->timestamp,
            ))->values()->all(),
        ];
    }

    /**
     * @param  array<int, array{t: int, cpu: float|null, ram: float|null, cpu_max: float|null, samples: int, rx: float|null, tx: float|null}>  $points
     * @return array<string, mixed>
     */
    private function row(Server $server, array $points, int $openAlerts, int $since): array
    {
        $metric = $server->latestMetric;
        $received = array_sum(array_column($points, 'samples'));
        $first = $server->metrics()->min('collected_at');
        $from = $first === null ? null : max($since, strtotime((string) $first));

        return [
            'id' => $server->id,
            'name' => $server->name,
            'status' => $server->status->value,
            'last_seen_at' => $server->last_seen_at?->toIso8601String(),
            'open_alerts' => $openAlerts,
            'availability' => $from === null ? null : round(min(100, $received / max(1, (time() - $from) / 60) * 100), 2),
            'current' => $metric ? [
                'collected_at' => $metric->collected_at->toIso8601String(),
                'cpu_percent' => (float) $metric->cpu_percent,
                'cpu_cores' => $metric->cpu_cores,
                'load_1' => (float) $metric->load_1,
                'memory_total' => $metric->memory_total,
                'memory_used' => $metric->memory_used,
                'net_rx_bps' => $metric->net_rx_bps,
                'net_tx_bps' => $metric->net_tx_bps,
                'uptime_seconds' => $metric->uptime_seconds,
                'disks' => $metric->disks->map(fn ($disk) => [
                    'mount' => $disk->mount,
                    'total_bytes' => $disk->total_bytes,
                    'used_bytes' => $disk->used_bytes,
                ])->values()->all(),
            ] : null,
            'points' => $points,
        ];
    }

    /**
     * @return array<int, array<int, array{t: int, cpu: float|null, ram: float|null, cpu_max: float|null, samples: int, rx: float|null, tx: float|null}>>
     */
    private function history(string $since, int $bucket): array
    {
        $epoch = MetricsReport::epoch('collected_at');
        $ram = 'memory_used * 100.0 / NULLIF(memory_total, 0)';

        return DB::table('server_metrics')
            ->whereIn('server_id', $this->servers->modelKeys())
            ->where('collected_at', '>=', $since)
            ->selectRaw('server_id')
            ->selectRaw("({$epoch}) - (({$epoch}) % {$bucket}) AS bucket")
            ->selectRaw('COUNT(*) AS samples, AVG(cpu_percent) AS cpu, MAX(cpu_percent) AS cpu_max')
            ->selectRaw("AVG({$ram}) AS ram")
            ->selectRaw('AVG(net_rx_bps) AS rx, AVG(net_tx_bps) AS tx')
            ->groupByRaw('server_id, bucket')
            ->orderBy('bucket')
            ->get()
            ->groupBy('server_id')
            ->map(fn ($rows) => $rows->map(fn ($row) => [
                't' => (int) $row->bucket + MetricsReport::offset((int) $row->bucket),
                'samples' => (int) $row->samples,
                'cpu' => $row->cpu === null ? null : round((float) $row->cpu, 1),
                'cpu_max' => $row->cpu_max === null ? null : round((float) $row->cpu_max, 1),
                'ram' => $row->ram === null ? null : round((float) $row->ram, 1),
                'rx' => $row->rx === null ? null : round((float) $row->rx),
                'tx' => $row->tx === null ? null : round((float) $row->tx),
            ])->values()->all())
            ->all();
    }

    /**
     * @return array<int, int>
     */
    private function openAlerts(): array
    {
        return ServerAlert::query()
            ->whereIn('server_id', $this->servers->modelKeys())
            ->whereNull('resolved_at')
            ->selectRaw('server_id, COUNT(*) AS total')
            ->groupBy('server_id')
            ->pluck('total', 'server_id')
            ->map(fn ($total) => (int) $total)
            ->all();
    }
}
