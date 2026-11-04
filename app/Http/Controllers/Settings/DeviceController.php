<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Middleware\TrackDevice;
use App\Models\UserDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class DeviceController extends Controller
{
    /**
     * The devices the user is signed in on, the newest activity first.
     */
    public function index(Request $request): Response
    {
        $current = TrackDevice::current($request);

        return Inertia::render('settings/devices', [
            'devices' => $request->user()->devices()->active()->withCount('pushSubscriptions')
                ->orderByDesc('last_active_at')
                ->get()
                ->map(fn (UserDevice $device) => [
                    'id' => $device->id,
                    'name' => $device->name,
                    'label' => $device->label(),
                    'browser' => $device->browser,
                    'platform' => $device->platform,
                    'type' => $device->type,
                    'ip_address' => $device->ip_address,
                    'last_active_at' => $device->last_active_at?->toIso8601String(),
                    'created_at' => $device->created_at?->toIso8601String(),
                    'is_current' => $current?->id === $device->id,
                    'approves_logins' => $device->approves_logins,
                    'has_push' => $device->push_subscriptions_count > 0,
                ])->values(),
            'twoFactorEnabled' => $request->user()->hasEnabledTwoFactorAuthentication(),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function update(Request $request, UserDevice $device): RedirectResponse
    {
        $this->authorizeDevice($request, $device);

        $validated = $request->validate(['name' => ['nullable', 'string', 'max:100']]);

        $device->update(['name' => filled($validated['name'] ?? null) ? trim($validated['name']) : null]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Device renamed.')]);

        return back();
    }

    /**
     * Let the device approve the sign-ins of the account, or stop it. Only the device in the hand can
     * be switched on (it needs push notifications), any device can be switched off.
     */
    public function updateLoginApproval(Request $request, UserDevice $device): RedirectResponse
    {
        $this->authorizeDevice($request, $device);

        $enabled = $request->validate(['enabled' => ['required', 'boolean']])['enabled'];

        if ($enabled) {
            $this->ensureCanApprove($request, $device);
        }

        $device->forceFill(['approves_logins' => $enabled])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => $enabled
            ? __('This device now approves sign-ins.')
            : __('This device no longer approves sign-ins.')]);

        return back();
    }

    private function ensureCanApprove(Request $request, UserDevice $device): void
    {
        $problem = match (true) {
            TrackDevice::current($request)?->id !== $device->id => __('Turn this on from the device itself.'),
            ! $request->user()->hasEnabledTwoFactorAuthentication() => __('Turn on two-factor authentication first, it is the way in when this device is lost.'),
            ! $device->pushSubscriptions()->exists() => __('Turn on push notifications on this device first.'),
            default => null,
        };

        if ($problem !== null) {
            throw ValidationException::withMessages(['enabled' => $problem]);
        }
    }

    /**
     * Sign the device out. Its session is destroyed and a remembered login cannot bring it back.
     */
    public function destroy(Request $request, UserDevice $device): RedirectResponse
    {
        $this->authorizeDevice($request, $device);

        if (TrackDevice::current($request)?->id === $device->id) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This is the device you are using. Use Log out in the menu.')]);

            return back();
        }

        $device->revoke();
        $request->user()->forceFill(['remember_token' => Str::random(60)])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('The device was signed out.')]);

        return back();
    }

    public function destroyOthers(Request $request): RedirectResponse
    {
        $current = TrackDevice::current($request);

        $others = $request->user()->devices()->active()
            ->when($current, fn ($query) => $query->whereKeyNot($current->id))
            ->get();

        $others->each(fn (UserDevice $device) => $device->revoke());
        $request->user()->forceFill(['remember_token' => Str::random(60)])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __(':count devices were signed out.', ['count' => $others->count()])]);

        return back();
    }

    private function authorizeDevice(Request $request, UserDevice $device): void
    {
        abort_unless($device->user_id === $request->user()->id && $device->revoked_at === null, 404);
    }
}
