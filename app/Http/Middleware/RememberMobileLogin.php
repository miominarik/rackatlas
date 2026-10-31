<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * On a phone the user stays signed in: the password and passkey sign-in are remembered without
 * ticking anything, so the short session does not log them out. On a computer nothing changes.
 */
class RememberMobileLogin
{
    public function handle(Request $request, Closure $next): Response
    {
        if ($request->routeIs('login.store', 'passkey.login') && $this->isMobile($request)) {
            $request->merge(['remember' => true]);
        }

        return $next($request);
    }

    private function isMobile(Request $request): bool
    {
        return (bool) preg_match('/Mobi|Android|iPhone|iPad|iPod/i', (string) $request->userAgent());
    }
}
