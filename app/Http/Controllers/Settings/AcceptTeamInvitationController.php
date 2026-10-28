<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class AcceptTeamInvitationController extends Controller
{
    /**
     * Accept a team invitation sent to the signed-in user's email address.
     */
    public function __invoke(Request $request, string $token): RedirectResponse
    {
        $invitation = TeamInvitation::where('token', $token)->with('team')->firstOrFail();

        if (strcasecmp($invitation->email, $request->user()->email) !== 0) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('This invitation was sent to a different email address.'),
            ]);

            return to_route('teams.index');
        }

        if ($invitation->isExpired()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('This invitation has expired. Ask the team to send a new one.'),
            ]);

            return to_route('teams.index');
        }

        $invitation->team->members()->syncWithoutDetaching([
            $request->user()->id => ['role' => $invitation->role->value],
        ]);

        $invitation->delete();

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => __('You joined :team.', ['team' => $invitation->team->name]),
        ]);

        return to_route('teams.show', $invitation->team);
    }
}
