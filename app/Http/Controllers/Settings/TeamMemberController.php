<?php

namespace App\Http\Controllers\Settings;

use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Teams\UpdateTeamMemberRequest;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;

class TeamMemberController extends Controller
{
    /**
     * Change the role or the permissions of a team member.
     */
    public function update(UpdateTeamMemberRequest $request, Team $team, User $member): RedirectResponse
    {
        $this->authorize('manage', $team);
        $this->ensureEditableMember($team, $member);

        $changes = [];

        if ($request->has('role')) {
            $changes['role'] = $request->validated('role');
        }

        if ($request->has('permissions')) {
            $changes['permissions'] = json_encode(TeamPermission::sanitize($request->validated('permissions')));
        }

        $team->members()->updateExistingPivot($member->id, $changes);

        Inertia::flash('toast', ['type' => 'success', 'message' => $request->has('permissions') ? __('Permissions updated.') : __('Role updated.')]);

        return to_route('teams.show', $team);
    }

    /**
     * Remove a member from the team, or let a member leave it.
     */
    public function destroy(Request $request, Team $team, User $member): RedirectResponse
    {
        $leaving = $request->user()->is($member);

        if (! $leaving) {
            $this->authorize('manage', $team);
        }

        $this->ensureEditableMember($team, $member);

        $team->members()->detach($member->id);

        Inertia::flash('toast', [
            'type' => 'success',
            'message' => $leaving ? __('You left the team.') : __('Member removed.'),
        ]);

        return $leaving ? to_route('teams.index') : to_route('teams.show', $team);
    }

    /**
     * The member has to belong to the team and the owner can never be changed.
     */
    private function ensureEditableMember(Team $team, User $member): void
    {
        $role = $team->roleOf($member);

        abort_if($role === null, 404);
        abort_if($role === TeamRole::Owner, 403, __('The team owner cannot be changed.'));
    }
}
