<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::command('servers:collect-metrics')
    ->everyMinute()
    ->withoutOverlapping(5)
    ->onOneServer();

Schedule::command('model:prune')->daily();

// Processes the queued jobs (metrics collection) without a permanent worker,
// so one `schedule:run` cron entry is enough, also on shared hosting.
Schedule::command('queue:work', ['--stop-when-empty', '--max-time=50', '--sleep=1'])
    ->everyMinute()
    ->withoutOverlapping(2)
    ->onOneServer();
