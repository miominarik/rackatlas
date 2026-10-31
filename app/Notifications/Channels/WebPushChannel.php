<?php

namespace App\Notifications\Channels;

use App\Models\PushSubscription;
use App\Models\User;
use GuzzleHttp\Client;
use Illuminate\Notifications\Notification;
use Minishlink\WebPush\Subscription;
use Minishlink\WebPush\WebPush;
use Throwable;

/**
 * Sends a notification to every browser or phone the user registered for push.
 */
class WebPushChannel
{
    /** Only browser push providers may receive notification credentials and payloads. */
    public static function allowsEndpoint(string $endpoint): bool
    {
        if (filter_var($endpoint, FILTER_VALIDATE_URL) === false) {
            return false;
        }

        $url = parse_url($endpoint);

        if (($url['scheme'] ?? '') !== 'https'
            || isset($url['user']) || isset($url['pass'])
            || isset($url['fragment']) || ($url['port'] ?? 443) !== 443) {
            return false;
        }

        $host = strtolower($url['host'] ?? '');

        return $host === 'fcm.googleapis.com'
            || $host === 'updates.push.services.mozilla.com'
            || str_ends_with($host, '.push.apple.com')
            || str_ends_with($host, '.notify.windows.com');
    }

    public static function configured(): bool
    {
        return filled(config('services.webpush.public_key')) && filled(config('services.webpush.private_key'));
    }

    /**
     * @param  User  $notifiable
     * @param  Notification&object{toWebPush: callable}  $notification
     */
    public function send(object $notifiable, Notification $notification): void
    {
        try {
            $this->push($notifiable, $notification);
        } catch (Throwable $e) {
            // A failing push service must not fail the whole notification, which would
            // make the queue send the email again.
            report($e);
        }
    }

    /**
     * Push to every device of the user and say how it went for each one.
     *
     * @param  User  $notifiable
     * @param  Notification&object{toWebPush: callable}  $notification
     * @return array<int, array{device: string|null, host: string, ok: bool, status: int|null, reason: string, body: string}>
     */
    public function push(object $notifiable, Notification $notification): array
    {
        if (! self::configured()) {
            return [];
        }

        $subscriptions = $notifiable->pushSubscriptions()->get()
            ->filter(fn (PushSubscription $s) => self::allowsEndpoint($s->endpoint))
            ->keyBy(fn (PushSubscription $s) => $s->endpoint);

        if ($subscriptions->isEmpty()) {
            return [];
        }

        $payload = json_encode($notification->toWebPush($notifiable), JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR);

        $webPush = new WebPush([
            'VAPID' => [
                'subject' => config('services.webpush.subject'),
                'publicKey' => config('services.webpush.public_key'),
                'privateKey' => config('services.webpush.private_key'),
            ],
        ], ['TTL' => 3600, 'urgency' => 'high'], new Client([
            'timeout' => 10,
            'connect_timeout' => 5,
            'allow_redirects' => false,
        ]));

        foreach ($subscriptions as $subscription) {
            $webPush->queueNotification(Subscription::create([
                'endpoint' => $subscription->endpoint,
                'publicKey' => $subscription->public_key,
                'authToken' => $subscription->auth_token,
                'contentEncoding' => $subscription->content_encoding,
            ]), $payload);
        }

        $results = [];

        foreach ($webPush->flush() as $report) {
            $subscription = $subscriptions->get($report->getEndpoint());

            if (! $subscription) {
                continue;
            }

            $status = $report->getResponse()?->getStatusCode();
            $reason = mb_substr(trim($report->getReason()), 0, 200);

            if ($report->isSubscriptionExpired()) {
                $subscription->delete();
            } else {
                $subscription->forceFill([
                    'last_attempted_at' => now(),
                    'last_used_at' => $report->isSuccess() ? now() : $subscription->last_used_at,
                    'last_error' => $report->isSuccess() ? null : mb_substr(trim(($status ? "{$status} " : '').$reason), 0, 300),
                ])->save();
            }

            $results[] = [
                'device' => $subscription->name,
                'host' => (string) parse_url($subscription->endpoint, PHP_URL_HOST),
                'ok' => $report->isSuccess(),
                'status' => $status,
                'reason' => $report->isSubscriptionExpired() ? 'Subscription expired and was removed ('.$reason.')' : $reason,
                'body' => mb_substr(trim((string) $report->getResponseContent()), 0, 300),
            ];
        }

        return $results;
    }
}
