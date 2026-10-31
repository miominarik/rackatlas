<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Contracts\Auth\Authenticatable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

/**
 * Sign-ins, sign-outs, failed attempts and password resets go to the activity log.
 */
class LogAuthActivity
{
    public function login(Login $event): void
    {
        $this->record('login', $event->user);
    }

    public function logout(Logout $event): void
    {
        if ($event->user !== null) {
            $this->record('logout', $event->user);
        }
    }

    public function failed(Failed $event): void
    {
        $this->record('login-failed', $event->user, ['email' => Str::limit((string) ($event->credentials['email'] ?? ''), 255, '')]);
    }

    public function passwordReset(PasswordReset $event): void
    {
        $this->record('password-reset', $event->user);
    }

    /**
     * @param  array<string, mixed>  $extra
     */
    private function record(string $event, ?Authenticatable $user, array $extra = []): void
    {
        $logger = activity('auth')
            ->event($event)
            ->withProperties([
                'ip' => request()->ip(),
                'user_agent' => Str::limit((string) request()->userAgent(), 255, ''),
                ...$extra,
            ]);

        if ($user instanceof Model) {
            $logger->causedBy($user)->performedOn($user);
        }

        $logger->log($event);
    }
}
