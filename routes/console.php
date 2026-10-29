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

Schedule::call(fn () => Artisan::call('model:prune'))
    ->name('model:prune')
    ->daily();

// Processes the queued jobs (metrics collection) without a permanent worker.
Schedule::call(fn () => Artisan::call('queue:work', [
    '--stop-when-empty' => true,
    '--max-time' => 45,
    '--sleep' => 1,
]))
    ->name('queue:work')
    ->everyMinute()
    ->withoutOverlapping(2);
