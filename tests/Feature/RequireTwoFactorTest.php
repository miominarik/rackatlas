<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class RequireTwoFactorTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_a_user_without_two_factor_is_sent_to_set_it_up(): void
    {
        $user = User::factory()->create(['two_factor_required' => true]);

        $this->actingAs($user)->get(route('dashboard'))->assertRedirect(route('two-factor.required'));
        $this->actingAs($user)->get(route('servers.index'))->assertRedirect(route('two-factor.required'));
    }

    public function test_the_required_screen_explains_and_is_skipped_once_it_is_on(): void
    {
        $user = User::factory()->create(['two_factor_required' => true]);

        $this->actingAs($user)->get(route('two-factor.required'))->assertOk()
            ->assertInertia(fn ($page) => $page->component('auth/two-factor-required'));

        $this->actingAs(User::factory()->withTwoFactor()->create(['two_factor_required' => true]))
            ->get(route('two-factor.required'))->assertRedirect(route('dashboard'));
    }

    public function test_the_setup_pages_stay_open(): void
    {
        $user = User::factory()->create(['two_factor_required' => true]);

        $this->actingAs($user)->get(route('password.confirm'))->assertOk();
        $this->actingAs($user)->post(route('logout'))->assertRedirect();
    }

    public function test_a_user_with_two_factor_works_normally_but_cannot_turn_it_off(): void
    {
        $user = User::factory()->withTwoFactor()->create(['two_factor_required' => true]);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->withSession(['auth.password_confirmed_at' => time()])
            ->delete(route('two-factor.disable'))->assertForbidden();
        $this->assertNotNull($user->fresh()->two_factor_confirmed_at);
    }

    public function test_users_without_the_requirement_are_not_affected(): void
    {
        $this->actingAs(User::factory()->create())->get(route('dashboard'))->assertOk();
    }

    public function test_an_administrator_requires_two_factor_for_a_user(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->create();

        $this->actingAs($admin)->put(route('admin.users.update', $user), [
            'name' => $user->name, 'email' => $user->email, 'is_admin' => false,
            'email_verified' => true, 'two_factor_required' => true,
        ])->assertSessionHasNoErrors();

        $this->assertTrue($user->fresh()->two_factor_required);
    }
}
