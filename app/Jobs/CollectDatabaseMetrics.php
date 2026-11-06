<?php

namespace App\Jobs;

use App\Models\Server;
use App\Services\Database\MysqlMetricsCollector;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CollectDatabaseMetrics implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $tries = 1;

    public int $timeout = 60;

    /** A slow database must not pile up jobs: only one runs per server at a time. */
    public int $uniqueFor = 55;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public Server $server) {}

    public function uniqueId(): string
    {
        return 'database:'.$this->server->id;
    }

    public function handle(MysqlMetricsCollector $collector): void
    {
        $collector->collect($this->server);
    }
}
