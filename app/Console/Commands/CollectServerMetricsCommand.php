<?php

namespace App\Console\Commands;

use App\Enums\ServerAuthType;
use App\Jobs\CollectServerMetrics;
use App\Models\Server;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('servers:collect-metrics {--server= : Collect only this server id} {--sync : Run now instead of queueing}')]
#[Description('Collect CPU, memory and disk metrics from all servers over SSH')]
class CollectServerMetricsCommand extends Command
{
    public function handle(): int
    {
        $servers = Server::query()
            ->with('sshKey')
            // Servers with the agent send their metrics themselves.
            ->where('auth_type', '!=', ServerAuthType::Agent->value)
            ->when($this->option('server'), fn ($query, $id) => $query->whereKey($id))
            ->get();

        foreach ($servers as $server) {
            $this->option('sync')
                ? CollectServerMetrics::dispatchSync($server)
                : CollectServerMetrics::dispatch($server);
        }

        $this->info($servers->count().' '.($this->option('sync') ? 'servers collected.' : 'jobs queued.'));

        return self::SUCCESS;
    }
}
