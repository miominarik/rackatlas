<?php

namespace App\Services\Api;

use App\Models\Server;
use App\Models\ServerMetricDisk;
use App\Services\Metrics\MetricsReport;
use Carbon\CarbonInterface;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The history of a server reduced to one row per time bucket, in the flat shape a Grafana table or graph reads.
 */
class MetricSeries
{
    /** Bucket sizes in seconds a client can ask for. */
    public const INTERVALS = [60, 300, 900, 3600, 21600, 86400];

    public const MAX_POINTS = 5000;

    public const MAX_RANGE_DAYS = 31;

    /** The smallest bucket that keeps the range under a comfortable number of points. */
    public static function defaultInterval(CarbonInterface $from, CarbonInterface $to): int
    {
        $seconds = max(1, $from->diffInSeconds($to, true));

        foreach (self::INTERVALS as $interval) {
            if ($seconds / $interval <= 1500) {
                return $interval;
            }
        }

        return end(self::INTERVALS);
    }

    /**
     * @return array<int, array<string, int|float|string|null>>
     */
    public function points(Server $server, CarbonInterface $from, CarbonInterface $to, int $interval): array
    {
        $epoch = MetricsReport::epoch('collected_at');
        $ram = 'memory_used * 100.0 / NULLIF(memory_total, 0)';

        return DB::table('server_metrics')
            ->where('server_id', $server->id)
            ->whereBetween('collected_at', [$this->stamp($from), $this->stamp($to)])
            ->selectRaw("({$epoch}) - (({$epoch}) % {$interval}) AS bucket")
            ->selectRaw('COUNT(*) AS samples')
            ->selectRaw('AVG(cpu_percent) AS cpu_avg, MAX(cpu_percent) AS cpu_max')
            ->selectRaw("AVG({$ram}) AS ram_avg, MAX({$ram}) AS ram_max, AVG(memory_used) AS ram_bytes")
            ->selectRaw('AVG(CASE WHEN swap_total > 0 THEN swap_used * 100.0 / swap_total END) AS swap')
            ->selectRaw('AVG(load_1) AS load_1, AVG(load_5) AS load_5, AVG(load_15) AS load_15')
            ->selectRaw('AVG(net_rx_bps) AS rx_avg, MAX(net_rx_bps) AS rx_max, AVG(net_tx_bps) AS tx_avg, MAX(net_tx_bps) AS tx_max')
            ->groupByRaw('bucket')
            ->orderBy('bucket')
            ->get()
            ->map(fn ($row) => [
                'time' => $this->time((int) $row->bucket),
                'samples' => (int) $row->samples,
                'cpu_percent_avg' => $this->round($row->cpu_avg),
                'cpu_percent_max' => $this->round($row->cpu_max),
                'memory_percent_avg' => $this->round($row->ram_avg),
                'memory_percent_max' => $this->round($row->ram_max),
                'memory_used_bytes_avg' => $this->round($row->ram_bytes, 0),
                'swap_percent_avg' => $this->round($row->swap),
                'load_1' => $this->round($row->load_1, 2),
                'load_5' => $this->round($row->load_5, 2),
                'load_15' => $this->round($row->load_15, 2),
                'net_rx_bps_avg' => $this->round($row->rx_avg, 0),
                'net_rx_bps_max' => $this->round($row->rx_max, 0),
                'net_tx_bps_avg' => $this->round($row->tx_avg, 0),
                'net_tx_bps_max' => $this->round($row->tx_max, 0),
            ])
            ->all();
    }

    /**
     * One row per mount point and bucket (long format: filter or partition by `mount` in Grafana).
     *
     * @return array<int, array<string, int|float|string|null>>
     */
    public function disks(Server $server, CarbonInterface $from, CarbonInterface $to, int $interval): array
    {
        $epoch = MetricsReport::epoch('m.collected_at');

        return ServerMetricDisk::onlyMonitored(DB::table('server_metric_disks as d'), 'd.mount', 'd.device', 'd.total_bytes')
            ->join('server_metrics as m', 'm.id', '=', 'd.server_metric_id')
            ->where('m.server_id', $server->id)
            ->whereBetween('m.collected_at', [$this->stamp($from), $this->stamp($to)])
            ->selectRaw("d.mount AS mount, ({$epoch}) - (({$epoch}) % {$interval}) AS bucket")
            ->selectRaw('AVG(d.used_bytes) AS used, MAX(d.total_bytes) AS total')
            ->selectRaw('AVG(d.used_bytes * 100.0 / NULLIF(d.total_bytes, 0)) AS pct')
            ->groupByRaw('d.mount, bucket')
            ->orderBy('bucket')
            ->orderBy('d.mount')
            ->get()
            ->map(fn ($row) => [
                'time' => $this->time((int) $row->bucket),
                'mount' => $row->mount,
                'used_bytes' => $this->round($row->used, 0),
                'total_bytes' => (int) $row->total,
                'used_percent' => $this->round($row->pct),
            ])
            ->all();
    }

    /**
     * The database keeps times as text in the time zone of the application.
     */
    private function stamp(CarbonInterface $time): string
    {
        return $time->setTimezone(config('app.timezone'))->toDateTimeString();
    }

    private function time(int $shifted): string
    {
        return Carbon::createFromTimestampUTC($shifted + MetricsReport::offset($shifted))->toIso8601String();
    }

    private function round(mixed $value, int $precision = 1): int|float|null
    {
        return $value === null ? null : round((float) $value, $precision);
    }
}
