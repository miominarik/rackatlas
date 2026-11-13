<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Middleware\TrackDevice;
use App\Models\UserDevice;
use App\Support\NativeApp;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
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
            'devices' => $request->user()->devices()->active()->withCount(['pushSubscriptions', 'fcmTokens'])
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
                    'has_push' => $device->push_subscriptions_count + $device->fcm_tokens_count > 0,
                    'biometrics_enabled' => $device->biometrics_enabled,
                ])->values(),
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
     * Biometric unlock of the mobile app on this device. While it is on, the device is never signed out.
     */
    public function updateBiometrics(Request $request): RedirectResponse
    {
        abort_unless(NativeApp::isRequest($request), 403);

        $device = TrackDevice::current($request);

        abort_if($device === null, 404);

        $validated = $request->validate(['enabled' => ['required', 'boolean']]);

        $device->update(['biometrics_enabled' => $validated['enabled']]);

        Inertia::flash('toast', ['type' => 'success', 'message' => $validated['enabled']
            ? __('Biometric unlock is on.')
            : __('Biometric unlock is off.')]);

        return back();
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
