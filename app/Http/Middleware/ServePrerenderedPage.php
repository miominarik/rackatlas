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

        $html = PrerenderedPages::find((string) $request->route()?->getName(), (string) $request->route('locale'));

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
