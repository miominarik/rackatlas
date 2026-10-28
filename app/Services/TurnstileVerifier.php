<?php

namespace App\Services;

use Illuminate\Http\Client\ConnectionException;
use Illuminate\Support\Facades\Http;

class TurnstileVerifier
{
    private const ENDPOINT = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

    public function enabled(): bool
    {
        return filled(config('services.turnstile.site_key')) && filled(config('services.turnstile.secret_key'));
    }

    /**
     * Ask Cloudflare whether the token is valid. A token works once, so a replayed one fails.
     * Anything unexpected (network error, bad answer) counts as a failure.
     */
    public function verify(string $token, ?string $ip, string $expectedAction, string $expectedHost): bool
    {
        try {
            $response = Http::asForm()
                ->timeout(5)
                ->post(self::ENDPOINT, array_filter([
                    'secret' => config('services.turnstile.secret_key'),
                    'response' => $token,
                    'remoteip' => $ip,
                ]));
        } catch (ConnectionException) {
            return false;
        }

        if (! $response->successful() || $response->json('success') !== true) {
            return false;
        }

        // Cloudflare's test keys answer with a made-up action and host, so these two
        // checks only run outside local development and tests.
        if (! app()->environment('local', 'testing')) {
            return $response->json('action') === $expectedAction
                && $response->json('hostname') === $expectedHost;
        }

        return true;
    }
}
