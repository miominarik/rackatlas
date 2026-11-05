<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateApiToken
{
    /** Wrong keys one address may send per minute before it is blocked for the rest of the minute. */
    private const MAX_FAILURES_PER_MINUTE = 20;

    /** Requests one key may send per minute. */
    private const MAX_REQUESTS_PER_MINUTE = 120;

    /**
     * The client proves itself with the key of a team. The key is put on the request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $failures = 'api-auth-failures|'.$request->ip();

        if (RateLimiter::tooManyAttempts($failures, self::MAX_FAILURES_PER_MINUTE)) {
            return response()->json(['message' => 'Too many failed attempts.'], 429, [
                'Retry-After' => RateLimiter::availableIn($failures),
            ]);
        }

        $plain = $request->bearerToken();
        $token = $plain ? ApiToken::findByPlainToken($plain) : null;

        if ($token === null || $token->isExpired()) {
            RateLimiter::hit($failures, 60);

            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $requests = 'api-token|'.$token->id;

        if (RateLimiter::tooManyAttempts($requests, self::MAX_REQUESTS_PER_MINUTE)) {
            return response()->json(['message' => 'Too many requests.'], 429, [
                'Retry-After' => RateLimiter::availableIn($requests),
            ]);
        }

        RateLimiter::hit($requests, 60);
        $token->touchLastUsed();

        $request->attributes->set('api_token', $token);

        return $next($request);
    }
}
