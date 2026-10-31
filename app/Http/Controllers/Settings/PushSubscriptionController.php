<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\PushSubscription;
use App\Notifications\Channels\WebPushChannel;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PushSubscriptionController extends Controller
{
    private const MAX_DEVICES = 10;

    /**
     * Register the browser or phone that sent its push subscription.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'endpoint' => ['bail', 'required', 'url:https', 'max:2000', function (string $attribute, mixed $value, Closure $fail): void {
                if (! WebPushChannel::allowsEndpoint($value)) {
                    $fail(__('The push notification provider is not supported.'));
                }
            }],
            'keys.p256dh' => ['required', 'string', 'max:255'],
            'keys.auth' => ['required', 'string', 'max:255'],
            'contentEncoding' => ['nullable', 'in:aes128gcm,aesgcm'],
            'name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $hash = PushSubscription::hashEndpoint($validated['endpoint']);

        if (! $user->pushSubscriptions()->where('endpoint_hash', $hash)->exists()
            && $user->pushSubscriptions()->count() >= self::MAX_DEVICES) {
            return response()->json(['message' => __('You can register up to :count devices.', ['count' => self::MAX_DEVICES])], 422);
        }

        // The same browser can be registered by another account on the same device before.
        $subscription = PushSubscription::updateOrCreate(['endpoint_hash' => $hash], [
            'user_id' => $user->id,
            'endpoint' => $validated['endpoint'],
            'public_key' => $validated['keys']['p256dh'],
            'auth_token' => $validated['keys']['auth'],
            'content_encoding' => $validated['contentEncoding'] ?? 'aes128gcm',
            'name' => $validated['name'] ?? null,
        ]);

        return response()->json(['id' => $subscription->id, 'endpoint_hash' => $hash], 201);
    }

    public function destroy(Request $request, PushSubscription $subscription): RedirectResponse
    {
        abort_unless($subscription->user_id === $request->user()->id, 404);

        $subscription->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Device removed.')]);

        return back();
    }
}
