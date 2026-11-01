<?php

namespace App\Jobs;

use App\Models\StorageMonitor;
use App\Services\Storage\StorageMonitorRunner;
use Illuminate\Contracts\Queue\ShouldBeUnique;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class CheckStorageMonitor implements ShouldBeUnique, ShouldQueue
{
    use Dispatchable, InteractsWithQueue, SerializesModels;

    public int $tries = 1;

    /** Shorter than the retry_after of the queue (90 s), otherwise a slow check would be started a second time. */
    public int $timeout = 80;

    /** A slow container must not pile up jobs: only one check runs per container at a time. */
    public int $uniqueFor = 85;

    public bool $deleteWhenMissingModels = true;

    public function __construct(public StorageMonitor $monitor) {}

    public function uniqueId(): string
    {
        return (string) $this->monitor->id;
    }

    public function handle(StorageMonitorRunner $runner): void
    {
        $runner->run($this->monitor);
    }
}
