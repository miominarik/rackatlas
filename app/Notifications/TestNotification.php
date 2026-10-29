<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Concerns\UsesPreferredChannels;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Sent on request from the notification settings, to check that the channels work.
 */
class TestNotification extends Notification
{
    use UsesPreferredChannels;

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject(__('Test notification'))
            ->greeting(__('Test notification'))
            ->line(__('Notifications from :app work. You will receive alerts like this one when a server has a problem.', ['app' => config('app.name')]))
            ->action(__('Open the dashboard'), route('dashboard'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toWebPush(User $notifiable): array
    {
        return [
            'title' => __('Test notification'),
            'body' => __('Push notifications work on this device.'),
            'url' => route('dashboard', [], false),
            'tag' => 'test',
        ];
    }
}
