<?php

namespace App\Listeners;

use App\Models\User;
use App\Services\Auth\LoginApprovals;
use Illuminate\Auth\Events\Login;
use Laravel\Fortify\Events\TwoFactorAuthenticationDisabled;

/**
 * Starts the approval of a sign-in when the user has approving devices.
 */
class HoldLoginForApproval
{
    public function __construct(private readonly LoginApprovals $approvals) {}

    public function handle(Login $event): void
    {
        $request = request();

        if (! $event->user instanceof User || ! $this->approvals->isSignIn($request)) {
            return;
        }

        $this->approvals->holdIfNeeded($event->user, $request);
    }

    /**
     * Without two-factor authentication there is no way in when the devices are lost.
     */
    public function twoFactorDisabled(TwoFactorAuthenticationDisabled $event): void
    {
        $event->user->devices()->update(['approves_logins' => false]);
    }
}
