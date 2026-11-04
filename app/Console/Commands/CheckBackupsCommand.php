<?php

namespace App\Console\Commands;

use App\Models\Backup;
use App\Notifications\BackupOverdueNotification;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('backups:check')]
#[Description('Tell the teams about active backups that did not report in the expected time')]
class CheckBackupsCommand extends Command
{
    public function handle(): int
    {
        $count = 0;

        Backup::query()
            ->active()
            ->whereNotNull('expected_interval_hours')
            ->whereNull('alerted_at')
            ->with('team.members')
            ->chunkById(100, function ($backups) use (&$count) {
                foreach ($backups as $backup) {
                    if (! $backup->isOverdue()) {
                        continue;
                    }

                    $notification = new BackupOverdueNotification($backup->id, $backup->name, $backup->expected_interval_hours);

                    $backup->team->members
                        ->filter(fn ($user) => $notification->via($user) !== [])
                        ->each(fn ($user) => $user->notify($notification));

                    $backup->forceFill(['alerted_at' => now()])->save();
                    $count++;
                }
            });

        $this->info("{$count} overdue backups reported.");

        return self::SUCCESS;
    }
}
