<?php

namespace App\Jobs;

use App\Enums\ServerAuthType;
use App\Events\TerminalOutput;
use App\Events\TerminalStatus;
use App\Exceptions\HostKeyMismatchException;
use App\Exceptions\TerminalRefusedException;
use App\Models\Server;
use App\Models\User;
use App\Services\Ssh\HostKeyVerifier;
use App\Services\Ssh\PublicHost;
use App\Services\Terminal\TerminalSessions;
use App\Services\Terminal\TerminalSsh;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use InvalidArgumentException;
use phpseclib4\Crypt\PublicKeyLoader;
use Throwable;

/**
 * Holds the SSH shell of one terminal session for as long as it lives: keystrokes are taken from the
 * cache, the output is broadcast to the browser through Reverb. Needs a worker on the terminal queue.
 */
class RunTerminalSession implements ShouldQueue
{
    use Queueable;

    public int $tries = 1;

    /** Bytes of shell output per broadcast; Reverb refuses messages above 10 KB. */
    private const CHUNK_BYTES = 4096;

    private const CONNECT_TIMEOUT_SECONDS = 10;

    private const POLL_SECONDS = 0.1;

    public function __construct(public string $sessionId)
    {
        $this->onQueue(config('terminal.queue'));
        $this->timeout = ((int) config('terminal.max_minutes') + 5) * 60;
    }

    public function handle(TerminalSessions $sessions): void
    {
        $meta = $sessions->meta($this->sessionId);

        if ($meta === null || ! $this->waitForBrowser($sessions)) {
            $sessions->forget($this->sessionId);

            return;
        }

        $ssh = null;

        try {
            $ssh = $this->connect($sessions, $meta);
            $this->broadcastStatus('ready');
            $this->relay($sessions, $ssh);
            $this->broadcastStatus('closed');
        } catch (Throwable $exception) {
            if (! $exception instanceof TerminalRefusedException) {
                report($exception);
            }

            $this->broadcastStatus('error', $exception instanceof TerminalRefusedException ? $exception->getMessage() : __('The connection to the server was lost.'));
        } finally {
            try {
                $ssh?->disconnect();
            } catch (Throwable) {
                // Already gone.
            }

            $sessions->forget($this->sessionId);
        }
    }

    /** The browser has to be subscribed before the first byte is sent, or the greeting would be lost. */
    private function waitForBrowser(TerminalSessions $sessions): bool
    {
        $deadline = microtime(true) + (int) config('terminal.attach_timeout');

        while (microtime(true) < $deadline) {
            if ($sessions->isClosed($this->sessionId)) {
                return false;
            }

            if ($sessions->isAttached($this->sessionId)) {
                return true;
            }

            usleep(100_000);
        }

        return false;
    }

    /**
     * @param  array{user_id: int, server_id: int}  $meta
     */
    private function connect(TerminalSessions $sessions, array $meta): TerminalSsh
    {
        $user = User::find($meta['user_id']);
        $server = Server::with(['team', 'sshKey'])->find($meta['server_id']);

        if ($user === null || $server === null || ! $user->can('manage', $server->team) || $server->auth_type === ServerAuthType::Agent) {
            throw new TerminalRefusedException(__('You are not allowed to open a terminal on this server.'));
        }

        try {
            $host = trim(PublicHost::resolve($server->host), '[]');
            $credential = $server->auth_type === ServerAuthType::Key && $server->sshKey
                ? PublicKeyLoader::load($server->sshKey->private_key, $server->sshKey->passphrase ?: false)
                : (string) $server->password;
        } catch (InvalidArgumentException $exception) {
            throw new TerminalRefusedException($exception->getMessage());
        } catch (Throwable) {
            throw new TerminalRefusedException(__('The SSH key could not be used.'));
        }

        activity('auth')->event('terminal-opened')->causedBy($user)->performedOn($server)
            ->withProperties(['server' => $server->name])
            ->log('terminal-opened');

        try {
            $ssh = new TerminalSsh($host, $server->port, self::CONNECT_TIMEOUT_SECONDS);
            $ssh->setTimeout(self::CONNECT_TIMEOUT_SECONDS);

            $fingerprint = HostKeyVerifier::fingerprint($ssh);
            HostKeyVerifier::assertTrusted($server->ssh_host_fingerprint, $fingerprint);
        } catch (HostKeyMismatchException) {
            throw new TerminalRefusedException(__('The host key of the server has changed. If the server was reinstalled, reset the stored host key; otherwise someone may be impersonating it.'));
        } catch (Throwable) {
            throw new TerminalRefusedException(__('Could not connect to :host on port :port.', ['host' => $server->host, 'port' => $server->port]));
        }

        if ($server->ssh_host_fingerprint === null) {
            Server::whereKey($server->id)->whereNull('ssh_host_fingerprint')->update(['ssh_host_fingerprint' => $fingerprint]);
        }

        if (! $ssh->login($server->username, $credential)) {
            throw new TerminalRefusedException($server->auth_type === ServerAuthType::Key
                ? __('The server rejected the SSH key. Add the public key to ~/.ssh/authorized_keys of this user.')
                : __('Authentication failed. Check the username and password.'));
        }

        [$columns, $rows] = $sessions->pullSize($this->sessionId) ?? [80, 24];
        $ssh->setTerminal('xterm-256color');
        $ssh->setWindowSize($columns, $rows);
        $ssh->openShell();

        return $ssh;
    }

    private function relay(TerminalSessions $sessions, TerminalSsh $ssh): void
    {
        $maxUntil = now()->addMinutes((int) config('terminal.max_minutes'));
        $idleLimit = (int) config('terminal.idle_minutes');
        $lastInput = now();

        while (! $sessions->isClosed($this->sessionId)) {
            if (now()->greaterThan($maxUntil) || now()->diffInMinutes($lastInput, true) >= $idleLimit) {
                $this->broadcastOutput("\r\n\x1b[90m[".__('Session ended after inactivity.').']\x1b[0m\r\n');

                return;
            }

            $input = $sessions->pullInput($this->sessionId);

            if ($input !== '') {
                $ssh->write($input);
                $lastInput = now();
            }

            if (($size = $sessions->pullSize($this->sessionId)) !== null) {
                $ssh->resizeShell(...$size);
            }

            $output = $ssh->pump(self::POLL_SECONDS);

            if ($output === null) {
                return;
            }

            if ($output !== '') {
                $this->broadcastOutput($output);
            }
        }
    }

    private function broadcastOutput(string $bytes): void
    {
        foreach (str_split($bytes, self::CHUNK_BYTES) as $chunk) {
            broadcast(new TerminalOutput($this->sessionId, base64_encode($chunk)));
        }
    }

    private function broadcastStatus(string $state, ?string $message = null): void
    {
        broadcast(new TerminalStatus($this->sessionId, $state, $message));
    }
}
