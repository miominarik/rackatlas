<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Teams\StoreTeamInvitationRequest;
use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Inertia\Inertia;

class TeamInvitationController extends Controller
{
    /**
     * Invite a person to the team by email.
     */
    public function store(StoreTeamInvitationRequest $request, Team $team): RedirectResponse
    {
        $this->authorize('manage', $team);

        $token = TeamInvitation::newToken();

        $invitation = $team->invitations()->create([
            ...$request->validated(),
            'email' => Str::lower($request->validated('email')),
            'token' => TeamInvitation::hashToken($token),
            'invited_by' => $request->user()->id,
            'expires_at' => now()->addDays(TeamInvitation::VALID_DAYS),
        ]);

        Mail::to($invitation->email)->send(new TeamInvitationMail($invitation, $token));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation sent.')]);

        return to_route('teams.show', $team);
    }

    /**
     * Send the invitation again with a fresh token and expiry.
     */
    public function resend(Team $team, TeamInvitation $invitation): RedirectResponse
    {
        $this->authorize('manage', $team);

        $token = TeamInvitation::newToken();

        $invitation->update([
            'token' => TeamInvitation::hashToken($token),
            'expires_at' => now()->addDays(TeamInvitation::VALID_DAYS),
        ]);

        Mail::to($invitation->email)->send(new TeamInvitationMail($invitation, $token));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation sent again.')]);

        return to_route('teams.show', $team);
    }

    /**
     * Cancel a pending invitation.
     */
    public function destroy(Team $team, TeamInvitation $invitation): RedirectResponse
    {
        $this->authorize('manage', $team);

        $invitation->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Invitation cancelled.')]);

        return to_route('teams.show', $team);
    }
}
