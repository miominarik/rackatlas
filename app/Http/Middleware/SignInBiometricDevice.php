<?php

namespace App\Http\Middleware;

use App\Models\UserDevice;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * A device of the mobile app with biometric unlock turned on is never signed out. The app is locked
 * by the phone's fingerprint or face, so when its session or remembered login is gone the device
 * cookie brings the user back in. A device that was signed out from the settings, or where the user
 * chose Log out, has biometrics off and stays signed out.
 */
class SignInBiometricDevice
{
    public function handle(Request $request, Closure $next): Response
    {
        $guard = Auth::guard('web');

        if ($request->routeIs('logout') || $guard->check()) {
            return $next($request);
        }

        $token = $request->cookie(TrackDevice::COOKIE);

        if (! is_string($token) || $token === '') {
            return $next($request);
        }

        $device = UserDevice::active()
            ->where('token_hash', UserDevice::hashToken($token))
            ->where('biometrics_enabled', true)
            ->with('user')
            ->first();

        if ($device?->user !== null) {
            $guard->login($device->user, true);
        }

        return $next($request);
    }
}
