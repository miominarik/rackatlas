<?php

namespace App\Notifications\Concerns;

use App\Models\NotificationPreference;
use App\Models\User;
use App\Notifications\Channels\WebPushChannel;

trait UsesPreferredChannels
{
    /**
     * The channels the user switched on. Mail only goes to a verified address, push only to a
     * user with at least one registered device.
     *
     * @return array<int, string>
     */
    public function via(User $notifiable): array
    {
        $preference = NotificationPreference::for($notifiable);
        $channels = [];

        if ($preference->email_enabled && $notifiable->hasVerifiedEmail()) {
            $channels[] = 'mail';
        }

        if ($preference->push_enabled && WebPushChannel::configured() && $notifiable->pushSubscriptions()->exists()) {
            $channels[] = WebPushChannel::class;
        }

        return $channels;
    }
}
