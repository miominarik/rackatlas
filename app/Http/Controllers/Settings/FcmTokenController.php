<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Middleware\TrackDevice;
use App\Models\FcmToken;
use App\Support\NativeApp;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FcmTokenController extends Controller
{
    private const MAX_DEVICES = 10;

    /**
     * Register the Android app that sent its Firebase token. The app sends it on every start, because
     * Firebase can rotate it.
     */
    public function store(Request $request): JsonResponse
    {
        abort_unless(NativeApp::isRequest($request), 403);

        $validated = $request->validate([
            'token' => ['required', 'string', 'max:4096'],
            'name' => ['nullable', 'string', 'max:100'],
        ]);

        $user = $request->user();
        $hash = FcmToken::hashToken($validated['token']);

        if (! $user->fcmTokens()->where('token_hash', $hash)->exists()
            && $user->fcmTokens()->count() >= self::MAX_DEVICES) {
            return response()->json(['message' => __('You can register up to :count devices.', ['count' => self::MAX_DEVICES])], 422);
        }

        $device = TrackDevice::current($request);

        // A phone keeps only its newest token, and a token that moves to another account leaves the old one.
        if ($device !== null) {
            FcmToken::where('user_device_id', $device->id)->where('token_hash', '!=', $hash)->delete();
        }

        $token = FcmToken::updateOrCreate(['token_hash' => $hash], [
            'user_id' => $user->id,
            'user_device_id' => $device?->id,
            'token' => $validated['token'],
            'name' => $validated['name'] ?? null,
        ]);

        return response()->json(['id' => $token->id], 201);
    }
}
