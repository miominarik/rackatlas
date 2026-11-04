<?php

namespace App\Http\Middleware;

use App\Models\LoginApproval;
use App\Services\Auth\LoginApprovals;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * A session that signed in but still waits for an approval of one of the user's devices can only
 * reach the waiting page. Everything else is closed until the approval arrives.
 */
class RequireLoginApproval
{
    public function __construct(private readonly LoginApprovals $approvals) {}

    public function handle(Request $request, Closure $next): Response
    {
        if ($request->user() === null || ! $request->session()->has(LoginApprovals::SESSION_KEY)) {
            return $next($request);
        }

        $approval = $this->approvals->approvalOf($request);

        if ($approval?->status === LoginApproval::APPROVED) {
            $request->session()->forget(LoginApprovals::SESSION_KEY);

            return $next($request);
        }

        if ($request->routeIs('login-approval.*', 'logout')) {
            return $next($request);
        }

        if ($approval?->status === LoginApproval::DENIED) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')->withErrors(['email' => __('The sign-in was denied on your device.')]);
        }

        if ($request->expectsJson()) {
            abort(423, __('The sign-in has to be approved first.'));
        }

        return redirect()->route('login-approval.show');
    }
}
