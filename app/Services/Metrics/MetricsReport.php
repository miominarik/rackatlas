<?php

namespace App\Services\Metrics;

use App\Models\Server;
use App\Models\ServerAlert;
use App\Models\ServerMetric;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * The numbers behind the metrics page of one server: the history reduced to a fixed number of
 * points (so a month of data is as light as an hour), the current state and the incidents.
 */
class MetricsReport
{
    /**
     * Range in seconds and the size of one point in seconds.
     *
     * @var array<string, array{0: int, 1: int}>
     */
    public const RANGES = [
        '1h' => [3600, 60],
        '6h' => [21600, 300],
        '24h' => [86400, 900],
        '7d' => [604800, 3600],
        '30d' => [2592000, 21600],
    ];

    /** A gap larger than this between two boot times is a restart, not clock noise. */
    private const RESTART_TOLERANCE_SECONDS = 180;

    public function __construct(private readonly Server $server, private readonly string $range) {}

    /**
     * @return array<string, mixed>
     */
    public function build(): array
    {
        [$length, $bucket] = self::RANGES[$this->range];
        $since = now()->subSeconds($length);

        $points = $this->points($since->toDateTimeString(), $bucket);
        $disks = $this->disks($since->toDateTimeString(), $bucket);

        return [
            'range' => $this->range,
            'bucket_seconds' => $bucket,
            'points' => $points,
            'disks' => $disks,
            'forecast' => $this->forecast($disks),
            'restarts' => $this->restarts($points),
            'availability' => $this->availability($since, $points),
            'incidents' => $this->incidents($since),
            'generated_at' => now()->toIso8601String(),
        ];
    }

    /**
     * The database keeps times as plain text in the time zone of the application, so the SQL below
     * yields seconds shifted by the offset of that zone. This is the shift to add to get real
     * unix time at that moment (it changes with daylight saving time).
     */
    private function offset(int $shifted): int
    {
        return Carbon::createFromTimestampUTC($shifted)->shiftTimezone(config('app.timezone'))->timestamp - $shifted;
    }

    /**
     * SQL that turns a datetime column into unix seconds without depending on the time zone
     * of the database session.
     */
    private function epoch(string $column): string
    {
        return DB::connection()->getDriverName() === 'sqlite'
            ? "CAST(strftime('%s', {$column}) AS INTEGER)"
            : "TIMESTAMPDIFF(SECOND, '1970-01-01 00:00:00', {$column})";
    }

    /**
     * @return array<int, array<string, int|float|null>>
     */
    private function points(string $since, int $bucket): array
    {
        $epoch = $this->epoch('collected_at');
        $ram = 'memory_used * 100.0 / NULLIF(memory_total, 0)';

        return DB::table('server_metrics')
            ->where('server_id', $this->server->id)
            ->where('collected_at', '>=', $since)
            ->selectRaw("({$epoch}) - (({$epoch}) % {$bucket}) AS bucket")
            ->selectRaw('COUNT(*) AS samples')
            ->selectRaw('AVG(cpu_percent) AS cpu_avg, MAX(cpu_percent) AS cpu_max')
            ->selectRaw("AVG({$ram}) AS ram_avg, MAX({$ram}) AS ram_max")
            ->selectRaw('AVG(CASE WHEN swap_total > 0 THEN swap_used * 100.0 / swap_total END) AS swap')
            ->selectRaw('AVG(load_1) AS load_1, AVG(load_5) AS load_5, AVG(load_15) AS load_15, MAX(cpu_cores) AS cores')
            ->selectRaw("MIN({$epoch} - uptime_seconds) AS boot_min, MAX({$epoch} - uptime_seconds) AS boot_max")
            ->groupByRaw('bucket')
            ->orderBy('bucket')
            ->get()
            ->map(fn ($row) => [
                't' => (int) $row->bucket + $this->offset((int) $row->bucket),
                'samples' => (int) $row->samples,
                'cpu_avg' => $this->round($row->cpu_avg),
                'cpu_max' => $this->round($row->cpu_max),
                'ram_avg' => $this->round($row->ram_avg),
                'ram_max' => $this->round($row->ram_max),
                'swap' => $this->round($row->swap),
                'load_1' => $this->round($row->load_1, 2),
                'load_5' => $this->round($row->load_5, 2),
                'load_15' => $this->round($row->load_15, 2),
                'cores' => (int) $row->cores,
                'boot_min' => (int) $row->boot_min + $this->offset((int) $row->bucket),
                'boot_max' => (int) $row->boot_max + $this->offset((int) $row->bucket),
            ])
            ->all();
    }

    /**
     * Disk usage per mount point, one series per mount.
     *
     * @return array<string, array<int, array{t: int, pct: float|null, used: int, total: int}>>
     */
    private function disks(string $since, int $bucket): array
    {
        $epoch = $this->epoch('m.collected_at');

        return DB::table('server_metric_disks as d')
            ->join('server_metrics as m', 'm.id', '=', 'd.server_metric_id')
            ->where('m.server_id', $this->server->id)
            ->where('m.collected_at', '>=', $since)
            ->selectRaw("({$epoch}) - (({$epoch}) % {$bucket}) AS bucket, d.mount AS mount")
            ->selectRaw('AVG(d.used_bytes * 100.0 / NULLIF(d.total_bytes, 0)) AS pct, MAX(d.used_bytes) AS used, MAX(d.total_bytes) AS total')
            ->groupByRaw('bucket, d.mount')
            ->orderBy('bucket')
            ->get()
            ->groupBy('mount')
            ->map(fn ($rows) => $rows->map(fn ($row) => [
                't' => (int) $row->bucket + $this->offset((int) $row->bucket),
                'pct' => $this->round($row->pct),
                'used' => (int) $row->used,
                'total' => (int) $row->total,
            ])->values()->all())
            ->all();
    }

