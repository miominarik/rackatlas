<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// The tasks run inside the scheduler process instead of starting `php artisan`
// sub-processes, because many shared hostings do not allow that.
Schedule::call(fn () => Artisan::call('servers:collect-metrics'))
    ->name('servers:collect-metrics')
    ->everyMinute()
    ->withoutOverlapping(5);

Schedule::call(fn () => Artisan::call('servers:check-agents'))
    ->name('servers:check-agents')
    ->everyMinute()
    ->withoutOverlapping(2);

Schedule::call(fn () => Artisan::call('servers:evaluate-alerts'))
    ->name('servers:evaluate-alerts')
    ->everyMinute()
    ->withoutOverlapping(2);

Schedule::call(fn () => Artisan::call('servers:thin-processes'))
    ->name('servers:thin-processes')
    ->dailyAt('03:30');

Schedule::call(fn () => Artisan::call('model:prune'))
    ->name('model:prune')
    ->daily();

// The queued jobs (metrics collection, notifications) are processed by the permanent
// queue worker of the hosting, so the scheduler does not run `queue:work` itself.
