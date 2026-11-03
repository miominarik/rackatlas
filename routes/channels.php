<?php

use App\Services\Terminal\TerminalSessions;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('terminal.{session}', function ($user, string $session) {
    return app(TerminalSessions::class)->ownedBy($session, $user->id);
});
