<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\NotificationPreference;
use App\Models\PushSubscription;
use App\Notifications\Channels\WebPushChannel;
use App\Notifications\TestNotification;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class NotificationController extends Controller
{
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $preference = NotificationPreference::for($user);

        return Inertia::render('settings/notifications', [
            'preferences' => $preference->only(NotificationPreference::FLAGS),
            'email' => $user->email,
            'emailVerified' => $user->hasVerifiedEmail(),
            'pushAvailable' => WebPushChannel::configured(),
            'vapidPublicKey' => config('services.webpush.public_key'),
            'devices' => $user->pushSubscriptions()->latest()->get()->map(fn (PushSubscription $device) => [
                'id' => $device->id,
                'name' => $device->name,
                'endpoint_hash' => $device->endpoint_hash,
                'created_at' => $device->created_at?->toIso8601String(),
                'last_used_at' => $device->last_used_at?->toIso8601String(),
            ])->values(),
        ]);
    }

    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate(
            array_fill_keys(NotificationPreference::FLAGS, ['required', 'boolean']),
        );

        $user = $request->user();

        $user->notificationPreference()->updateOrCreate([], $validated);

        // Alerts are written in the language the user uses right now.
        $user->forceFill(['locale' => app()->getLocale()])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Notification settings saved.')]);

        return back();
    }

    /**
     * Send a test message through the channels the user switched on.
     */
    public function test(Request $request): RedirectResponse
    {
        $user = $request->user();
        $notification = new TestNotification;

        if ($notification->via($user) === []) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('Turn on email or register a device for push first.')]);

            return back();
        }

        $user->notifyNow($notification);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Test notification sent.')]);

        return back();
    }
}