    /**
     * When will a disk be full if it keeps growing like in the selected range? A straight line
     * through the points, so it is a rough guide and only shown with at least a day of history.
     *
     * @param  array<string, array<int, array{t: int, pct: float|null, used: int, total: int}>>  $disks
     * @return array<string, array{days: float|null, per_day: int}>
     */
    private function forecast(array $disks): array
    {
        $result = [];

        foreach ($disks as $mount => $series) {
            $count = count($series);

            if ($count < 6 || $series[$count - 1]['t'] - $series[0]['t'] < 86400) {
                continue;
            }

            $meanT = array_sum(array_column($series, 't')) / $count;
            $meanUsed = array_sum(array_column($series, 'used')) / $count;
            $covariance = 0.0;
            $variance = 0.0;

            foreach ($series as $point) {
                $covariance += ($point['t'] - $meanT) * ($point['used'] - $meanUsed);
                $variance += ($point['t'] - $meanT) ** 2;
            }

            $perSecond = $variance > 0 ? $covariance / $variance : 0.0;
            $last = $series[$count - 1];
            $free = max(0, $last['total'] - $last['used']);

            $result[$mount] = [
                'per_day' => (int) round($perSecond * 86400),
                'days' => $perSecond > 0 ? round($free / $perSecond / 86400, 1) : null,
            ];
        }

        return $result;
    }

    /**
     * Moments when the boot time of the server jumped, that is when it was restarted.
     *
     * @param  array<int, array<string, int|float|null>>  $points
     * @return array<int, int>
     */
    private function restarts(array $points): array
    {
        $restarts = [];
        $previousBoot = null;

        foreach ($points as $point) {
            if ($point['boot_max'] - $point['boot_min'] > self::RESTART_TOLERANCE_SECONDS) {
                $restarts[] = $point['t'];
            } elseif ($previousBoot !== null && $point['boot_min'] - $previousBoot > self::RESTART_TOLERANCE_SECONDS) {
                $restarts[] = $point['t'];
            }

            $previousBoot = $point['boot_max'];
        }

        return $restarts;
    }

    /**
     * How much of the time the server delivered data. A server is expected to report every
     * minute, so missing minutes are time it was down or unreachable.
     *
     * @param  array<int, array<string, int|float|null>>  $points
     */
    private function availability(\DateTimeInterface $since, array $points): ?float
    {
        $first = $this->server->metrics()->min('collected_at');

        if ($first === null) {
            return null;
        }

        $from = max($since->timestamp, Carbon::parse($first)->timestamp);
        $expected = max(1, (time() - $from) / 60);
        $received = array_sum(array_column($points, 'samples'));

        return round(min(100, $received / $expected * 100), 2);
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private function incidents(\DateTimeInterface $since): array
    {
        return $this->server->alerts()
            ->where(fn ($query) => $query->where('opened_at', '>=', $since)->orWhereNull('resolved_at'))
            ->orderByDesc('opened_at')
            ->limit(50)
            ->get()
            ->map(fn (ServerAlert $alert) => [
                'id' => $alert->id,
                'type' => $alert->type->value,
                'key' => $alert->key,
                'context' => $alert->context,
                'opened_at' => $alert->opened_at->toIso8601String(),
                'resolved_at' => $alert->resolved_at?->toIso8601String(),
            ])
            ->all();
    }

    private function round(mixed $value, int $precision = 1): ?float
    {
        return $value === null ? null : round((float) $value, $precision);
    }

    /**
     * The newest sample with its disks, for the cards at the top of the page.
     *
     * @return array<string, mixed>|null
     */
    public static function current(Server $server): ?array
    {
        /** @var ServerMetric|null $metric */
        $metric = $server->metrics()->with('disks')->latest('collected_at')->first();

        if ($metric === null) {
            return null;
        }

        return [
            'collected_at' => $metric->collected_at->toIso8601String(),
            'cpu_percent' => (float) $metric->cpu_percent,
            'cpu_cores' => $metric->cpu_cores,
            'load_1' => (float) $metric->load_1,
            'load_5' => (float) $metric->load_5,
            'load_15' => (float) $metric->load_15,
            'memory_total' => $metric->memory_total,
            'memory_used' => $metric->memory_used,
            'swap_total' => $metric->swap_total,
            'swap_used' => $metric->swap_used,
            'uptime_seconds' => $metric->uptime_seconds,
            'disks' => $metric->disks->map(fn ($disk) => [
                'mount' => $disk->mount,
                'device' => $disk->device,
                'filesystem' => $disk->filesystem,
                'total_bytes' => $disk->total_bytes,
                'used_bytes' => $disk->used_bytes,
            ])->values()->all(),
        ];
    }
}
