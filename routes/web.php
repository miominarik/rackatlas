<?php

use App\Http\Controllers\CurrentTeamController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\Servers\LogController;
use App\Http\Controllers\Servers\ServerAgentController;
use App\Http\Controllers\Servers\ServerCategoryController;
use App\Http\Controllers\Servers\ServerController;
use App\Http\Controllers\Servers\SshKeyController;
use App\Http\Controllers\Servers\TestConnectionController;
use App\Http\Controllers\Settings\LanguageController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('privacy', PrivacyController::class)->name('privacy');

// Public on purpose: visitors without an account pick the language of the home page too.
Route::put('language', [LanguageController::class, 'update'])->name('language.update');

Route::prefix('app')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'show'])->name('dashboard');
    Route::put('dashboard/settings', [DashboardController::class, 'update'])->name('dashboard.settings.update');
    Route::delete('dashboard/settings', [DashboardController::class, 'reset'])->name('dashboard.settings.reset');
    Route::post('dashboard/settings/copy', [DashboardController::class, 'copy'])->name('dashboard.settings.copy');
    Route::put('current-team', [CurrentTeamController::class, 'update'])->name('current-team.update');

    Route::get('servers', [ServerController::class, 'index'])->name('servers.index');
    Route::get('servers/create', [ServerController::class, 'create'])->name('servers.create');
    Route::post('servers', [ServerController::class, 'store'])->name('servers.store');
    Route::post('servers/test-connection', TestConnectionController::class)
        ->middleware('throttle:20,1')
        ->name('servers.test-connection');
    Route::get('servers/{server}/agent', [ServerAgentController::class, 'show'])->name('servers.agent.show');
    Route::post('servers/{server}/agent/token', [ServerAgentController::class, 'rotate'])
        ->middleware('throttle:10,1')
        ->name('servers.agent.rotate');
    Route::get('servers/{server}/edit', [ServerController::class, 'edit'])->name('servers.edit');
    Route::put('servers/{server}', [ServerController::class, 'update'])->name('servers.update');
    Route::delete('servers/{server}', [ServerController::class, 'destroy'])->name('servers.destroy');

    Route::get('metrics', [MetricsController::class, 'index'])->name('metrics.index');

    Route::get('logs', [LogController::class, 'index'])->name('logs.index');
    Route::post('logs/resolve-all', [LogController::class, 'resolveAll'])->name('logs.resolve-all');
    Route::post('logs/{log}/resolve', [LogController::class, 'resolve'])->name('logs.resolve');
    Route::delete('logs/{log}/resolve', [LogController::class, 'reopen'])->name('logs.reopen');

    Route::get('ssh-keys', [SshKeyController::class, 'index'])->name('ssh-keys.index');
    Route::post('ssh-keys', [SshKeyController::class, 'store'])->name('ssh-keys.store');
    Route::delete('ssh-keys/{sshKey}', [SshKeyController::class, 'destroy'])->name('ssh-keys.destroy');

    Route::post('server-categories', [ServerCategoryController::class, 'store'])->name('server-categories.store');
    Route::patch('server-categories/{serverCategory}', [ServerCategoryController::class, 'update'])->name('server-categories.update');
    Route::delete('server-categories/{serverCategory}', [ServerCategoryController::class, 'destroy'])->name('server-categories.destroy');
});

require __DIR__.'/settings.php';
