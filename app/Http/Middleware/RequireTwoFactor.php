<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\Response;

/**
 * A user whose two-factor authentication was made mandatory by an administrator can only set it up
 * until it is on, and cannot turn it off again afterwards.
 */
class RequireTwoFactor
{
    /** Everything needed to set it up, and to leave. */
    private const SETUP_ROUTES = [
        'security.edit',
        'two-factor.*',
        'password.confirm*',
        'password.confirmation',
        'logout',
        'language.update',
        'verification.*',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user === null || ! $user->two_factor_required) {
            return $next($request);
        }

        if ($request->routeIs('two-factor.disable')) {
            abort(403, __('Two-factor authentication is required for your account.'));
        }

        if ($user->hasEnabledTwoFactorAuthentication() || $request->routeIs(...self::SETUP_ROUTES)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            abort(423, __('Turn on two-factor authentication first.'));
        }

        Inertia::flash('toast', ['type' => 'error', 'message' => __('Turn on two-factor authentication to continue.')]);

        return redirect()->route('security.edit');
    }
}
