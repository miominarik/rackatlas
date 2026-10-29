<?php

namespace App\Services\Notifications;

use App\Models\NotificationPreference;
use App\Models\User;
use App\Notifications\Channels\WebPushChannel;
use App\Notifications\TestNotification;
use Illuminate\Support\Facades\Http;
use Throwable;

/**
 * Technical checks of the server side of push notifications, for the diagnostics panel.
 */
class PushDiagnostics
{
    /**
     * @return array<int, array{id: string, status: 'ok'|'warn'|'fail', detail: string}>
     */
    public function checks(User $user): array
    {
        $public = (string) config('services.webpush.public_key');
        $private = (string) config('services.webpush.private_key');
        $subject = (string) config('services.webpush.subject');
        $publicBytes = strlen(self::decode($public));
        $privateBytes = strlen(self::decode($private));

        $missing = array_values(array_filter(
            ['openssl', 'mbstring', 'curl'],
            fn (string $extension) => ! extension_loaded($extension),
        ));
        $math = extension_loaded('gmp') || extension_loaded('bcmath');

        $preference = NotificationPreference::for($user);
        $devices = $user->pushSubscriptions()->get();

        $checks = [
            ['id' => 'vapid_public', 'status' => $publicBytes === 65 && $public[0] === 'B' ? 'ok' : 'fail',
                'detail' => $public === '' ? 'VAPID_PUBLIC_KEY is empty' : substr($public, 0, 12).'… ('.$publicBytes.' bytes, expected 65)'],
            ['id' => 'vapid_private', 'status' => $privateBytes === 32 ? 'ok' : 'fail',
                'detail' => $private === '' ? 'VAPID_PRIVATE_KEY is empty' : $privateBytes.' bytes, expected 32'],
            ['id' => 'vapid_pair', ...$this->pairCheck($public, $private)],
            ['id' => 'subject', 'status' => preg_match('/^(mailto:[^@\s]+@[^@\s]+\.[a-z]{2,}|https:\/\/\S+)$/i', $subject) && ! str_contains($subject, 'example.') ? 'ok' : 'warn',
                'detail' => $subject.' (Apple rejects a made-up address; set VAPID_SUBJECT to a real mailto: or https:// URL)'],
            ['id' => 'extensions', 'status' => $missing === [] && $math ? 'ok' : 'fail',
                'detail' => $missing === [] && $math ? 'openssl, mbstring, curl, '.(extension_loaded('gmp') ? 'gmp' : 'bcmath') : 'missing: '.implode(', ', [...$missing, ...($math ? [] : ['gmp or bcmath'])])],
            ['id' => 'https', 'status' => str_starts_with((string) config('app.url'), 'https://') && request()->isSecure() ? 'ok' : 'warn',
                'detail' => 'APP_URL='.config('app.url').', request is '.(request()->isSecure() ? 'secure' : 'not secure')],
            ['id' => 'preference', 'status' => $preference->push_enabled ? 'ok' : 'fail',
                'detail' => $preference->push_enabled ? 'on' : 'push is switched off in the notification settings'],
            ['id' => 'devices', 'status' => $devices->isNotEmpty() ? 'ok' : 'fail',
                'detail' => $devices->isEmpty() ? 'no device registered for this account' : $devices->map(fn ($d) => ($d->name ?? 'device').' @ '.parse_url($d->endpoint, PHP_URL_HOST).($d->last_error ? ' — last error: '.$d->last_error : ($d->last_used_at ? ' — last ok '.$d->last_used_at->toDateTimeString() : '')))->implode("\n")],
            ['id' => 'channels', 'status' => in_array(WebPushChannel::class, (new TestNotification)->via($user), true) ? 'ok' : 'fail',
                'detail' => implode(', ', array_map(fn (string $c) => class_basename($c), (new TestNotification)->via($user))) ?: 'none (nothing would be sent)'],
        ];

        return $checks;
    }

    /**
     * Can this server reach the push services at all? Shared hostings often block outgoing connections.
     *
     * @return array<int, array{host: string, ok: bool, detail: string}>
     */
    public function connectivity(User $user): array
    {
        $hosts = $user->pushSubscriptions()->get()
            ->map(fn ($d) => (string) parse_url($d->endpoint, PHP_URL_HOST))
            ->filter()->unique()->values()->all() ?: ['fcm.googleapis.com'];

        return array_map(function (string $host) {
            $started = microtime(true);

            try {
                $response = Http::timeout(6)->withoutVerifying(false)->get("https://{$host}/");

                return ['host' => $host, 'ok' => true, 'detail' => 'HTTP '.$response->status().' in '.round((microtime(true) - $started) * 1000).' ms'];
            } catch (Throwable $e) {
                return ['host' => $host, 'ok' => false, 'detail' => mb_substr($e->getMessage(), 0, 200)];
            }
        }, array_slice($hosts, 0, 3));
    }

    /**
     * Derive the public key from the private one and compare, so a pair mixed up from two
     * different generations is caught.
     *
     * @return array{status: 'ok'|'warn'|'fail', detail: string}
     */
    private function pairCheck(string $public, string $private): array
    {
        $d = self::decode($private);
        $expected = self::decode($public);

        if (strlen($d) !== 32 || strlen($expected) !== 65) {
            return ['status' => 'warn', 'detail' => 'skipped, the keys have the wrong length'];
        }

        $der = hex2bin('30310201010420').$d.hex2bin('a00a06082a8648ce3d030107');
        $pem = "-----BEGIN EC PRIVATE KEY-----\n".chunk_split(base64_encode($der), 64)."-----END EC PRIVATE KEY-----\n";
        $key = @openssl_pkey_get_private($pem);
        $ec = $key ? (@openssl_pkey_get_details($key)['ec'] ?? null) : null;

        if (! $ec) {
            return ['status' => 'warn', 'detail' => 'could not be verified on this server'];
        }

        $derived = "\x04".str_pad($ec['x'], 32, "\0", STR_PAD_LEFT).str_pad($ec['y'], 32, "\0", STR_PAD_LEFT);

        return hash_equals($expected, $derived)
            ? ['status' => 'ok', 'detail' => 'the public key matches the private key']
            : ['status' => 'fail', 'detail' => 'the public key does NOT match the private key; generate both again with php artisan webpush:keys'];
    }

    private static function decode(string $value): string
    {
        return (string) base64_decode(strtr($value, '-_', '+/'), false);
    }
}
