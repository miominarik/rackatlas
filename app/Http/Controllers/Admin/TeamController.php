<?php

namespace App\Http\Controllers\Admin;

use App\Enums\TeamRole;
use App\Http\Controllers\Controller;
use App\Models\Team;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class TeamController extends Controller
{
    private const PER_PAGE = 25;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));

        $teams = Team::query()
            ->with('owner:id,name,email')
            ->withCount(['members', 'servers'])
            ->when($search !== '', fn ($query) => $query->where(
                fn ($inner) => $inner->where('name', 'like', "%{$search}%")
                    ->orWhereHas('owner', fn ($owner) => $owner->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%"))
            ))
            ->orderBy('name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (Team $team) => [
                'id' => $team->id,
                'name' => $team->name,
                'owner' => $team->owner?->only('id', 'name', 'email'),
                'members_count' => $team->members_count,
                'servers_count' => $team->servers_count,
                'created_at' => $team->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/teams/index', [
            'adminTeams' => $teams,
            'filters' => ['search' => $search],
            'totals' => ['all' => Team::count()],
        ]);
    }

    /**
     * Create a team for an existing user, who becomes its owner.
     */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'owner_email' => ['required', 'string', 'email', Rule::exists('users', 'email')],
        ]);

        $owner = User::where('email', $data['owner_email'])->firstOrFail();

        $team = Team::create(['name' => $data['name'], 'owner_id' => $owner->id]);
        $team->members()->attach($owner->id, ['role' => TeamRole::Owner->value]);

        $this->flash(__('Team created.'));

        return to_route('admin.teams.show', $team);
    }

    public function show(Team $team): Response
    {
        return Inertia::render('admin/teams/show', [
            'team' => [
                'id' => $team->id,
                'name' => $team->name,
                'owner_id' => $team->owner_id,
                'servers_count' => $team->servers()->count(),
                'ssh_keys_count' => $team->sshKeys()->count(),
                'invitations_count' => $team->invitations()->count(),
                'created_at' => $team->created_at?->toIso8601String(),
            ],
            'members' => $team->members()->orderBy('name')->get()->map(fn (User $member) => [
                'id' => $member->id,
                'name' => $member->name,
                'email' => $member->email,
                'role' => $member->pivot->role,
            ])->values(),
            'assignableRoles' => array_map(fn (TeamRole $role) => $role->value, TeamRole::assignable()),
        ]);
    }

    public function update(Request $request, Team $team): RedirectResponse
    {
        $team->update($request->validate(['name' => ['required', 'string', 'max:255']]));

        $this->flash(__('Team updated.'));

        return back();
    }

    /**
     * Hand the team to one of its members. The previous owner stays as an administrator.
     */
    public function transferOwnership(Request $request, Team $team): RedirectResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer', Rule::in($team->members()->pluck('users.id')->all())],
        ]);

        if ((int) $data['user_id'] !== $team->owner_id) {
            $team->members()->updateExistingPivot($team->owner_id, ['role' => TeamRole::Admin->value]);
            $team->members()->updateExistingPivot($data['user_id'], ['role' => TeamRole::Owner->value]);
            $team->update(['owner_id' => $data['user_id']]);
        }

        $this->audit('ownership-transferred', $team);
        $this->flash(__('The owner of the team was changed.'));

        return back();
    }

    public function addMember(Request $request, Team $team): RedirectResponse
    {
        $data = $request->validate([
            'email' => ['required', 'string', 'email', Rule::exists('users', 'email')],
            'role' => ['required', Rule::in(array_map(fn (TeamRole $role) => $role->value, TeamRole::assignable()))],
        ]);

        $user = User::where('email', $data['email'])->firstOrFail();

        if ($team->members()->whereKey($user->id)->exists()) {
            return back()->withErrors(['email' => __('This user is already in the team.')]);
        }

        $team->members()->attach($user->id, ['role' => $data['role']]);

        $this->audit('member-added', $team, ['member' => $user->email, 'role' => $data['role']]);
        $this->flash(__('Member added.'));

        return back();
    }

    public function updateMember(Request $request, Team $team, User $member): RedirectResponse
    {
        $this->ensureEditableMember($team, $member);

        $data = $request->validate([
            'role' => ['required', Rule::in(array_map(fn (TeamRole $role) => $role->value, TeamRole::assignable()))],
        ]);

        $team->members()->updateExistingPivot($member->id, ['role' => $data['role']]);

        $this->audit('member-role-changed', $team, ['member' => $member->email, 'role' => $data['role']]);
        $this->flash(__('Role updated.'));

        return back();
    }

    public function removeMember(Team $team, User $member): RedirectResponse
    {
        $this->ensureEditableMember($team, $member);

        $team->members()->detach($member->id);

        $this->audit('member-removed', $team, ['member' => $member->email]);
        $this->flash(__('Member removed.'));

        return back();
    }

    public function destroy(Team $team): RedirectResponse
    {
        $team->delete();

        $this->flash(__('Team deleted.'));

        return to_route('admin.teams.index');
    }

    /**
     * @param  array<string, mixed>  $properties
     */
    private function audit(string $event, Team $subject, array $properties = []): void
    {
        activity('admin')->event($event)->causedBy(request()->user())->performedOn($subject)->withProperties($properties)->log($event);
    }

    private function flash(string $message): void
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);
    }

    /**
     * The member has to belong to the team and the owner changes only through a transfer.
     */
    private function ensureEditableMember(Team $team, User $member): void
    {
        $role = $team->roleOf($member);

        abort_if($role === null, 404);
        abort_if($role === TeamRole::Owner, 403, __('The team owner cannot be changed.'));
    }
}
