<?php

namespace App\Notifications;

use App\Enums\AlertType;
use App\Models\User;
use App\Notifications\Concerns\UsesPreferredChannels;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * Something is wrong on a server (or it is fine again). The text is built when the
 * notification is sent, so it is written in the language of each recipient.
 */
class ServerAlertNotification extends Notification implements ShouldQueue
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

    /**
     * @param  array<string, mixed>  $context
     */
    public function __construct(
        public readonly string $serverName,
        public readonly AlertType $type,
        public readonly string $key,
        public readonly array $context,
        public readonly bool $resolved = false,
    ) {
        $this->afterCommit();
    }

    public function title(): string
    {
        $title = match (true) {
            $this->type === AlertType::Offline => __(':server is offline', ['server' => $this->serverName]),
            $this->type === AlertType::Service => __(':server: a service failed', ['server' => $this->serverName]),
            $this->type === AlertType::Log => __(':server: critical error in the log', ['server' => $this->serverName]),
            $this->key === 'cpu' => __(':server: high CPU usage', ['server' => $this->serverName]),
            $this->key === 'ram' => __(':server: high memory usage', ['server' => $this->serverName]),
            default => __(':server: disk is almost full', ['server' => $this->serverName]),
        };

        return $this->resolved ? __('Resolved: :title', ['title' => $title]) : $title;
    }

    public function body(): string
    {
        $context = $this->context;

        if ($this->resolved) {
            return __('The problem is gone.');
        }

        return match (true) {
            $this->type === AlertType::Offline => __('No data from the server for :minutes minutes.', ['minutes' => $context['minutes'] ?? '?']),
            $this->type === AlertType::Service => __('The systemd unit :unit failed.', ['unit' => $context['unit'] ?? '?']),
            $this->type === AlertType::Log => (string) ($context['message'] ?? ''),
            $this->key === 'cpu' => __('CPU usage is :value% (limit :limit%).', ['value' => $context['value'] ?? '?', 'limit' => $context['limit'] ?? '?']),
            $this->key === 'ram' => __('Memory usage is :value% (limit :limit%).', ['value' => $context['value'] ?? '?', 'limit' => $context['limit'] ?? '?']),
            default => __('Disk :mount is :value% full (limit :limit%).', ['mount' => $context['mount'] ?? '?', 'value' => $context['value'] ?? '?', 'limit' => $context['limit'] ?? '?']),
        };
    }

    public function toMail(User $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject($this->title())
            ->level($this->resolved ? 'success' : 'error')
            ->greeting($this->title())
            ->line($this->body())
            ->action(__('Open the dashboard'), route('dashboard'));

        if ($this->type === AlertType::Log && ($this->context['count'] ?? 1) > 1) {
            $message->line(__(':count critical entries in the last minutes.', ['count' => $this->context['count']]));
        }

        return $message->line(__('You can change which notifications you get in Settings → Notifications.'));
    }

    /**
     * @return array<string, mixed>
     */
    public function toWebPush(User $notifiable): array
    {
        return [
            'title' => $this->title(),
            'body' => $this->body(),
            'url' => route('dashboard', [], false),
            'tag' => 'alert-'.$this->type->value.'-'.md5($this->serverName.$this->key),
        ];
    }
}
