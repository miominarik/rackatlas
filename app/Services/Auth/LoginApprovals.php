<?php

namespace App\Services\Auth;

use App\Http\Middleware\TrackDevice;
use App\Models\LoginApproval;
use App\Models\User;
use App\Models\UserDevice;
use App\Notifications\Channels\WebPushChannel;
use App\Notifications\LoginApprovalNotification;
use App\Support\DeviceDetector;
use Illuminate\Http\Request;

/**
 * Sign-ins of a user who has approving devices (see UserDevice::$approves_logins) are held until
 * one of those devices allows them, or the user proves it is them with a two-factor code.
 */
class LoginApprovals
{
    /** Session key of the signed-in session that waits for an approval. */
    public const SESSION_KEY = 'login_approval';

    /** The routes where a sign-in happens. A session restored by a remember cookie is not one. */
    private const SIGN_IN_ROUTES = ['login.store', 'two-factor.login.store', 'passkey.login'];

    public function isSignIn(Request $request): bool
    {
        return $request->routeIs(...self::SIGN_IN_ROUTES);
    }

    /**
     * Hold the sign-in of this session when the user has approving devices other than the one used.
     */
    public function holdIfNeeded(User $user, Request $request): ?LoginApproval
    {
        $approvers = $user->devices()->active()->where('approves_logins', true)->get();

        if ($approvers->isEmpty()) {
            return null;
        }

        // Signing in on the approving device itself needs nobody else to say yes.
        if ($this->deviceOf($user, $request)?->approves_logins) {
            return null;
        }

        return $this->begin($user, $request, $approvers->pluck('id')->all());
    }

    /**
     * Whether a device will be asked to approve this sign-in, so no two-factor code is needed first.
     */
    public function willBeApprovedByDevice(User $user, Request $request): bool
    {
        return $user->devices()->active()->where('approves_logins', true)->exists()
            && ! $this->deviceOf($user, $request)?->approves_logins;
    }

    /**
     * A new request for the session, for example after the first one ran out.
     */
    public function renew(User $user, Request $request): ?LoginApproval
    {
        $approvers = $user->devices()->active()->where('approves_logins', true)->pluck('id')->all();

        return $approvers === [] ? null : $this->begin($user, $request, $approvers);
    }

    /**
     * @param  array<int, int>  $deviceIds
     */
    private function begin(User $user, Request $request, array $deviceIds): LoginApproval
    {
        $details = DeviceDetector::detect($request->userAgent());
        $approval = LoginApproval::start($user, $request->ip(), $details['browser'], $details['platform']);

        $request->session()->put(self::SESSION_KEY, $approval->id);

        // The answer to the browser does not wait for the push service.
        defer(fn () => app(WebPushChannel::class)->send($user, new LoginApprovalNotification($approval, $deviceIds)));

        return $approval;
    }

    public function approvalOf(Request $request): ?LoginApproval
    {
        $id = $request->session()->get(self::SESSION_KEY);
        $user = $request->user();

        return $id === null || $user === null
            ? null
            : LoginApproval::where('user_id', $user->id)->find($id);
    }

    public function approve(LoginApproval $approval, ?UserDevice $by = null): void
    {
        $approval->forceFill([
            'status' => LoginApproval::APPROVED,
            'decided_at' => now(),
            'decided_by_device_id' => $by?->id,
        ])->save();
    }

    public function deny(LoginApproval $approval, ?UserDevice $by = null): void
    {
        $approval->forceFill([
            'status' => LoginApproval::DENIED,
            'decided_at' => now(),
            'decided_by_device_id' => $by?->id,
        ])->save();
    }

    private function deviceOf(User $user, Request $request): ?UserDevice
    {
        $token = $request->cookie(TrackDevice::COOKIE);

        return is_string($token) && $token !== ''
            ? $user->devices()->active()->where('token_hash', UserDevice::hashToken($token))->first()
            : null;
    }
}
