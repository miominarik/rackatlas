<?php

namespace App\Http\Controllers;

use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class CurrentTeamController extends Controller
{
    public const SESSION_KEY = 'current_team_id';

    /**
     * Switch the team the signed-in user is currently working in.
     */
    public function update(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'team_id' => ['required', 'integer'],
        ]);

        $team = $request->user()->teams()->whereKey($validated['team_id'])->firstOrFail();

        $request->session()->put(self::SESSION_KEY, $team->id);

        return back();
    }
}
