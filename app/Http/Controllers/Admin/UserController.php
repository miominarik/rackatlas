<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UserRequest;
use App\Models\Team;
use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    private const PER_PAGE = 25;

    public function index(Request $request): Response
    {
        $search = trim((string) $request->query('search', ''));
        $filter = in_array($request->query('filter'), ['admins', 'unverified'], true) ? $request->query('filter') : null;

        $users = User::query()
            ->withCount('teams')
            ->when($search !== '', fn ($query) => $query->where(
                fn ($inner) => $inner->where('name', 'like', "%{$search}%")->orWhere('email', 'like', "%{$search}%")
            ))
            ->when($filter === 'admins', fn ($query) => $query->where('is_admin', true))
            ->when($filter === 'unverified', fn ($query) => $query->whereNull('email_verified_at'))
            ->orderBy('name')
            ->paginate(self::PER_PAGE)
            ->withQueryString()
            ->through(fn (User $user) => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'verified' => $user->email_verified_at !== null,
                'two_factor' => $user->two_factor_confirmed_at !== null,
                'teams_count' => $user->teams_count,
                'created_at' => $user->created_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => ['search' => $search, 'filter' => $filter],
            'totals' => [
                'all' => User::count(),
                'admins' => User::where('is_admin', true)->count(),
                'unverified' => User::whereNull('email_verified_at')->count(),
            ],
        ]);
    }

    public function create(): Response
    {
        return Inertia::render('admin/users/edit', ['member' => null]);
    }

    public function store(UserRequest $request): RedirectResponse
    {
        $data = $request->validated();

        $user = new User(['name' => $data['name'], 'email' => $data['email'], 'password' => $data['password']]);
        $user->forceFill([
            'is_admin' => $data['is_admin'],
            'email_verified_at' => $data['email_verified'] ? now() : null,
        ])->save();

        $this->flash(__('User created.'));

        return to_route('admin.users.edit', $user);
    }

    public function edit(User $user): Response
    {
        return Inertia::render('admin/users/edit', [
            'member' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
                'verified' => $user->email_verified_at !== null,
                'two_factor' => $user->two_factor_confirmed_at !== null,
                'passkeys' => $user->passkeys()->count(),
                'devices' => $user->devices()->active()->count(),
                'created_at' => $user->created_at?->toIso8601String(),
                'teams' => $user->teams()->orderBy('name')->get()->map(fn (Team $team) => [
                    'id' => $team->id,
                    'name' => $team->name,
                    'role' => $team->pivot->role,
                    'owned' => $team->owner_id === $user->id,
                    'servers_count' => $team->servers()->count(),
                ])->values(),
            ],
        ]);
    }

    public function update(UserRequest $request, User $user): RedirectResponse
    {
        $data = $request->validated();

        if ($user->is($request->user()) && ! $data['is_admin']) {
            return back()->withErrors(['is_admin' => __('You cannot remove your own administrator rights.')]);
        }

        $user->fill(['name' => $data['name'], 'email' => $data['email']]);

        if (filled($data['password'] ?? null)) {
            $user->password = $data['password'];
        }

        $verified = $user->email_verified_at !== null;

        $user->forceFill([
            'is_admin' => $data['is_admin'],
            'email_verified_at' => $data['email_verified']
                ? ($user->isDirty('email') || ! $verified ? now() : $user->email_verified_at)
                : null,
        ])->save();

        $this->flash(__('User updated.'));

        return back();
    }

    /**
     * End every session and remembered login of the user.
     */
    public function signOut(User $user): RedirectResponse
    {
        $user->devices()->active()->get()->each(fn (UserDevice $device) => $device->revoke());
        $user->forceFill(['remember_token' => Str::random(60)])->save();

        $this->flash(__('The user was signed out on all devices.'));

        return back();
    }

    public function resetTwoFactor(User $user): RedirectResponse
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        $this->flash(__('Two-factor authentication was turned off for the user.'));

        return back();
    }

    public function destroy(Request $request, User $user): RedirectResponse
    {
        if ($user->is($request->user())) {
            return back()->withErrors(['delete' => __('You cannot delete your own account here.')]);
        }

        $user->delete();

        $this->flash(__('User deleted.'));

        return to_route('admin.users.index');
    }

    private function flash(string $message): void
    {
        Inertia::flash('toast', ['type' => 'success', 'message' => $message]);
    }
}
