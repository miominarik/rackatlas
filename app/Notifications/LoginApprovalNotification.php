<?php

namespace App\Notifications;

use App\Models\LoginApproval;
use App\Models\User;
use Illuminate\Notifications\Notification;

/**
 * Pushed to the approving devices when someone signs in to the account. It is not subject to the
 * notification preferences: it is part of signing in.
 */
class LoginApprovalNotification extends Notification
{
    /**
     * @param  array<int, int>  $deviceIds
     */
    public function __construct(public LoginApproval $approval, public array $deviceIds) {}

    /**
     * Only these devices get the push.
     *
     * @return array<int, int>
     */
    public function webPushDeviceIds(): array
    {
        return $this->deviceIds;
    }

    /**
     * @return array<string, mixed>
     */
    public function toWebPush(User $notifiable): array
    {
        $from = trim(implode(' · ', array_filter([$this->approval->browser, $this->approval->platform])));

        return [
            'title' => __('Sign-in waiting for approval'),
            'body' => __('Someone is signing in from :device. Open the app to allow or deny it.', ['device' => $from ?: __('Unknown device')]),
            'url' => route('dashboard', [], false),
            'tag' => 'login-approval',
        ];
    }
}
