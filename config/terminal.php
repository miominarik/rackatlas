<?php

return [

    /*
    | Web terminal: an SSH shell held by a queue worker and streamed to the browser through Laravel
    | Reverb. It needs BROADCAST_CONNECTION=reverb and a worker on the `terminal` queue:
    | `php artisan queue:work --queue=terminal --timeout=0`.
    */
    'queue' => 'terminal',

    /* Seconds a prepared session waits for the browser to subscribe before it gives up. */
    'attach_timeout' => 30,

    /* Minutes without a keystroke after which the session is closed. */
    'idle_minutes' => (int) env('TERMINAL_IDLE_MINUTES', 30),

    /* Hard limit of one session in minutes. */
    'max_minutes' => (int) env('TERMINAL_MAX_MINUTES', 240),

];
