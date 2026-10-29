<?php

namespace App\Console\Commands;

use App\Models\Server;
use App\Services\Alerts\AlertEvaluator;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('servers:evaluate-alerts')]
#[Description('Open and close server alerts and notify the teams')]
class EvaluateAlertsCommand extends Command
{
    public function handle(AlertEvaluator $alerts): int
    {
        $count = 0;

        Server::query()->with('team')->chunkById(100, function ($servers) use ($alerts, &$count) {
            foreach ($servers as $server) {
                $alerts->evaluate($server);
                $count++;
            }
        });

        $this->info("{$count} servers evaluated.");

        return self::SUCCESS;
    }
}
