<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * A piece of the screen of a terminal session. Sent immediately: waiting in a queue would add lag.
 */
class TerminalOutput implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets;

    /** @param  string  $data  raw bytes of the shell, base64 encoded to survive JSON */
    public function __construct(public string $sessionId, public string $data) {}

    public function broadcastOn(): Channel
    {
        return new PrivateChannel("terminal.{$this->sessionId}");
    }

    public function broadcastAs(): string
    {
        return 'output';
    }

    /**
     * @return array{d: string}
     */
    public function broadcastWith(): array
    {
        return ['d' => $this->data];
    }
}
