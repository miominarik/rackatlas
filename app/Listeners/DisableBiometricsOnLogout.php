<?php

namespace App\Listeners;

use App\Http\Middleware\TrackDevice;
use App\Models\UserDevice;
use Illuminate\Auth\Events\Logout;
use Illuminate\Database\QueryException;

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

        try {
            UserDevice::where('token_hash', UserDevice::hashToken($token))->update(['biometrics_enabled' => false]);
        } catch (QueryException) {
            // The biometrics column is not migrated yet, so there is nothing to turn off.
        }
    }
}
