<?php

namespace App\Console\Commands;

use App\Jobs\CollectDockerContainers;
use App\Models\Server;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('docker:collect {--server= : Collect only this server id} {--sync : Run now instead of queueing}')]
#[Description('Read the Docker containers of the servers that are monitored over SSH')]
class CollectDockerCommand extends Command
{
    public function handle(): int
    {
        $servers = Server::query()
            ->machines()
            ->with('sshKey')
            ->where('has_docker', true)
            // Servers with the agent send their containers themselves.
            ->whereNot(fn ($query) => $query->viaAgent())
            ->when($this->option('server'), fn ($query, $id) => $query->whereKey($id))
            ->get();

        foreach ($servers as $server) {
            $this->option('sync')
                ? CollectDockerContainers::dispatchSync($server)
                : CollectDockerContainers::dispatch($server);
        }

        $this->info($servers->count().' '.($this->option('sync') ? 'servers collected.' : 'jobs queued.'));

        return self::SUCCESS;
    }
}
