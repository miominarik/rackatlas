<?php

namespace App\Console\Commands;

use App\Jobs\CheckStorageMonitor;
use App\Models\StorageMonitor;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('storage:check {--monitor= : Check only this container id} {--sync : Run now instead of queueing}')]
#[Description('Check the Azure Blob Storage containers that are due')]
class CheckStorageMonitorsCommand extends Command
{
    public function handle(): int
    {
        $monitors = StorageMonitor::query()
            ->with('team')
            ->when($this->option('monitor'), fn ($query, $id) => $query->whereKey($id))
            ->get()
            ->when(! $this->option('monitor'), fn ($all) => $all->filter(fn (StorageMonitor $monitor) => $monitor->last_checked_at === null
                || $monitor->last_checked_at->lte(now()->subMinutes($monitor->check_interval)->addSeconds(30))));

        foreach ($monitors as $monitor) {
            $this->option('sync')
                ? CheckStorageMonitor::dispatchSync($monitor)
                : CheckStorageMonitor::dispatch($monitor);
        }

        $this->info($monitors->count().' '.($this->option('sync') ? 'containers checked.' : 'jobs queued.'));

        return self::SUCCESS;
    }
}
