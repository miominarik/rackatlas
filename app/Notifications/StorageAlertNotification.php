<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Concerns\UsesPreferredChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * A storage container stopped answering (or answers again). Sent to everybody who wants
 * "server is offline" messages.
 */
class StorageAlertNotification extends Notification implements ShouldQueue
{
    use Queueable, UsesPreferredChannels;

    public int $tries = 3;

    /**
     * @return array<int, int>
     */
    public function backoff(): array
    {
        return [30, 120];
    }

    public function __construct(
        public readonly int $monitorId,
        public readonly string $name,
        public readonly string $error,
        public readonly bool $resolved = false,
    ) {
        $this->afterCommit();
    }

    public function title(): string
    {
        $title = __(':name storage is not available', ['name' => $this->name]);

        return $this->resolved ? __('Resolved: :title', ['title' => $title]) : $title;
    }

    public function body(): string
    {
        return $this->resolved ? __('The problem is gone.') : __($this->error);
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title())
            ->level($this->resolved ? 'success' : 'error')
            ->greeting($this->title())
            ->line($this->body())
            ->action(__('Open the storage'), route('storage.show', $this->monitorId))
            ->line(__('You can change which notifications you get in Settings → Notifications.'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toWebPush(User $notifiable): array
    {
        return [
            'title' => $this->title(),
            'body' => $this->body(),
            'url' => route('storage.show', $this->monitorId, false),
            'tag' => 'alert-storage-'.$this->monitorId,
        ];
    }
}
