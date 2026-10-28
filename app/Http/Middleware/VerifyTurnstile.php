<?php

namespace App\Http\Middleware;

use App\Services\TurnstileVerifier;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\Response;

class VerifyTurnstile
{
    /**
     * Forms that take credentials, by path. The path is also the Turnstile action
     * the page asks for, so a token solved on one form cannot be used on another.
     *
     * @var array<int, string>
     */
    public const PROTECTED_PATHS = [
        'login',
        'register',
        'forgot-password',
        'reset-password',
        'two-factor-challenge',
    ];

    public function __construct(private readonly TurnstileVerifier $verifier) {}

    public function handle(Request $request, Closure $next): Response
    {
        if (
            ! $request->isMethod('POST')
            || ! in_array($request->path(), self::PROTECTED_PATHS, true)
            || ! $this->verifier->enabled()
        ) {
            return $next($request);
        }

        $token = $request->input('turnstile_token');

        if (! is_string($token) || $token === '') {
            throw ValidationException::withMessages([
                'turnstile_token' => __('Please complete the security check.'),
            ]);
        }

        if (! $this->verifier->verify($token, $request->ip(), $request->path(), $request->getHost())) {
            throw ValidationException::withMessages([
                'turnstile_token' => __('The security check failed. Please try again.'),
            ]);
        }

        return $next($request);
    }
}
