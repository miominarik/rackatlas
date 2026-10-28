<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public const COOKIE = 'locale';

    /**
     * Apply the language the user picked in the settings.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $locale = $request->cookie(self::COOKIE);

        if (is_string($locale) && array_key_exists($locale, config('app.supported_locales'))) {
            app()->setLocale($locale);
        }

        return $next($request);
    }
}
