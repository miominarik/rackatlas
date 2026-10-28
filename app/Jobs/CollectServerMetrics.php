<?php

namespace App\Jobs;

use App\Enums\ServerErrorType;
use App\Models\Server;
use App\Services\Ssh\ServerMetricsCollector;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Throwable;

class CollectServerMetrics implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $tries = 1;

    public int $timeout = 60;

    /** A slow server must not pile up jobs: only one runs per server at a time. */
    public int $uniqueFor = 55;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public Server $server) {}

    public function uniqueId(): string
    {
        return (string) $this->server->id;
    }

    public function handle(ServerMetricsCollector $collector): void
    {
        $collector->collect($this->server);
    }

    /**
     * Last resort when the job itself dies, for example on a timeout.
     */
    public function failed(Throwable $exception): void
    {
        app(ServerMetricsCollector::class)->recordError(
            $this->server,
            ServerErrorType::Unknown,
            'The collection job failed: '.$exception->getMessage(),
            ['exception' => $exception::class],
        );
    }
}
