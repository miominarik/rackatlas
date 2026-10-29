<?php

use App\Http\Controllers\Settings\AcceptTeamInvitationController;
use App\Http\Controllers\Settings\LanguageController;
use App\Http\Controllers\Settings\NotificationController;
use App\Http\Controllers\Settings\NotificationDiagnosticsController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\PushSubscriptionController;
use App\Http\Controllers\Settings\SecurityController;
use App\Http\Controllers\Settings\TeamController;
use App\Http\Controllers\Settings\TeamInvitationController;
use App\Http\Controllers\Settings\TeamMemberController;
use Illuminate\Auth\Middleware\RequirePassword;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth'])->group(function () {
    Route::redirect('app/settings', '/app/settings/profile');

    Route::get('app/settings/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('app/settings/profile', [ProfileController::class, 'update'])->name('profile.update');

    Route::get('app/settings/language', [LanguageController::class, 'edit'])->name('language.edit');
    Route::put('app/settings/language', [LanguageController::class, 'update'])->name('language.update');
});

Route::middleware(['auth', 'verified'])->group(function () {
    Route::delete('app/settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('app/settings/security', [SecurityController::class, 'edit'])
        ->middleware(RequirePassword::class)
        ->name('security.edit');

    Route::put('app/settings/password', [SecurityController::class, 'update'])
        ->middleware('throttle:6,1')
        ->name('user-password.update');

    Route::inertia('app/settings/appearance', 'settings/appearance')->name('appearance.edit');

    Route::get('app/settings/notifications', [NotificationController::class, 'edit'])->name('notifications.edit');
    Route::put('app/settings/notifications', [NotificationController::class, 'update'])->name('notifications.update');
    Route::post('app/settings/notifications/test', [NotificationController::class, 'test'])
        ->middleware('throttle:6,1')
        ->name('notifications.test');
    Route::get('app/settings/notifications/diagnostics', [NotificationDiagnosticsController::class, 'show'])->name('notification-diagnostics.show');
    Route::post('app/settings/notifications/diagnostics/connectivity', [NotificationDiagnosticsController::class, 'connectivity'])
        ->middleware('throttle:10,1')
        ->name('notification-diagnostics.connectivity');
    Route::post('app/settings/notifications/diagnostics/push', [NotificationDiagnosticsController::class, 'push'])
        ->middleware('throttle:10,1')
        ->name('notification-diagnostics.push');
    Route::post('app/settings/notifications/push', [PushSubscriptionController::class, 'store'])
        ->middleware('throttle:20,1')
        ->name('push-subscriptions.store');
    Route::delete('app/settings/notifications/push/{subscription}', [PushSubscriptionController::class, 'destroy'])
        ->name('push-subscriptions.destroy');

    Route::get('app/settings/teams', [TeamController::class, 'index'])->name('teams.index');
    Route::post('app/settings/teams', [TeamController::class, 'store'])->name('teams.store');

    Route::prefix('app/settings/teams/{team}')->scopeBindings()->group(function () {
        Route::get('/', [TeamController::class, 'show'])->name('teams.show');
        Route::patch('/', [TeamController::class, 'update'])->name('teams.update');
        Route::delete('/', [TeamController::class, 'destroy'])->name('teams.destroy');

        Route::patch('members/{member}', [TeamMemberController::class, 'update'])->name('teams.members.update');
        Route::delete('members/{member}', [TeamMemberController::class, 'destroy'])->name('teams.members.destroy');

        Route::post('invitations', [TeamInvitationController::class, 'store'])->name('teams.invitations.store');
        Route::post('invitations/{invitation}/resend', [TeamInvitationController::class, 'resend'])
            ->middleware('throttle:6,1')
            ->name('teams.invitations.resend');
        Route::delete('invitations/{invitation}', [TeamInvitationController::class, 'destroy'])->name('teams.invitations.destroy');
    });

    Route::get('app/invitations/{token}', AcceptTeamInvitationController::class)->name('team-invitations.accept');
});

Route::get('.well-known/passkey-endpoints', function () {
    return response()->json([
        'enroll' => route('security.edit'),
        'manage' => route('security.edit'),
    ]);
})->name('well-known.passkeys');
