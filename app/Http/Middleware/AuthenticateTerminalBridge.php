<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Only the terminal Node app, which knows the shared secret, may call the bridge endpoints.
 */
class AuthenticateTerminalBridge
{
    public function handle(Request $request, Closure $next): Response
    {
        $secret = (string) config('terminal.secret');
        $given = (string) $request->bearerToken();

        if ($secret === '' || ! hash_equals($secret, $given)) {
            abort(401);
        }

        return $next($request);
    }
}
