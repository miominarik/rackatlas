<?php

namespace App\Listeners;

use App\Http\Middleware\TrackDevice;
use App\Models\FcmToken;
use App\Models\UserDevice;
use Illuminate\Auth\Events\Logout;

/**
 * A phone that signed out stops receiving alerts. The app registers its token again after the next sign-in.
 */
class RemoveFcmTokensOnLogout
{
    public function handle(Logout $event): void
    {
        $token = request()->cookie(TrackDevice::COOKIE);

        if (! is_string($token) || $token === '') {
            return;
        }

        $device = UserDevice::where('token_hash', UserDevice::hashToken($token))->first();

        if ($device !== null) {
            FcmToken::where('user_device_id', $device->id)->delete();
        }
    }
}
