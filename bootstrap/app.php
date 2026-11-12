<?php

use App\Http\Middleware\EnsureApiScope;
use App\Http\Middleware\EnsureTeamPermission;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use App\Http\Middleware\NoIndexPrivatePages;
use App\Http\Middleware\RememberMobileLogin;
use App\Http\Middleware\RequireTwoFactor;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\SetLocale;
use App\Http\Middleware\SignInBiometricDevice;
use App\Http\Middleware\TrackDevice;
use App\Http\Middleware\TrustCloudflareProxies;
use App\Http\Middleware\VerifyTurnstile;
use Illuminate\Contracts\Auth\Middleware\AuthenticatesRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // The site is behind Cloudflare: only its addresses are trusted proxies (list kept up to date nightly).
        $middleware->replace(TrustProxies::class, TrustCloudflareProxies::class);

        $middleware->alias([
            'api.scope' => EnsureApiScope::class,
            'permission' => EnsureTeamPermission::class,
        ]);

        $middleware->append(SecurityHeaders::class);

        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        // The biometric device must be signed in before the auth middleware looks for a user.
        $middleware->prependToPriorityList(before: AuthenticatesRequests::class, prepend: SignInBiometricDevice::class);

        $middleware->web(append: [
            'throttle:web',
            SignInBiometricDevice::class,
            'auth.session',
            HandleAppearance::class,
            SetLocale::class,
            TrackDevice::class,
            RequireTwoFactor::class,
            RememberMobileLogin::class,
            NoIndexPrivatePages::class,
            VerifyTurnstile::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );
    })->create();
