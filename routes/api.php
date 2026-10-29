<?php

use App\Http\Controllers\Api\AgentIngestController;
use App\Http\Middleware\AuthenticateAgent;
use Illuminate\Support\Facades\Route;

Route::post('agent/ingest', AgentIngestController::class)
    ->middleware(['throttle:agent', AuthenticateAgent::class])
    ->name('agent.ingest');
