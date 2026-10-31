<?php

namespace Tests\Feature\Http\Controllers\Admin;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AdminTeamTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function admin(): User
    {
        return User::factory()->admin()->create();
    }

    public function test_admin_lists_and_opens_any_team(): void
    {
        $team = Team::factory()->create(['name' => 'Foreign Team']);

        $this->actingAs($this->admin())->get(route('admin.teams.index', ['search' => 'Foreign']))
            ->assertOk()->assertInertia(fn ($page) => $page->has('adminTeams.data', 1)->where('adminTeams.data.0.name', 'Foreign Team'));

        $this->actingAs($this->admin())->get(route('admin.teams.show', $team))->assertOk();
    }

    public function test_admin_creates_a_team_for_an_existing_user(): void
    {
        $owner = User::factory()->create();

        $this->actingAs($this->admin())->post(route('admin.teams.store'), [
            'name' => 'Made by admin', 'owner_email' => $owner->email,
        ])->assertSessionHasNoErrors();

        $team = Team::where('name', 'Made by admin')->firstOrFail();
        $this->assertSame($owner->id, $team->owner_id);
        $this->assertSame(TeamRole::Owner, $team->roleOf($owner));

        $this->actingAs($this->admin())->post(route('admin.teams.store'), [
            'name' => 'Nobody', 'owner_email' => 'nobody@example.com',
        ])->assertSessionHasErrors('owner_email');
    }

    public function test_admin_renames_and_deletes_a_team(): void
    {
        $team = Team::factory()->create();
        $admin = $this->admin();

        $this->actingAs($admin)->put(route('admin.teams.update', $team), ['name' => 'Renamed']);
        $this->assertSame('Renamed', $team->fresh()->name);

        $this->actingAs($admin)->delete(route('admin.teams.destroy', $team))->assertRedirect(route('admin.teams.index'));
        $this->assertModelMissing($team);
    }

    public function test_admin_manages_members(): void
    {
        $team = Team::factory()->create();
        $member = User::factory()->create();
        $admin = $this->admin();

        $this->actingAs($admin)->post(route('admin.teams.members.store', $team), ['email' => $member->email, 'role' => 'member'])
            ->assertSessionHasNoErrors();
        $this->assertSame(TeamRole::Member, $team->roleOf($member));

        $this->actingAs($admin)->post(route('admin.teams.members.store', $team), ['email' => $member->email, 'role' => 'member'])
            ->assertSessionHasErrors('email');

        $this->actingAs($admin)->put(route('admin.teams.members.update', [$team, $member]), ['role' => 'admin']);
        $this->assertSame(TeamRole::Admin, $team->roleOf($member));

        $this->actingAs($admin)->put(route('admin.teams.members.update', [$team, $member]), ['role' => 'owner'])
            ->assertSessionHasErrors('role');

        $this->actingAs($admin)->delete(route('admin.teams.members.destroy', [$team, $member]));
        $this->assertNull($team->roleOf($member));
    }

    public function test_the_owner_cannot_be_changed_as_a_member(): void
    {
        $team = Team::factory()->create();
        $admin = $this->admin();

        $this->actingAs($admin)->delete(route('admin.teams.members.destroy', [$team, $team->owner]))->assertForbidden();
        $this->actingAs($admin)->put(route('admin.teams.members.update', [$team, $team->owner]), ['role' => 'member'])->assertForbidden();
    }

    public function test_ownership_goes_to_a_member_and_the_old_owner_becomes_an_admin(): void
    {
        $team = Team::factory()->create();
        $oldOwner = $team->owner;
        $member = User::factory()->create();
        $team->members()->attach($member->id, ['role' => 'member']);
        $outsider = User::factory()->create();
        $admin = $this->admin();

        $this->actingAs($admin)->put(route('admin.teams.owner.update', $team), ['user_id' => $outsider->id])
            ->assertSessionHasErrors('user_id');

        $this->actingAs($admin)->put(route('admin.teams.owner.update', $team), ['user_id' => $member->id])
            ->assertSessionHasNoErrors();

        $this->assertSame($member->id, $team->fresh()->owner_id);
        $this->assertSame(TeamRole::Owner, $team->roleOf($member));
        $this->assertSame(TeamRole::Admin, $team->roleOf($oldOwner));
    }
}
