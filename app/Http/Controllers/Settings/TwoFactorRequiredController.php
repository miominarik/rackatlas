<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class TwoFactorRequiredController extends Controller
{
    /**
     * The screen a user lands on when an administrator made two-factor authentication mandatory
     * and it is not on yet: it says why, and sets it up on the spot.
     */
    public function show(Request $request): Response|RedirectResponse
    {
        $user = $request->user();

        if (! $user->two_factor_required || $user->hasEnabledTwoFactorAuthentication()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('auth/two-factor-required', [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'twoFactorEnabled' => false,
            'requiresConfirmation' => Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm'),
        ]);
    }
}
