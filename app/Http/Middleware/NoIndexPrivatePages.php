<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class NoIndexPrivatePages
{
    /**
     * Only the pages listed here belong in search results.
     */
    private const INDEXABLE = ['home', 'home.localized', 'privacy', 'privacy.localized', 'robots', 'sitemap'];

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (! in_array($request->route()?->getName(), self::INDEXABLE, true)) {
            $response->headers->set('X-Robots-Tag', 'noindex, nofollow');
        }

        return $response;
    }
}
