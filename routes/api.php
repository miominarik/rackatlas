<?php

use App\Http\Controllers\Api\AgentDockerLogsController;
use App\Http\Controllers\Api\AgentIngestController;
use App\Http\Controllers\Api\AgentJournalController;
use App\Http\Controllers\Api\AgentTerminalController;
use App\Http\Controllers\Api\BackupWebhookController;
use App\Http\Controllers\Api\TerminalBridgeController;
use App\Http\Controllers\Api\V1;
use App\Http\Middleware\AuthenticateAgent;
use App\Http\Middleware\AuthenticateApiToken;
use App\Http\Middleware\AuthenticateTerminalBridge;
use App\Http\Middleware\RequireJson;
use Illuminate\Support\Facades\Route;

Route::post('agent/ingest', AgentIngestController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.ingest');

Route::post('agent/journal', AgentJournalController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.journal');

Route::post('agent/docker-logs', AgentDockerLogsController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.docker-logs');

Route::get('agent/terminal', AgentTerminalController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.terminal');

Route::middleware(AuthenticateTerminalBridge::class)->prefix('terminal')->group(function () {
    Route::post('exchange', [TerminalBridgeController::class, 'exchange'])->name('terminal.exchange');
    Route::post('agent-auth', [TerminalBridgeController::class, 'agentAuth'])->name('terminal.agent-auth');
    Route::post('session-ended', [TerminalBridgeController::class, 'sessionEnded'])->name('terminal.session-ended');
    Route::post('host-key', [TerminalBridgeController::class, 'pinHostKey'])->name('terminal.host-key');
});

Route::match(['get', 'post'], 'webhooks/backups/{token}', BackupWebhookController::class)
    ->middleware('throttle:60,1')
    ->name('webhooks.backups');

// External API for the keys of a team (Grafana and the like): JSON only, read-only, every route needs a scope.
Route::prefix('v1')->name('api.v1.')->middleware([RequireJson::class, AuthenticateApiToken::class])->group(function () {
    Route::get('me', V1\MeController::class)->name('me');

    Route::middleware('api.scope:servers:read')->group(function () {
        Route::get('servers', [V1\ServerController::class, 'index'])->name('servers.index');
        Route::get('servers/{server}', [V1\ServerController::class, 'show'])->whereNumber('server')->name('servers.show');
    });

    Route::middleware('api.scope:metrics:read')->group(function () {
        Route::get('servers/{server}/metrics', [V1\ServerMetricController::class, 'index'])->whereNumber('server')->name('servers.metrics');
        Route::get('servers/{server}/metrics/disks', [V1\ServerMetricController::class, 'disks'])->whereNumber('server')->name('servers.metrics.disks');
    });

    Route::get('applications', [V1\ApplicationController::class, 'index'])->middleware('api.scope:applications:read')->name('applications.index');
    Route::get('backups', [V1\BackupController::class, 'index'])->middleware('api.scope:backups:read')->name('backups.index');
    Route::get('alerts', [V1\AlertController::class, 'index'])->middleware('api.scope:alerts:read')->name('alerts.index');
});
