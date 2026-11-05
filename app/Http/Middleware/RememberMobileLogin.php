<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * On a phone or tablet the user stays signed in: the password and passkey sign-in are remembered
 * without ticking anything, so the short session never logs them out. On a computer nothing changes.
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

    /**
     * The browser hint is the most reliable one. The user agent covers browsers without it, and a
     * browser that asks for the desktop site still sends the hint on a phone.
     */
    private function isMobile(Request $request): bool
    {
        if ($request->header('Sec-CH-UA-Mobile') === '?1') {
            return true;
        }

        return (bool) preg_match('/Mobi|Android|iPhone|iPad|iPod|Silk|Tablet/i', (string) $request->userAgent());
    }
}
