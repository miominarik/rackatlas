<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

class TerminalStatus implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /** @param  'ready'|'closed'|'error'  $state */
    public function __construct(public string $sessionId, public string $state, public ?string $message = null) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("terminal.{$this->sessionId}");
    }

    public function broadcastAs(): string
    {
        return 'status';
    }

    /**
     * @return array{state: string, message: string|null}
     */
    public function broadcastWith(): array
    {
        return ['state' => $this->state, 'message' => $this->message];
    }
}
