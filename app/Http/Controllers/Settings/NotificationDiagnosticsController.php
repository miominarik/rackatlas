<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Notifications\Channels\WebPushChannel;
use App\Notifications\TestNotification;
use App\Services\Notifications\PushDiagnostics;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Throwable;

class NotificationDiagnosticsController extends Controller
{
    public function show(Request $request, PushDiagnostics $diagnostics): JsonResponse
    {
        return response()->json([
            'checks' => $diagnostics->checks($request->user()),
            'vapidPublicKey' => config('services.webpush.public_key'),
        ]);
    }

    public function connectivity(Request $request, PushDiagnostics $diagnostics): JsonResponse
    {
        return response()->json(['results' => $diagnostics->connectivity($request->user())]);
    }

    /**
     * Send a push to all devices of the user and return the answer of every push service.
     */
    public function push(Request $request): JsonResponse
    {
        if (! WebPushChannel::configured()) {
            return response()->json(['error' => 'The VAPID keys are not configured.', 'results' => []]);
        }

        try {
            $results = app(WebPushChannel::class)->push($request->user(), new TestNotification);
        } catch (Throwable $e) {
            report($e);

            return response()->json(['error' => $e::class.': '.mb_substr($e->getMessage(), 0, 300), 'results' => []]);
        }

        return response()->json(['error' => $results === [] ? 'No device is registered for this account.' : null, 'results' => $results]);
    }
}
