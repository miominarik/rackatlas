<?php

namespace App\Notifications;

use App\Models\User;
use App\Notifications\Concerns\UsesPreferredChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * A backup did not report in the expected time. The text is built when the notification is
 * sent, so it is written in the language of each recipient.
 */
class BackupOverdueNotification extends Notification implements ShouldQueue
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
        public readonly int $backupId,
        public readonly string $backupName,
        public readonly int $expectedHours,
    ) {
        $this->afterCommit();
    }

    public function title(): string
    {
        return __('Backup :name did not run', ['name' => $this->backupName]);
    }

    public function body(): string
    {
        return __('No run was reported in the expected :hours hours.', ['hours' => $this->expectedHours]);
    }

    public function toMail(User $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject($this->title())
            ->level('error')
            ->greeting($this->title())
            ->line($this->body())
            ->action(__('Open the backups'), route('backups.index'))
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
            'url' => route('backups.index', [], false),
            'tag' => 'backup-'.$this->backupId,
        ];
    }
}
