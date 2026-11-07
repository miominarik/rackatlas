<?php

namespace App\Http\Controllers\Settings;

use App\Enums\PermissionLevel;
use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Teams\StoreApiTokenRequest;
use App\Http\Requests\Settings\Teams\StoreTeamRequest;
use App\Http\Requests\Settings\Teams\UpdateTeamRequest;
use App\Models\ApiToken;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    /**
     * List the teams the user belongs to.
     */
    public function index(Request $request): Response
    {
        $teams = $request->user()->teams()
            ->withCount('members')
            ->orderBy('name')
            ->get()
            ->map(fn (Team $team) => [
                'id' => $team->id,
                'name' => $team->name,
                'role' => $team->pivot->role,
                'members_count' => $team->members_count,
            ]);

        return Inertia::render('settings/teams/index', [
            'teams' => $teams,
        ]);
    }

    /**
     * Create a team owned by the user.
     */
    public function store(StoreTeamRequest $request): RedirectResponse
    {
        $team = Team::create([
            'name' => $request->validated('name'),
            'owner_id' => $request->user()->id,
        ]);

        $team->members()->attach($request->user()->id, ['role' => TeamRole::Owner->value]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team created.')]);

        return to_route('teams.show', $team);
    }

    /**
     * Show a team with its members and pending invitations.
     */
    public function show(Request $request, Team $team): Response
    {
        $this->authorize('view', $team);

        $role = $team->roleOf($request->user());
        $canManage = $role->canManage();

        return Inertia::render('settings/teams/show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'owner_id' => $team->owner_id,
            ],
            'role' => $role->value,
            'canManage' => $canManage,
            'canDelete' => $request->user()->can('delete', $team),
            'members' => $team->members()->orderBy('name')->get()->map(fn ($member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->pivot->role,
                'permissions' => $this->presentPermissions($team, $member),
            ]),
            'invitations' => $canManage
                ? $team->invitations()->latest()->get()->map(fn ($invitation) => [
                    'id' => $invitation->id,
                    'email' => $invitation->email,
                    'role' => $invitation->role->value,
                    'permissions' => $this->presentInvitationPermissions($invitation),
                    'expires_at' => $invitation->expires_at->toIso8601String(),
                    'expired' => $invitation->isExpired(),
                ])
                : [],
            'apiTokens' => $canManage
                ? $team->apiTokens()->latest()->get()->map(fn (ApiToken $token) => [
                    'id' => $token->id,
                    'name' => $token->name,
                    'scopes' => $token->abilities,
                    'last_used_at' => $token->last_used_at?->toIso8601String(),
                    'expires_at' => $token->expires_at?->toIso8601String(),
                    'expired' => $token->isExpired(),
                ])
                : [],
            'apiScopes' => ApiToken::SCOPES,
            'apiExpiryDays' => StoreApiTokenRequest::EXPIRY_DAYS,
            'apiUrl' => url('/api/v1'),
            'permissionCatalog' => array_map(fn (TeamPermission $permission) => [
                'key' => $permission->value,
                'levels' => array_map(fn (PermissionLevel $level) => $level->value, $permission->levels()),
            ], TeamPermission::cases()),
            'assignableRoles' => array_map(fn (TeamRole $role) => $role->value, TeamRole::assignable()),
        ]);
    }

    /**
     * The level of every permission of a member, as it works in the team.
     *
     * @return array<string, string>
     */
    private function presentPermissions(Team $team, User $member): array
    {
        return array_map(fn (PermissionLevel $level) => $level->value, $team->permissionsOf($member));
    }

    /**
     * @return array<string, string>
     */
    private function presentInvitationPermissions(TeamInvitation $invitation): array
    {
        return [
            ...array_map(fn (PermissionLevel $level) => $level->value, TeamPermission::defaults()),
            ...TeamPermission::sanitize($invitation->permissions),
        ];
    }

    /**
     * Rename a team.
     */
    public function update(UpdateTeamRequest $request, Team $team): RedirectResponse
    {
        $this->authorize('manage', $team);

        $team->update($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team updated.')]);

        return to_route('teams.show', $team);
    }

    /**
     * Delete a team.
     */
    public function destroy(Team $team): RedirectResponse
    {
        $this->authorize('delete', $team);

        $team->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Team deleted.')]);

        return to_route('teams.index');
    }
}
