<?php

namespace App\Console\Commands;

use App\Jobs\CollectRedisMetrics;
use App\Models\Server;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('redis:collect-metrics {--server= : Collect only this server id} {--sync : Run now instead of queueing}')]
#[Description('Collect the status of all Redis and Sentinel servers')]
class CollectRedisMetricsCommand extends Command
{
    public function handle(): int
    {
        $servers = Server::query()
            ->redisFamily()
            ->when($this->option('server'), fn ($query, $id) => $query->whereKey($id))
            ->get();

        foreach ($servers as $server) {
            $this->option('sync')
                ? CollectRedisMetrics::dispatchSync($server)
                : CollectRedisMetrics::dispatch($server);
        }

        $this->info($servers->count().' '.($this->option('sync') ? 'Redis servers collected.' : 'jobs queued.'));

        return self::SUCCESS;
    }
}
