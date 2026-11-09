<?php

use App\Http\Controllers\Admin\ActivityController as AdminActivityController;
use App\Http\Controllers\Admin\TeamController as AdminTeamController;
use App\Http\Controllers\Admin\UserController as AdminUserController;
use App\Http\Controllers\ApiDocsController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\BackupController;
use App\Http\Controllers\CrawlerController;
use App\Http\Controllers\CurrentTeamController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DatabaseController;
use App\Http\Controllers\DatabaseProcessController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\FeedbackController;
use App\Http\Controllers\HomeController;
use App\Http\Controllers\MapController;
use App\Http\Controllers\MetricsController;
use App\Http\Controllers\MetricsProcessesController;
use App\Http\Controllers\PrivacyController;
use App\Http\Controllers\Servers\LogController;
use App\Http\Controllers\Servers\ServerAgentController;
use App\Http\Controllers\Servers\ServerCategoryController;
use App\Http\Controllers\Servers\ServerController;
use App\Http\Controllers\Servers\SshKeyController;
use App\Http\Controllers\Servers\TestConnectionController;
use App\Http\Controllers\Settings\LanguageController;
use App\Http\Controllers\Terminal\TerminalController;
use App\Http\Controllers\Terminal\TerminalSessionController;
use Illuminate\Support\Facades\Route;

Route::get('/', HomeController::class)->name('home');
Route::get('privacy', PrivacyController::class)->name('privacy');
Route::get('api-docs', ApiDocsController::class)->name('api-docs');
Route::post('feedback', [FeedbackController::class, 'store'])->middleware('throttle:5,60')->name('feedback.store');

// One URL per language so every language can be indexed and linked with hreflang.
Route::get('{locale}', HomeController::class)->whereIn('locale', ['sk', 'cs', 'en'])->name('home.localized');
Route::get('{locale}/privacy', PrivacyController::class)->whereIn('locale', ['sk', 'cs', 'en'])->name('privacy.localized');
Route::get('robots.txt', [CrawlerController::class, 'robots'])->name('robots');
Route::get('sitemap.xml', [CrawlerController::class, 'sitemap'])->name('sitemap');

// Public on purpose: visitors without an account pick the language of the home page too.
Route::put('language', [LanguageController::class, 'update'])->name('language.update');

