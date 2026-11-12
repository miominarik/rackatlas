<?php

namespace App\Jobs;

use App\Models\Server;
use App\Services\Docker\DockerSsh;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CollectDockerContainers implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $tries = 1;

    public int $timeout = 60;

    public int $uniqueFor = 55;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public Server $server) {}

    public function uniqueId(): string
    {
        return (string) $this->server->id;
    }

    public function handle(DockerSsh $docker): void
    {
        $docker->collect($this->server);
    }
}
