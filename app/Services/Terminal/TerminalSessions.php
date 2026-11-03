<?php

namespace App\Services\Terminal;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Str;

/**
 * The state shared between the browser requests and the queue worker that holds the SSH shell.
 * It lives in the cache: the browser pushes keystrokes in, the worker pulls them out.
 */
class TerminalSessions
{
    public function create(int $userId, int $serverId): string
    {
        $id = (string) Str::uuid();

        Cache::put($this->key($id, 'meta'), ['user_id' => $userId, 'server_id' => $serverId], $this->lifetime());

        return $id;
    }

    /**
     * @return array{user_id: int, server_id: int}|null
     */
    public function meta(string $id): ?array
    {
        return Cache::get($this->key($id, 'meta'));
    }

    public function ownedBy(string $id, int $userId): bool
    {
        return ($this->meta($id)['user_id'] ?? null) === $userId;
    }

    /** The browser subscribed to the channel and is ready to receive output. */
    public function markAttached(string $id): void
    {
        Cache::put($this->key($id, 'attached'), true, $this->lifetime());
    }

    public function isAttached(string $id): bool
    {
        return Cache::has($this->key($id, 'attached'));
    }

    public function pushInput(string $id, string $data): void
    {
        Cache::lock($this->key($id, 'lock'), 2)->block(2, function () use ($id, $data): void {
            $pending = Cache::get($this->key($id, 'input'), '');
            Cache::put($this->key($id, 'input'), $pending.$data, $this->lifetime());
        });
    }

    public function pullInput(string $id): string
    {
        if (! Cache::has($this->key($id, 'input'))) {
            return '';
        }

        return Cache::lock($this->key($id, 'lock'), 2)->block(2, function () use ($id): string {
            return (string) Cache::pull($this->key($id, 'input'), '');
        });
    }

    public function setSize(string $id, int $columns, int $rows): void
    {
        Cache::put($this->key($id, 'size'), [$columns, $rows], $this->lifetime());
    }

    /**
     * @return array{0: int, 1: int}|null the size the browser asked for since the last call
     */
    public function pullSize(string $id): ?array
    {
        return Cache::pull($this->key($id, 'size'));
    }

    public function close(string $id): void
    {
        Cache::put($this->key($id, 'closed'), true, $this->lifetime());
    }

    public function isClosed(string $id): bool
    {
        return Cache::has($this->key($id, 'closed'));
    }

    public function forget(string $id): void
    {
        foreach (['meta', 'attached', 'input', 'size', 'closed', 'lock'] as $part) {
            Cache::forget($this->key($id, $part));
        }
    }

    private function key(string $id, string $part): string
    {
        return "terminal:{$id}:{$part}";
    }

    private function lifetime(): \DateTimeInterface
    {
        return now()->addMinutes((int) config('terminal.max_minutes') + 10);
    }
}
