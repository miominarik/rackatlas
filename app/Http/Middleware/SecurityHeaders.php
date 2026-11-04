<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SecurityHeaders
{
    /**
     * Adds the browser security headers to every response. X-Content-Type-Options, Referrer-Policy and
     * X-Frame-Options are already sent by public/.htaccess.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $headers = [
            'Permissions-Policy' => 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()',
            'Cross-Origin-Opener-Policy' => 'same-origin',
        ];

        if ($request->isSecure()) {
            $headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains';
        }

        // The Vite dev server (hot file) serves scripts and styles from another origin.
        if (! file_exists(public_path('hot'))) {
            $headers['Content-Security-Policy'] = "base-uri 'self'; object-src 'none'; frame-ancestors 'self'; form-action 'self'";
            $headers['Content-Security-Policy-Report-Only'] = $this->fullPolicy();
        }

        foreach ($headers as $name => $value) {
            if (! $response->headers->has($name)) {
                $response->headers->set($name, $value);
            }
        }

        return $response;
    }

    /**
     * The strict policy. It is only reported in the browser console for now; once nothing legitimate is
     * reported, send it as Content-Security-Policy.
     */
    private function fullPolicy(): string
    {
        $terminal = parse_url((string) config('terminal.url'));
        $terminalSource = isset($terminal['scheme'], $terminal['host'])
            ? $terminal['scheme'].'://'.$terminal['host'].(isset($terminal['port']) ? ':'.$terminal['port'] : '')
            : '';

        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com",
            "style-src 'self' 'unsafe-inline' https://fonts.bunny.net",
            'font-src \'self\' data: https://fonts.bunny.net',
            "img-src 'self' data: blob: https:",
            trim("connect-src 'self' ".$terminalSource),
            'frame-src https://challenges.cloudflare.com',
            "worker-src 'self' blob:",
            "manifest-src 'self'",
        ]);
    }
}