Route::prefix('app')->middleware(['auth', 'verified'])->group(function () {
    Route::get('/', [DashboardController::class, 'show'])->name('dashboard');
    Route::put('dashboard/settings', [DashboardController::class, 'update'])->name('dashboard.settings.update');
    Route::delete('dashboard/settings', [DashboardController::class, 'reset'])->name('dashboard.settings.reset');
    Route::post('dashboard/settings/copy', [DashboardController::class, 'copy'])->name('dashboard.settings.copy');
    Route::put('current-team', [CurrentTeamController::class, 'update'])->name('current-team.update');

    Route::get('servers', [ServerController::class, 'index'])->middleware('permission:servers.view')->name('servers.index');
    Route::get('servers/create', [ServerController::class, 'create'])->name('servers.create');
    Route::post('servers', [ServerController::class, 'store'])->name('servers.store');
    Route::post('servers/test-connection', TestConnectionController::class)
        ->middleware('throttle:20,1')
        ->name('servers.test-connection');
    Route::get('servers/{server}/agent', [ServerAgentController::class, 'show'])->name('servers.agent.show');
    Route::post('servers/{server}/agent/token', [ServerAgentController::class, 'rotate'])
        ->middleware('throttle:10,1')
        ->name('servers.agent.rotate');
    Route::get('servers/{server}', [ServerController::class, 'show'])->name('servers.show')->whereNumber('server');
    Route::get('servers/{server}/edit', [ServerController::class, 'edit'])->name('servers.edit');
    Route::put('servers/{server}', [ServerController::class, 'update'])->name('servers.update');
    Route::delete('servers/{server}/host-key', [ServerController::class, 'forgetHostKey'])->name('servers.host-key.destroy');
    Route::delete('servers/{server}', [ServerController::class, 'destroy'])->name('servers.destroy');

    Route::get('databases', [DatabaseController::class, 'index'])->middleware('permission:databases.view')->name('databases.index');
    Route::get('databases/{server}', [DatabaseController::class, 'show'])->name('databases.show')->whereNumber('server');
    Route::get('databases/{server}/processes', [DatabaseProcessController::class, 'index'])
        ->middleware('throttle:60,1')
        ->name('databases.processes.index')
        ->whereNumber('server');
    Route::post('databases/{server}/processes/{process}/kill', [DatabaseProcessController::class, 'kill'])
        ->middleware('throttle:30,1')
        ->name('databases.processes.kill')
        ->whereNumber(['server', 'process']);

    Route::get('map', MapController::class)->middleware('permission:map.view')->name('map');
    Route::get('terminal', TerminalController::class)->middleware('permission:terminal.edit')->name('terminal');
    Route::post('terminal/sessions', [TerminalSessionController::class, 'store'])
        ->middleware('throttle:30,1')
        ->name('terminal.sessions.store');
    Route::get('applications', [ApplicationController::class, 'index'])->middleware('permission:applications.view')->name('applications.index');
    Route::get('applications/{service}/journal', [ApplicationController::class, 'journal'])
        ->whereNumber('service')
        ->name('applications.journal');
    Route::post('applications/{service}/journal', [ApplicationController::class, 'requestJournal'])
        ->whereNumber('service')
        ->middleware('throttle:10,1')
        ->name('applications.journal.request');

    Route::get('metrics', [MetricsController::class, 'index'])->middleware('permission:metrics.view')->name('metrics.index');
    Route::get('metrics/processes', MetricsProcessesController::class)
        ->middleware(['throttle:60,1', 'permission:metrics.view'])
        ->name('metrics.processes');

    Route::get('logs', [LogController::class, 'index'])->middleware('permission:logs.view')->name('logs.index');
    Route::post('logs/resolve-all', [LogController::class, 'resolveAll'])->name('logs.resolve-all');
    Route::post('logs/{log}/resolve', [LogController::class, 'resolve'])->name('logs.resolve');
    Route::delete('logs/{log}/resolve', [LogController::class, 'reopen'])->name('logs.reopen');

    Route::get('ssh-keys', [SshKeyController::class, 'index'])->middleware('permission:ssh_keys.view')->name('ssh-keys.index');
    Route::post('ssh-keys', [SshKeyController::class, 'store'])->name('ssh-keys.store');
    Route::post('ssh-keys/{sshKey}/reveal', [SshKeyController::class, 'reveal'])
        ->middleware('throttle:5,1')
        ->name('ssh-keys.reveal');
    Route::delete('ssh-keys/{sshKey}', [SshKeyController::class, 'destroy'])->name('ssh-keys.destroy');

    Route::get('backups', [BackupController::class, 'index'])->middleware('permission:backups.view')->name('backups.index');
    Route::post('backups', [BackupController::class, 'store'])->name('backups.store');
    Route::put('backups/{backup}', [BackupController::class, 'update'])->name('backups.update');
    Route::post('backups/{backup}/regenerate', [BackupController::class, 'regenerate'])
        ->middleware('throttle:10,1')
        ->name('backups.regenerate');
    Route::delete('backups/{backup}', [BackupController::class, 'destroy'])->name('backups.destroy');

    Route::get('documents', [DocumentController::class, 'index'])->middleware('permission:docs.view')->name('documents.index');
    Route::get('documents/create', [DocumentController::class, 'create'])->middleware('permission:docs.edit')->name('documents.create');
    Route::post('documents', [DocumentController::class, 'store'])->name('documents.store');
    Route::get('documents/{document}', [DocumentController::class, 'show'])->name('documents.show')->whereNumber('document');
    Route::get('documents/{document}/edit', [DocumentController::class, 'edit'])->name('documents.edit')->whereNumber('document');
    Route::put('documents/{document}', [DocumentController::class, 'update'])->name('documents.update')->whereNumber('document');
    Route::post('documents/{document}/review', [DocumentController::class, 'review'])->name('documents.review')->whereNumber('document');
    Route::delete('documents/{document}', [DocumentController::class, 'destroy'])->name('documents.destroy')->whereNumber('document');

    Route::post('server-categories', [ServerCategoryController::class, 'store'])->name('server-categories.store');
    Route::patch('server-categories/{serverCategory}', [ServerCategoryController::class, 'update'])->name('server-categories.update');
    Route::delete('server-categories/{serverCategory}', [ServerCategoryController::class, 'destroy'])->name('server-categories.destroy');
});

Route::prefix('app/admin')->name('admin.')->middleware(['auth', 'verified', 'can:access-admin'])->group(function () {
    Route::redirect('/', '/app/admin/users')->name('index');

    Route::get('activity', [AdminActivityController::class, 'index'])->name('activity.index');

    Route::get('users', [AdminUserController::class, 'index'])->name('users.index');
    Route::get('users/create', [AdminUserController::class, 'create'])->name('users.create');
    Route::post('users', [AdminUserController::class, 'store'])->name('users.store');
    Route::get('users/{user}', [AdminUserController::class, 'edit'])->name('users.edit');
    Route::put('users/{user}', [AdminUserController::class, 'update'])->name('users.update');
    Route::post('users/{user}/sign-out', [AdminUserController::class, 'signOut'])->name('users.sign-out');
    Route::delete('users/{user}/two-factor', [AdminUserController::class, 'resetTwoFactor'])->name('users.two-factor.destroy');
    Route::delete('users/{user}', [AdminUserController::class, 'destroy'])->name('users.destroy');

    Route::get('teams', [AdminTeamController::class, 'index'])->name('teams.index');
    Route::post('teams', [AdminTeamController::class, 'store'])->name('teams.store');
    Route::get('teams/{team}', [AdminTeamController::class, 'show'])->name('teams.show');
    Route::put('teams/{team}', [AdminTeamController::class, 'update'])->name('teams.update');
    Route::put('teams/{team}/owner', [AdminTeamController::class, 'transferOwnership'])->name('teams.owner.update');
    Route::post('teams/{team}/members', [AdminTeamController::class, 'addMember'])->name('teams.members.store');
    Route::put('teams/{team}/members/{member}', [AdminTeamController::class, 'updateMember'])->name('teams.members.update');
    Route::delete('teams/{team}/members/{member}', [AdminTeamController::class, 'removeMember'])->name('teams.members.destroy');
    Route::delete('teams/{team}', [AdminTeamController::class, 'destroy'])->name('teams.destroy');
});

require __DIR__.'/settings.php';
