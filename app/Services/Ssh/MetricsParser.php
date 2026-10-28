<?php

namespace App\Services\Ssh;

use App\Enums\ServerErrorType;
use App\Exceptions\MetricsCollectionException;

class MetricsParser
{
    /**
     * Shell script run on the server. It only reads from /proc and df, so it works on any Linux.
     */
    public const SCRIPT = <<<'SH'
export LC_ALL=C
echo '###CPU1'; head -n1 /proc/stat
sleep 1
echo '###CPU2'; head -n1 /proc/stat
echo '###LOAD'; cat /proc/loadavg
echo '###CORES'; nproc 2>/dev/null || grep -c '^processor' /proc/cpuinfo
echo '###MEM'; grep -E '^(MemTotal|MemFree|MemAvailable|Buffers|Cached|SwapTotal|SwapFree):' /proc/meminfo
echo '###UPTIME'; cut -d' ' -f1 /proc/uptime
echo '###DISK'; df -PT -B1 -x tmpfs -x devtmpfs -x squashfs -x overlay -x efivarfs -x iso9660 2>/dev/null | tail -n +2
SH;

    /**
     * Turn the script output into metric values.
     *
     * @return array{cpu_percent: float, cpu_cores: int, load_1: float, load_5: float, load_15: float, memory_total: int, memory_used: int, swap_total: int, swap_used: int, uptime_seconds: int, disks: array<int, array{device: string, mount: string, filesystem: string, total_bytes: int, used_bytes: int}>}
     *
     * @throws MetricsCollectionException
     */
    public function parse(string $output): array
    {
        $sections = $this->sections($output);

        foreach (['CPU1', 'CPU2', 'LOAD', 'CORES', 'MEM', 'UPTIME'] as $name) {
            if (! isset($sections[$name]) || trim($sections[$name]) === '') {
                throw $this->failure("The server did not return the {$name} section. Is it a Linux server?");
            }
        }

        [$load1, $load5, $load15] = $this->load($sections['LOAD']);
        $memory = $this->memory($sections['MEM']);

        return [
            'cpu_percent' => $this->cpuPercent($sections['CPU1'], $sections['CPU2']),
            'cpu_cores' => max(1, (int) trim($sections['CORES'])),
            'load_1' => $load1,
            'load_5' => $load5,
            'load_15' => $load15,
            ...$memory,
            'uptime_seconds' => (int) floor((float) trim($sections['UPTIME'])),
            'disks' => $this->disks($sections['DISK'] ?? ''),
        ];
    }

    /**
     * @return array<string, string>
     */
    private function sections(string $output): array
    {
        $sections = [];
        $current = null;

        foreach (preg_split('/\r\n|\n|\r/', $output) as $line) {
            if (preg_match('/^###([A-Z0-9]+)$/', trim($line), $match)) {
                $current = $match[1];
                $sections[$current] = '';

                continue;
            }

            if ($current !== null) {
                $sections[$current] .= $line."\n";
            }
        }

        return $sections;
    }

    /**
     * @return array<int, int>
     */
    private function cpuTimes(string $line): array
    {
        $parts = preg_split('/\s+/', trim($line));

        if (($parts[0] ?? '') !== 'cpu' || count($parts) < 5) {
            throw $this->failure('Unexpected /proc/stat format.');
        }

        return array_map('intval', array_slice($parts, 1, 8));
    }

    private function cpuPercent(string $first, string $second): float
    {
        $a = $this->cpuTimes($first);
        $b = $this->cpuTimes($second);

        $totalDelta = array_sum($b) - array_sum($a);
        $idleDelta = (($b[3] ?? 0) + ($b[4] ?? 0)) - (($a[3] ?? 0) + ($a[4] ?? 0));

        if ($totalDelta <= 0) {
            return 0.0;
        }

        return round(max(0, min(100, ($totalDelta - $idleDelta) / $totalDelta * 100)), 2);
    }

    /**
     * @return array{0: float, 1: float, 2: float}
     */
    private function load(string $line): array
    {
        $parts = preg_split('/\s+/', trim($line));

        if (count($parts) < 3) {
            throw $this->failure('Unexpected /proc/loadavg format.');
        }

        return [(float) $parts[0], (float) $parts[1], (float) $parts[2]];
    }

    /**
     * @return array{memory_total: int, memory_used: int, swap_total: int, swap_used: int}
     */
    private function memory(string $section): array
    {
        $values = [];

        foreach (explode("\n", $section) as $line) {
            if (preg_match('/^(\w+):\s+(\d+)\s*kB/', trim($line), $match)) {
                $values[$match[1]] = (int) $match[2] * 1024;
            }
        }

        $total = $values['MemTotal'] ?? 0;

        if ($total <= 0) {
            throw $this->failure('Could not read the memory size.');
        }

        $available = $values['MemAvailable']
            ?? (($values['MemFree'] ?? 0) + ($values['Buffers'] ?? 0) + ($values['Cached'] ?? 0));

        $swapTotal = $values['SwapTotal'] ?? 0;

        return [
            'memory_total' => $total,
            'memory_used' => max(0, $total - $available),
            'swap_total' => $swapTotal,
            'swap_used' => max(0, $swapTotal - ($values['SwapFree'] ?? 0)),
        ];
    }

    /**
     * Every real file system once, even when the same device is mounted several times.
     *
     * @return array<int, array{device: string, mount: string, filesystem: string, total_bytes: int, used_bytes: int}>
     */
    private function disks(string $section): array
    {
        $disks = [];

        foreach (explode("\n", $section) as $line) {
            $parts = preg_split('/\s+/', trim($line), 7);

            if (count($parts) < 7 || ! ctype_digit($parts[2]) || ! ctype_digit($parts[3])) {
                continue;
            }

            [$device, $type, $total, $used] = $parts;
            $mount = $parts[6];

            if ((int) $total === 0 || isset($disks[$device])) {
                continue;
            }

            $disks[$device] = [
                'device' => $device,
                'mount' => $mount,
                'filesystem' => $type,
                'total_bytes' => (int) $total,
                'used_bytes' => (int) $used,
            ];
        }

        return array_values($disks);
    }

    private function failure(string $message): MetricsCollectionException
    {
        return new MetricsCollectionException(ServerErrorType::Parse, $message);
    }
}
