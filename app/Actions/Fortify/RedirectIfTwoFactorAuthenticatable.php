<?php

namespace App\Actions\Fortify;

use App\Services\Auth\LoginApprovals;
use Illuminate\Contracts\Auth\StatefulGuard;
use Laravel\Fortify\Actions\RedirectIfTwoFactorAuthenticatable as FortifyRedirectIfTwoFactorAuthenticatable;
use Laravel\Fortify\LoginRateLimiter;

/**
 * Fortify asks for the two-factor code right after the password. When a trusted device can approve
 * the sign-in, that push approval is the second factor instead, and the code stays on the waiting
 * page as the fallback.
 */
class RedirectIfTwoFactorAuthenticatable extends FortifyRedirectIfTwoFactorAuthenticatable
{
    public function __construct(StatefulGuard $guard, LoginRateLimiter $limiter, private readonly LoginApprovals $approvals)
    {
        parent::__construct($guard, $limiter);
    }

    public function handle($request, $next)
    {
        $user = $this->validateCredentials($request);

        if ($user !== null && $this->approvals->willBeApprovedByDevice($user, $request)) {
            return $next($request);
        }

        return $this->challengeIfNeeded($request, $next, $user);
    }

    private function challengeIfNeeded($request, $next, mixed $user)
    {
        $hasTwoFactor = $user?->two_factor_secret && $user->two_factor_confirmed_at !== null;

        return $hasTwoFactor ? $this->twoFactorChallengeResponse($request, $user) : $next($request);
    }
}
