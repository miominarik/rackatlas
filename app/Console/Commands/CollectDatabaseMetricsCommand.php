<?php

namespace App\Console\Commands;

use App\Jobs\CollectDatabaseMetrics;
use App\Models\Server;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('databases:collect-metrics {--server= : Collect only this server id} {--sync : Run now instead of queueing}')]
#[Description('Collect the status of all MySQL servers')]
class CollectDatabaseMetricsCommand extends Command
{
    public function handle(): int
    {
        $servers = Server::query()
            ->mysql()
            ->when($this->option('server'), fn ($query, $id) => $query->whereKey($id))
            ->get();

        foreach ($servers as $server) {
            $this->option('sync')
                ? CollectDatabaseMetrics::dispatchSync($server)
                : CollectDatabaseMetrics::dispatch($server);
        }

        $this->info($servers->count().' '.($this->option('sync') ? 'databases collected.' : 'jobs queued.'));

        return self::SUCCESS;
    }
}
