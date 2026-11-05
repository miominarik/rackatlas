<?php

namespace App\Http\Middleware;

use App\Support\PrerenderedPages;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Answers a visitor of a public page with the HTML rendered at build time (see seo:prerender).
 * Anyone who needs the live page gets it: signed-in users, Inertia visits and anything that carries
 * flashed messages or validation errors.
 */
class ServePrerenderedPage
{
    public const HEADER = 'X-Prerendering';

    public function handle(Request $request, Closure $next): Response
    {
        if (! $this->canServe($request)) {
            return $next($request);
        }

        // The pages without a language in the URL get the language the visitor was recognized by.
        $routeName = (string) $request->route()?->getName();
        $html = PrerenderedPages::find(
            PrerenderedPages::LOCALIZED_ROUTES[$routeName] ?? $routeName,
            (string) ($request->route('locale') ?? app()->getLocale()),
        );

        return $html === null ? $next($request) : response($html);
    }

    private function canServe(Request $request): bool
    {
        if (! $request->isMethod('GET') || $request->header('X-Inertia') || $request->hasHeader(self::HEADER)) {
            return false;
        }

        if ($request->user() !== null) {
            return false;
        }

        $session = $request->session();

        return ! $session->has('errors') && $session->get('_flash.old', []) === [];
    }
}
