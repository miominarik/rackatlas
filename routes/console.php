<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// Run by the scheduler of the server: `php artisan schedule:work` as a service or
// `* * * * * php artisan schedule:run` in cron. Every task is its own `php artisan` process, so a slow
// one never delays the others. The queued jobs (metrics collection, notifications) are processed by
// the queue worker service (`php artisan queue:work`), not by the scheduler.
Schedule::command('servers:collect-metrics')->everyMinute()->withoutOverlapping(5)->runInBackground();
Schedule::command('servers:check-agents')->everyMinute()->withoutOverlapping(2)->runInBackground();
Schedule::command('servers:evaluate-alerts')->everyMinute()->withoutOverlapping(2)->runInBackground();
Schedule::command('backups:check')->everyFiveMinutes()->withoutOverlapping(5)->runInBackground();
Schedule::command('cloudflare:refresh-ips')->dailyAt('03:10');
Schedule::command('servers:thin-processes')->dailyAt('03:30');
Schedule::command('model:prune')->daily();
Schedule::command('activitylog:clean')->daily();
