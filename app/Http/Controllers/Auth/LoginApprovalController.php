<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Middleware\TrackDevice;
use App\Models\LoginApproval;
use App\Services\Auth\LoginApprovals;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use Laravel\Fortify\Fortify;

class LoginApprovalController extends Controller
{
    public function __construct(private readonly LoginApprovals $approvals) {}

    /**
     * The page of a sign-in that waits for the approval.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        if (! $request->session()->has(LoginApprovals::SESSION_KEY)) {
            return redirect()->route('dashboard');
        }

        $approval = $this->approvals->approvalOf($request);

        if ($approval?->status === LoginApproval::APPROVED) {
            $request->session()->forget(LoginApprovals::SESSION_KEY);

            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/login-approval', [
            'number' => $approval?->number,
            'status' => $this->statusOf($approval),
            'canUseCode' => $request->user()->hasEnabledTwoFactorAuthentication(),
        ]);
    }

    /**
     * What the waiting page asks every few seconds.
     */
    public function status(Request $request): JsonResponse
    {
        $approval = $this->approvals->approvalOf($request);
        $status = $this->statusOf($approval);

        if ($status === LoginApproval::APPROVED) {
            $request->session()->forget(LoginApprovals::SESSION_KEY);
        }

        return response()->json(['status' => $status]);
    }

    /**
     * Ask again after the first request ran out.
     */
    public function renew(Request $request): RedirectResponse
    {
        $approval = $this->approvals->approvalOf($request);

        if ($approval?->status !== LoginApproval::APPROVED) {
            if ($approval?->isPending()) {
                $this->approvals->deny($approval);
            }

            $this->approvals->renew($request->user(), $request);
        }

        return redirect()->route('login-approval.show');
    }

    /**
     * The way in when the approving devices are not at hand: a code of the authenticator app or a recovery code.
     */
    public function code(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'code' => ['nullable', 'string', 'max:20'],
            'recovery_code' => ['nullable', 'string', 'max:64'],
        ]);

        $user = $request->user();
        $approval = $this->approvals->approvalOf($request);

        if (! $user->hasEnabledTwoFactorAuthentication() || $approval === null || $approval->status === LoginApproval::DENIED) {
            abort(403);
        }

        $valid = false;

        if (filled($validated['code'] ?? null)) {
            $valid = app(TwoFactorAuthenticationProvider::class)->verify(
                Fortify::currentEncrypter()->decrypt($user->two_factor_secret),
                $validated['code'],
            );
        } elseif (filled($validated['recovery_code'] ?? null)) {
            $recoveryCode = collect($user->recoveryCodes())
                ->first(fn (string $code) => hash_equals($code, $validated['recovery_code']));

            if ($recoveryCode !== null) {
                $user->replaceRecoveryCode($recoveryCode);
                $valid = true;
            }
        }

        if (! $valid) {
            throw ValidationException::withMessages([
                filled($validated['recovery_code'] ?? null) ? 'recovery_code' : 'code' => __('The provided code was invalid.'),
            ]);
        }

        $this->approvals->approve($approval);
        $request->session()->forget(LoginApprovals::SESSION_KEY);

        return redirect()->route('dashboard');
    }

    /**
     * Answer from an approving device: choose the number shown on the signing-in screen, or deny.
     */
    public function decide(Request $request, LoginApproval $approval): RedirectResponse
    {
        $validated = $request->validate([
            'choice' => ['nullable', 'integer'],
            'deny' => ['nullable', 'boolean'],
        ]);

        $device = TrackDevice::current($request);

        abort_unless(
            $approval->user_id === $request->user()->id
                && $device?->approves_logins
                && $approval->isPending(),
            404,
        );

        // The first answer counts. A wrong number is a no.
        $allowed = ! ($validated['deny'] ?? false) && (int) ($validated['choice'] ?? 0) === $approval->number;

        if ($allowed) {
            $this->approvals->approve($approval, $device);
        } else {
            $this->approvals->deny($approval, $device);
        }

        Inertia::flash('toast', [
            'type' => $allowed ? 'success' : 'error',
            'message' => $allowed ? __('The sign-in was allowed.') : __('The sign-in was denied.'),
        ]);

        return back();
    }

    private function statusOf(?LoginApproval $approval): string
    {
        return match (true) {
            $approval === null, $approval->isExpired() => 'expired',
            default => $approval->status,
        };
    }
}
