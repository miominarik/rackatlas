<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Models\UserDevice;
use App\Support\DeviceDetector;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cookie;
use Illuminate\Support\Str;
use Symfony\Component\HttpFoundation\Response;

/**
 * Recognises the device of a signed-in user. A device that is not known yet is added to the
 * account on its first request, and a device that was signed out from the settings is signed out
 * here too, even when it comes back with a remembered login.
 */
class TrackDevice
{
    public const COOKIE = 'ra_device';

    public const ATTRIBUTE = 'device';

    private const SESSION_KEY = 'ra_device_id';

    private const TOUCH_AFTER_MINUTES = 5;

    private const LIFETIME_MINUTES = 60 * 24 * 365 * 5;

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null) {
            return $next($request);
        }

        $token = $request->cookie(self::COOKIE);
        $deviceId = $request->session()->get(self::SESSION_KEY);
        $device = is_int($deviceId) ? $user->devices()->find($deviceId) : null;
        $device ??= is_string($token) && $token !== ''
            ? $user->devices()->where('token_hash', UserDevice::hashToken($token))->first()
            : null;

        if ($device?->revoked_at !== null) {
            return $this->signOut($request);
        }

        if ($device === null) {
            $device = $this->register($request, $user);
        } else {
            $this->touch($request, $device);
        }

        $request->attributes->set(self::ATTRIBUTE, $device);
        $request->session()->put(self::SESSION_KEY, $device->id);

        return $next($request);
    }

    /**
     * The device of the current request, when a user is signed in.
     */
    public static function current(Request $request): ?UserDevice
    {
        return $request->attributes->get(self::ATTRIBUTE);
    }

    private function register(Request $request, User $user): UserDevice
    {
        $token = Str::random(40);
        $details = DeviceDetector::detect($request->userAgent());
        $sessionId = $request->hasSession() ? $request->session()->getId() : null;

        // Several requests of a freshly opened page arrive before the cookie is stored. They belong to
        // one device, so a device created for this very session a moment ago is reused.
        $device = $sessionId
            ? $user->devices()->active()->where('session_id', $sessionId)->where('created_at', '>=', now()->subMinutes(2))->first()
            : null;

        if ($device !== null) {
            $device->forceFill(['token_hash' => UserDevice::hashToken($token)])->save();
        } else {
            $device = $user->devices()->create([
                ...$details,
                'token_hash' => UserDevice::hashToken($token),
                'ip_address' => $request->ip(),
                'session_id' => $sessionId,
                'last_active_at' => now(),
            ]);
        }

        Cookie::queue(Cookie::make(self::COOKIE, $token, self::LIFETIME_MINUTES, '/', null, $request->isSecure(), true, false, 'lax'));

        return $device;
    }

    private function touch(Request $request, UserDevice $device): void
    {
        $sessionId = $request->hasSession() ? $request->session()->getId() : null;

        $stale = $device->last_active_at === null || $device->last_active_at->lt(now()->subMinutes(self::TOUCH_AFTER_MINUTES));
        $moved = $device->ip_address !== $request->ip() || ($sessionId !== null && $device->session_id !== $sessionId);

        if (! $stale && ! $moved) {
            return;
        }

        $device->forceFill([
            ...DeviceDetector::detect($request->userAgent()),
            'ip_address' => $request->ip(),
            'session_id' => $sessionId ?? $device->session_id,
            'last_active_at' => now(),
        ])->save();
    }

    private function signOut(Request $request): Response
    {
        Auth::guard('web')->logoutCurrentDevice();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        Cookie::queue(Cookie::forget(self::COOKIE));

        return redirect()->route('login');
    }
}
