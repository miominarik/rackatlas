<?php

use App\Http\Controllers\Api\AgentIngestController;
use App\Http\Controllers\Api\TerminalBridgeController;
use App\Http\Middleware\AuthenticateAgent;
use App\Http\Middleware\AuthenticateTerminalBridge;
use Illuminate\Support\Facades\Route;

Route::post('agent/ingest', AgentIngestController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.ingest');

Route::middleware(AuthenticateTerminalBridge::class)->prefix('terminal')->group(function () {
    Route::post('exchange', [TerminalBridgeController::class, 'exchange'])->name('terminal.exchange');
    Route::post('host-key', [TerminalBridgeController::class, 'pinHostKey'])->name('terminal.host-key');
});
