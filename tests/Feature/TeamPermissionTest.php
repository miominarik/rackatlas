<?php

namespace Tests\Feature;

use App\Enums\PermissionLevel;
use App\Enums\TeamRole;
use App\Models\Backup;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TeamPermissionTest extends TestCase
{
    use LazilyRefreshDatabase;

    /**
     * @param  array<string, string>|null  $permissions
     */
    private function member(Team $team, ?array $permissions = null, TeamRole $role = TeamRole::Member): User
    {
        $user = User::factory()->create();
        $team->members()->attach($user->id, [
            'role' => $role->value,
            'permissions' => $permissions === null ? null : json_encode($permissions),
        ]);

        return $user;
    }

    public function test_a_member_without_settings_can_look_but_not_change_or_run(): void
    {
        $team = Team::factory()->create();
        $member = $this->member($team);

        $this->assertTrue($team->permits($member, 'servers.view'));
        $this->assertFalse($team->permits($member, 'servers.edit'));
        $this->assertFalse($team->permits($member, 'terminal.edit'));
        $this->assertFalse($team->permits($member, 'database_kill.edit'));
    }

    public function test_owner_and_admin_can_do_everything(): void
    {
        $team = Team::factory()->create();
        $admin = $this->member($team, ['servers' => 'none'], TeamRole::Admin);

        $this->assertTrue($team->permits($team->owner, 'database_kill.edit'));
        $this->assertTrue($team->permits($admin, 'servers.edit'));
        $this->assertTrue($team->permits($admin, 'terminal.edit'));
    }

    public function test_a_section_can_be_closed_for_a_member(): void
    {
        $team = Team::factory()->create();
        $member = $this->member($team, ['backups' => 'none']);

        $this->actingAs($member)->get(route('backups.index'))->assertForbidden();
        $this->actingAs($member)->get(route('servers.index'))->assertOk();
    }

    public function test_a_member_edits_only_the_section_that_is_allowed(): void
    {
        $team = Team::factory()->create();
        $member = $this->member($team, ['backups' => 'edit']);

        $this->actingAs($member)
            ->post(route('backups.store'), ['name' => 'Nightly', 'expected_interval_hours' => 24])
            ->assertSessionHasNoErrors();
        $this->assertSame(1, $team->backups()->count());

        $this->actingAs($member)->get(route('servers.create'))->assertForbidden();
    }

    public function test_view_only_cannot_edit_a_backup(): void
    {
        $backup = Backup::factory()->create();
        $member = $this->member($backup->team);

        $this->actingAs($member)->put(route('backups.update', $backup), ['name' => 'Renamed'])->assertForbidden();
        $this->actingAs($member)->delete(route('backups.destroy', $backup))->assertForbidden();
    }

    public function test_killing_a_process_needs_its_own_permission(): void
    {
        $team = Team::factory()->create();
        $mysql = $team->servers()->create([
            'name' => 'db', 'type' => 'mysql', 'host' => '127.0.0.1', 'port' => 3306,
            'username' => 'root', 'password' => 'secret', 'auth_type' => 'password',
        ]);
        $viewer = $this->member($team, ['databases' => 'edit']);
        $killer = $this->member($team, ['databases' => 'view', 'database_kill' => 'edit']);

        $this->actingAs($viewer)->postJson(route('databases.processes.kill', [$mysql, 5]))->assertForbidden();
        $this->actingAs($killer)->postJson(route('databases.processes.kill', [$mysql, 5]))->assertStatus(200);
    }

    public function test_the_owner_sets_the_permissions_of_a_member(): void
    {
        $team = Team::factory()->create();
        $member = $this->member($team);

        $this->actingAs($team->owner)
            ->patch(route('teams.members.update', [$team, $member]), [
                'permissions' => ['servers' => 'edit', 'logs' => 'none', 'bogus' => 'edit', 'terminal' => 'view'],
            ])->assertRedirect();

        $levels = $team->permissionsOf($member);
        $this->assertSame(PermissionLevel::Edit, $levels['servers']);
        $this->assertSame(PermissionLevel::None, $levels['logs']);
        $this->assertSame(PermissionLevel::None, $levels['terminal']);
        $this->assertSame(PermissionLevel::View, $levels['metrics']);
    }

    public function test_a_member_cannot_change_permissions(): void
    {
        $team = Team::factory()->create();
        $member = $this->member($team);
        $other = $this->member($team);

        $this->actingAs($member)
            ->patch(route('teams.members.update', [$team, $other]), ['permissions' => ['servers' => 'edit']])
            ->assertForbidden();
    }

    public function test_permissions_of_an_invitation_go_to_the_new_member(): void
    {
        $team = Team::factory()->create();
        Mail::fake();

        $this->actingAs($team->owner)->post(route('teams.invitations.store', $team), [
            'email' => 'new@example.com', 'role' => 'member',
            'permissions' => ['servers' => 'none', 'terminal' => 'edit'],
        ])->assertRedirect();

        $invitation = $team->invitations()->firstOrFail();
        $this->assertSame('none', $invitation->permissions['servers']);

        $token = 'tok'.str_repeat('x', 61);
        $invitation->update(['token' => TeamInvitation::hashToken($token)]);
        $user = User::factory()->create(['email' => 'new@example.com']);

        $this->actingAs($user)->post(route('team-invitations.accept', $token))->assertRedirect();

        $levels = $team->permissionsOf($user);
        $this->assertSame(PermissionLevel::None, $levels['servers']);
        $this->assertSame(PermissionLevel::Edit, $levels['terminal']);
    }
}
