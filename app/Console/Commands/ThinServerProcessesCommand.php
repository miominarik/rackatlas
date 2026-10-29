<?php

namespace App\Console\Commands;

use App\Models\Server;
use App\Models\ServerMetric;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('servers:thin-processes')]
#[Description('Keep the process lists of old metrics only for the busiest minute of every quarter of an hour')]
class ThinServerProcessesCommand extends Command
{
    public function handle(): int
    {
        $cutoff = now()->subHours(ServerMetric::FULL_PROCESS_HOURS);
        $cleared = 0;

        Server::query()->pluck('id')->each(function (int $serverId) use ($cutoff, &$cleared) {
            $rows = ServerMetric::query()
                ->where('server_id', $serverId)
                ->whereNotNull('top_processes')
                ->where('collected_at', '<', $cutoff)
                ->get(['id', 'collected_at', 'cpu_percent', 'memory_used']);

            // The page shows the busiest minute of a point of a chart, by CPU and by memory.
            // Those two minutes of every bucket stay, the others lose their list.
            $keep = [];

            foreach ($rows->groupBy(fn ($row) => intdiv($row->collected_at->timestamp, ServerMetric::THIN_BUCKET_SECONDS)) as $bucket) {
                $keep[] = $bucket->sortByDesc('cpu_percent')->first()->id;
                $keep[] = $bucket->sortByDesc('memory_used')->first()->id;
            }

            $drop = $rows->pluck('id')->diff($keep)->values();

            foreach ($drop->chunk(500) as $ids) {
                $cleared += ServerMetric::query()->whereIn('id', $ids)->update(['top_processes' => null]);
            }
        });

        $this->info("{$cleared} process lists removed.");

        return self::SUCCESS;
    }
}
