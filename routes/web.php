<?php

use App\Http\Controllers\CurrentTeamController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\Servers\ServerCategoryController;
use App\Http\Controllers\Servers\ServerController;
use App\Http\Controllers\Servers\SshKeyController;
use App\Http\Controllers\Servers\TestConnectionController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/app')->name('home');

Route::prefix('app')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'show'])->name('dashboard');
    Route::put('dashboard/settings', [DashboardController::class, 'update'])->name('dashboard.settings.update');
    Route::delete('dashboard/settings', [DashboardController::class, 'reset'])->name('dashboard.settings.reset');
    Route::put('current-team', [CurrentTeamController::class, 'update'])->name('current-team.update');

    Route::get('servers', [ServerController::class, 'index'])->name('servers.index');
    Route::get('servers/create', [ServerController::class, 'create'])->name('servers.create');
    Route::post('servers', [ServerController::class, 'store'])->name('servers.store');
    Route::post('servers/test-connection', TestConnectionController::class)
        ->middleware('throttle:20,1')
        ->name('servers.test-connection');
    Route::get('servers/{server}/edit', [ServerController::class, 'edit'])->name('servers.edit');
    Route::put('servers/{server}', [ServerController::class, 'update'])->name('servers.update');
    Route::delete('servers/{server}', [ServerController::class, 'destroy'])->name('servers.destroy');

    Route::get('ssh-keys', [SshKeyController::class, 'index'])->name('ssh-keys.index');
    Route::post('ssh-keys', [SshKeyController::class, 'store'])->name('ssh-keys.store');
    Route::delete('ssh-keys/{sshKey}', [SshKeyController::class, 'destroy'])->name('ssh-keys.destroy');

    Route::post('server-categories', [ServerCategoryController::class, 'store'])->name('server-categories.store');
    Route::patch('server-categories/{serverCategory}', [ServerCategoryController::class, 'update'])->name('server-categories.update');
    Route::delete('server-categories/{serverCategory}', [ServerCategoryController::class, 'destroy'])->name('server-categories.destroy');
});

require __DIR__.'/settings.php';
