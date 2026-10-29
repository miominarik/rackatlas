<?php

namespace App\Console\Commands;

use App\Enums\ServerAuthType;
use App\Enums\ServerErrorType;
use App\Enums\ServerStatus;
use App\Models\Server;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('servers:check-agents')]
#[Description('Mark servers offline when their agent stopped reporting')]
class CheckAgentsCommand extends Command
{
    public const SILENT_MINUTES = 3;

    public function handle(): int
    {
        $silent = Server::query()
            ->where('auth_type', ServerAuthType::Agent->value)
            ->where('status', ServerStatus::Online->value)
            ->where('last_seen_at', '<', now()->subMinutes(self::SILENT_MINUTES))
            ->get();

        foreach ($silent as $server) {
            $server->errors()->create([
                'type' => ServerErrorType::Silent,
                'message' => 'No report from the agent for '.(int) floor($server->last_seen_at->diffInMinutes(now(), true)).' minutes.',
                'occurred_at' => now(),
            ]);

            $server->forceFill(['status' => ServerStatus::Offline, 'last_checked_at' => now()])->save();
        }

        $this->info($silent->count().' servers marked offline.');

        return self::SUCCESS;
    }
}
