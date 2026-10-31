<?php

namespace App\Console\Commands;

use App\Models\Server;
use App\Services\Ssh\LogParser;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

#[Signature('servers:merge-duplicate-logs {--dry-run : Only count, change nothing}')]
#[Description('Merge open log entries that report the same problem into one entry with a summed count')]
class MergeDuplicateLogsCommand extends Command
{
    public function handle(): int
    {
        $merged = 0;

        Server::query()->pluck('id')->each(function (int $serverId) use (&$merged) {
            $groups = Server::findOrFail($serverId)->logs()
                ->open()
                ->orderBy('id')
                ->get(['id', 'level', 'source', 'message', 'count', 'occurred_at'])
                ->groupBy(fn ($log) => LogParser::signature($log->level, $log->source, $log->message))
                ->filter(fn ($group) => $group->count() > 1);

            foreach ($groups as $group) {
                $keep = $group->first();
                $drop = $group->slice(1);
                $merged += $drop->count();

                if ($this->option('dry-run')) {
                    continue;
                }

                DB::transaction(function () use ($serverId, $keep, $drop, $group) {
                    $keep->forceFill([
                        'count' => $group->sum('count'),
                        'occurred_at' => $group->max('occurred_at'),
                    ])->save();

                    Server::findOrFail($serverId)->logs()->whereIn('id', $drop->pluck('id'))->delete();
                });
            }
        });

        $this->info($merged.' duplicate entries '.($this->option('dry-run') ? 'found.' : 'merged.'));

        return self::SUCCESS;
    }
}
