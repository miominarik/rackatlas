<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\TeamInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AcceptTeamInvitationController extends Controller
{
    /**
     * Show the invitation and ask for confirmation. Opening the link changes nothing, because
     * mail scanners and link previews open links too.
     */
    public function show(Request $request, string $token): Response
    {
        $invitation = $this->find($token);

        return Inertia::render('settings/teams/accept-invitation', [
            'token' => $token,
            'team' => $invitation->team->name,
            'role' => $invitation->role->value,
            'email' => $invitation->email,
            'expired' => $invitation->isExpired(),
            'forThisAccount' => strcasecmp($invitation->email, $request->user()->email) === 0,
        ]);
    }

    /**
     * Accept a team invitation sent to the signed-in user's email address.
     */
    public function accept(Request $request, string $token): RedirectResponse
    {
        $invitation = $this->find($token);

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

    private function find(string $token): TeamInvitation
    {
        return TeamInvitation::where('token', TeamInvitation::hashToken($token))->with('team')->firstOrFail();
    }
}
