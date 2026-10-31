<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;

#[Signature('user:admin {email : Email address of the user} {--revoke : Remove the administrator rights instead}')]
#[Description('Give a user the administrator rights, or take them away')]
class MakeAdminCommand extends Command
{
    public function handle(): int
    {
        $user = User::where('email', $this->argument('email'))->first();

        if ($user === null) {
            $this->error('No user with this email address.');

            return self::FAILURE;
        }

        $user->forceFill(['is_admin' => ! $this->option('revoke')])->save();

        $this->info($user->email.($user->is_admin ? ' is an administrator now.' : ' is not an administrator anymore.'));

        return self::SUCCESS;
    }
}
