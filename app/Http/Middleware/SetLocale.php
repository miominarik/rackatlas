<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cookie;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const COOKIE = 'locale';

    /**
     * Apply the language of the URL (public pages) or the one the user picked in the settings.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $urlLocale = $request->route('locale');

        if (is_string($urlLocale) && array_key_exists($urlLocale, config('app.supported_locales'))) {
            app()->setLocale($urlLocale);

            // The visitor chose this language by following the link, so the pages they open next match it.
            // Lives until the browser closes, a longer cookie needs their consent.
            if ($request->cookie(self::COOKIE) !== $urlLocale) {
                Cookie::queue(Cookie::make(self::COOKIE, $urlLocale, 0));
            }

            return $next($request);
        }

        $locale = $request->cookie(self::COOKIE);

        if (is_string($locale) && array_key_exists($locale, config('app.supported_locales'))) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
