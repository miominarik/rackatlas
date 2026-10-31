<?php

namespace Tests\Feature\Http\Controllers\Admin;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class AdminUserTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_guests_and_normal_users_cannot_open_the_admin(): void
    {
        $this->get(route('admin.users.index'))->assertRedirect(route('login'));

        $this->actingAs(User::factory()->create())->get(route('admin.users.index'))->assertForbidden();
        $this->actingAs(User::factory()->create())->get(route('admin.teams.index'))->assertForbidden();
    }

    public function test_the_admin_flag_cannot_be_set_by_mass_assignment(): void
    {
        $user = new User(['name' => 'x', 'email' => 'x@example.com', 'password' => 'secret-password', 'is_admin' => true]);

        $this->assertFalse((bool) $user->is_admin);
    }

    public function test_admin_sees_users_and_can_search(): void
    {
        $admin = User::factory()->admin()->create();
        User::factory()->create(['name' => 'Findable Person']);
        User::factory()->create(['name' => 'Someone Else']);

        $this->actingAs($admin)->get(route('admin.users.index', ['search' => 'Findable']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('admin/users/index')
                ->has('users.data', 1)
                ->where('users.data.0.name', 'Findable Person'));
    }

    public function test_admin_creates_a_user(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->post(route('admin.users.store'), [
            'name' => 'New User', 'email' => 'new@example.com', 'password' => 'password-123',
            'is_admin' => false, 'email_verified' => true,
        ])->assertSessionHasNoErrors();

        $created = User::where('email', 'new@example.com')->firstOrFail();
        $this->assertFalse($created->is_admin);
        $this->assertNotNull($created->email_verified_at);
        $this->assertNotSame('password-123', $created->password);
    }

    public function test_admin_updates_a_user_and_keeps_the_password_when_it_is_empty(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();
        $hash = $user->password;

        $this->actingAs($admin)->put(route('admin.users.update', $user), [
            'name' => 'Renamed', 'email' => $user->email, 'password' => '',
            'is_admin' => true, 'email_verified' => true,
        ])->assertSessionHasNoErrors();

        $user->refresh();
        $this->assertSame('Renamed', $user->name);
        $this->assertTrue($user->is_admin);
        $this->assertSame($hash, $user->password);
    }

    public function test_admin_cannot_remove_their_own_rights_or_delete_themselves(): void
    {
        $admin = User::factory()->admin()->create();

        $this->actingAs($admin)->put(route('admin.users.update', $admin), [
            'name' => $admin->name, 'email' => $admin->email, 'password' => '',
            'is_admin' => false, 'email_verified' => true,
        ])->assertSessionHasErrors('is_admin');

        $this->actingAs($admin)->delete(route('admin.users.destroy', $admin))->assertSessionHasErrors('delete');

        $this->assertTrue($admin->fresh()->is_admin);
    }

    public function test_admin_deletes_another_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->actingAs($admin)->delete(route('admin.users.destroy', $user))->assertRedirect(route('admin.users.index'));

        $this->assertModelMissing($user);
    }

    public function test_admin_resets_two_factor_and_signs_a_user_out(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->withTwoFactor()->create();
        $token = $user->remember_token;

        $this->actingAs($admin)->delete(route('admin.users.two-factor.destroy', $user));
        $this->actingAs($admin)->post(route('admin.users.sign-out', $user));

        $user->refresh();
        $this->assertNull($user->two_factor_confirmed_at);
        $this->assertNull($user->two_factor_secret);
        $this->assertNotSame($token, $user->remember_token);
    }

    public function test_the_command_grants_and_revokes_the_rights(): void
    {
        $user = User::factory()->create();

        $this->artisan('user:admin', ['email' => $user->email])->assertSuccessful();
        $this->assertTrue($user->fresh()->is_admin);

        $this->artisan('user:admin', ['email' => $user->email, '--revoke' => true])->assertSuccessful();
        $this->assertFalse($user->fresh()->is_admin);

        $this->artisan('user:admin', ['email' => 'nobody@example.com'])->assertFailed();
    }
}
