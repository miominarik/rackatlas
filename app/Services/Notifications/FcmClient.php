<?php

namespace App\Services\Notifications;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Talks to Firebase Cloud Messaging through the HTTP v1 API, signing in with a Google service account.
 */
class FcmClient
{
    private const SCOPE = 'https://www.googleapis.com/auth/firebase.messaging';

    public const TOKEN_CACHE_KEY = 'fcm.access-token';

    /**
     * @return array{project_id: string, client_email: string, private_key: string, token_uri: string}|null
     */
    public static function credentials(): ?array
    {
        $raw = config('services.fcm.credentials_json');

        if (blank($raw)) {
            $path = config('services.fcm.credentials_path');
            $raw = filled($path) ? self::readCredentialsFile((string) $path) : null;
        }

        if (! is_string($raw) || $raw === '') {
            return null;
        }

        $decoded = json_decode($raw, true) ?? json_decode((string) base64_decode($raw, true), true);

        if (! is_array($decoded)
            || ! is_string($decoded['project_id'] ?? null)
            || ! is_string($decoded['client_email'] ?? null)
            || ! is_string($decoded['private_key'] ?? null)) {
            return null;
        }

        return [
            'project_id' => $decoded['project_id'],
            'client_email' => $decoded['client_email'],
            'private_key' => $decoded['private_key'],
            'token_uri' => is_string($decoded['token_uri'] ?? null) ? $decoded['token_uri'] : 'https://oauth2.googleapis.com/token',
        ];
    }

    /**
     * The path may be absolute or relative to the project, and a leading slash is tolerated for
     * paths such as /storage/app/private/key.json that really live inside the project.
     */
    private static function readCredentialsFile(string $path): ?string
    {
        foreach ([$path, base_path(ltrim($path, '/'))] as $candidate) {
            if (is_file($candidate) && is_readable($candidate)) {
                return (string) file_get_contents($candidate);
            }
        }

        return null;
    }

    public static function configured(): bool
    {
        return self::credentials() !== null;
    }

    /**
     * Send one message and say how Firebase answered.
     *
     * @param  array<string, mixed>  $message
     * @return array{ok: bool, status: int, reason: string, unregistered: bool}
     */
    public function send(array $message): array
    {
        $credentials = self::credentials() ?? throw new RuntimeException('Firebase credentials are not configured.');

        $response = Http::withToken($this->accessToken($credentials))
            ->connectTimeout(5)
            ->timeout(10)
            ->withoutRedirecting()
            ->post("https://fcm.googleapis.com/v1/projects/{$credentials['project_id']}/messages:send", ['message' => $message]);

        $errorCode = (string) (collect($response->json('error.details', []))->firstWhere('errorCode')['errorCode'] ?? '');
        $status = (string) $response->json('error.status', '');

        return [
            'ok' => $response->successful(),
            'status' => $response->status(),
            'reason' => $response->successful() ? '' : mb_substr(trim($status.' '.$response->json('error.message', $response->body())), 0, 250),
            'unregistered' => $errorCode === 'UNREGISTERED' || $status === 'NOT_FOUND',
        ];
    }

    /**
     * @param  array{client_email: string, private_key: string, token_uri: string}  $credentials
     */
    private function accessToken(array $credentials): string
    {
        return Cache::remember(self::TOKEN_CACHE_KEY, now()->addMinutes(50), function () use ($credentials): string {
            $response = Http::asForm()->connectTimeout(5)->timeout(10)->post($credentials['token_uri'], [
                'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                'assertion' => $this->signedJwt($credentials),
            ])->throw();

            return (string) $response->json('access_token');
        });
    }

    /**
     * @param  array{client_email: string, private_key: string, token_uri: string}  $credentials
     */
    private function signedJwt(array $credentials): string
    {
        $encode = fn (array $data): string => rtrim(strtr(base64_encode(json_encode($data, JSON_THROW_ON_ERROR)), '+/', '-_'), '=');
        $now = time();
        $unsigned = $encode(['alg' => 'RS256', 'typ' => 'JWT']).'.'.$encode([
            'iss' => $credentials['client_email'],
            'scope' => self::SCOPE,
            'aud' => $credentials['token_uri'],
            'iat' => $now,
            'exp' => $now + 3600,
        ]);

        if (! openssl_sign($unsigned, $signature, $credentials['private_key'], OPENSSL_ALGO_SHA256)) {
            throw new RuntimeException('The Firebase private key could not sign the request.');
        }

        return $unsigned.'.'.rtrim(strtr(base64_encode($signature), '+/', '-_'), '=');
    }
}
