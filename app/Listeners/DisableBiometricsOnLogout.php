<?php

namespace App\Listeners;

use App\Http\Middleware\TrackDevice;
use App\Models\UserDevice;
use Illuminate\Auth\Events\Logout;

/**
 * Whoever signs out of the app, on purpose or because the password changed, is signed out for real:
 * the device would otherwise sign itself in again (see SignInBiometricDevice).
 */
class DisableBiometricsOnLogout
{
    public function handle(Logout $event): void
    {
        $token = request()->cookie(TrackDevice::COOKIE);

        if (! is_string($token) || $token === '') {
            return;
        }

        UserDevice::where('token_hash', UserDevice::hashToken($token))->update(['biometrics_enabled' => false]);
    }
}
