<?php

namespace App\Http\Middleware;

use App\Models\Server;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAgent
{
    /** Wrong tokens one address may send per minute before it is blocked for the rest of the minute. */
    private const MAX_FAILURES_PER_MINUTE = 20;

    /** Reports one server may send per minute: one a minute plus the retries of curl. */
    private const MAX_REPORTS_PER_MINUTE = 10;

    /**
     * The agent proves itself with the token of its server. The server is put on the request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $failures = 'agent-auth-failures|'.$request->ip();

        if (RateLimiter::tooManyAttempts($failures, self::MAX_FAILURES_PER_MINUTE)) {
            return response()->json(['message' => 'Too many failed attempts.'], 429, [
                'Retry-After' => RateLimiter::availableIn($failures),
            ]);
        }

        $token = $request->bearerToken();
        $server = $token ? Server::findByAgentToken($token) : null;

        if ($server === null) {
            RateLimiter::hit($failures, 60);

            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $reports = 'agent-server|'.$server->id;

        if (RateLimiter::tooManyAttempts($reports, self::MAX_REPORTS_PER_MINUTE)) {
            return response()->json(['message' => 'Too many reports.'], 429, [
                'Retry-After' => RateLimiter::availableIn($reports),
            ]);
        }

        RateLimiter::hit($reports, 60);

        $request->attributes->set('agent_server', $server);

        return $next($request);
    }
}
