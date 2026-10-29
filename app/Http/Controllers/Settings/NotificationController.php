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
use Throwable;

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

        $failure = null;

        if (in_array('mail', $notification->via($user), true)) {
            $user->notifyNow($notification, ['mail']);
        }

        // Push is sent here, not through the notification, so a failure can be shown to the user.
        if (in_array(WebPushChannel::class, $notification->via($user), true)) {
            try {
                $failed = collect(app(WebPushChannel::class)->push($user, $notification))->firstWhere('ok', false);
                $failure = $failed ? ($failed['reason'] ?: __('unknown error')) : null;
            } catch (Throwable $e) {
                report($e);
                $failure = mb_substr($e->getMessage(), 0, 200);
            }
        }

        Inertia::flash('toast', $failure === null
            ? ['type' => 'success', 'message' => __('Test notification sent.')]
            : ['type' => 'error', 'message' => __('Push could not be sent: :reason', ['reason' => $failure])]);

        return back();
    }
}
