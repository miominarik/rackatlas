<?php

use App\Http\Controllers\Api\AgentIngestController;
use App\Http\Controllers\Api\AgentJournalController;
use App\Http\Controllers\Api\AgentTerminalController;
use App\Http\Controllers\Api\BackupWebhookController;
use App\Http\Controllers\Api\TerminalBridgeController;
use App\Http\Middleware\AuthenticateAgent;
use App\Http\Middleware\AuthenticateTerminalBridge;
use Illuminate\Support\Facades\Route;

Route::post('agent/ingest', AgentIngestController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.ingest');

Route::post('agent/journal', AgentJournalController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.journal');

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
