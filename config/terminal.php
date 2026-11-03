<?php

return [

    /*
    | The WebSocket address the browser connects to (wss:// on HTTPS sites), usually its own
    | subdomain. The Node app behind it is started with `npm run terminal`.
    */
    'url' => env('TERMINAL_URL', 'ws://127.0.0.1:8787'),

    /*
    | Shared secret the Node app uses to ask this app for the login details of a server.
    | An empty value turns the terminal off.
    */
    'secret' => env('TERMINAL_SECRET'),

    /* Seconds a one-time ticket stays valid between opening a tab and the Node app picking it up. */
    'ticket_ttl' => 60,

    /* Minutes without a keystroke after which the session is closed. */
    'idle_minutes' => (int) env('TERMINAL_IDLE_MINUTES', 30),

];
