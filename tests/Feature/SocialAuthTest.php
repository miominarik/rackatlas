<?php

namespace Tests\Feature;

use App\Models\SocialAccount;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Socialite\Facades\Socialite;
use Laravel\Socialite\Two\User as SocialiteUser;
use Tests\TestCase;

class SocialAuthTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.microsoft.client_id' => 'id', 'services.microsoft.client_secret' => 'secret']);
    }

    private function fakeMicrosoft(string $id = 'ms-1', string $email = 'new@example.com', string $name = 'New Person'): void
    {
        $user = (new SocialiteUser)->map(['id' => $id, 'name' => $name, 'email' => $email]);

        Socialite::fake('microsoft', $user);
    }

    public function test_the_provider_is_hidden_without_keys(): void
    {
        config(['services.microsoft.client_id' => null]);

        $this->get(route('social.redirect', 'microsoft'))->assertNotFound();
    }

    public function test_login_page_offers_microsoft(): void
    {
        $this->get(route('login'))->assertInertia(fn ($page) => $page->where('socialProviders.0.id', 'microsoft'));
    }

    public function test_redirect_sends_the_guest_to_microsoft(): void
    {
        $this->fakeMicrosoft();

        $this->get(route('social.redirect', 'microsoft'))->assertRedirect();
    }

    public function test_new_person_is_registered_and_signed_in(): void
    {
        $this->fakeMicrosoft();

        $this->get(route('social.callback', 'microsoft'))->assertRedirect();

        $user = User::where('email', 'new@example.com')->firstOrFail();
        $this->assertAuthenticatedAs($user);
        $this->assertNull($user->email_verified_at);
        $this->assertDatabaseHas('social_accounts', ['user_id' => $user->id, 'provider' => 'microsoft', 'provider_id' => 'ms-1']);
    }

    public function test_linked_account_signs_in(): void
    {
        $user = User::factory()->create();
        $user->socialAccounts()->create(['provider' => 'microsoft', 'provider_id' => 'ms-1', 'email' => $user->email]);
        $this->fakeMicrosoft('ms-1', 'other@example.com');

        $this->get(route('social.callback', 'microsoft'))->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
        $this->assertSame(1, User::count());
    }

    public function test_existing_email_is_not_taken_over(): void
    {
        User::factory()->create(['email' => 'new@example.com']);
        $this->fakeMicrosoft();

        $this->get(route('social.callback', 'microsoft'))
            ->assertRedirect(route('login'))
            ->assertSessionHasErrors('email');

        $this->assertGuest();
        $this->assertSame(0, SocialAccount::count());
    }

    public function test_two_factor_user_skips_the_challenge_when_signing_in_with_a_provider(): void
    {
        $user = User::factory()->withTwoFactor()->create();
        $user->socialAccounts()->create(['provider' => 'microsoft', 'provider_id' => 'ms-1']);
        $this->fakeMicrosoft();

        $this->get(route('social.callback', 'microsoft'))->assertRedirect(route('dashboard'));

        $this->assertAuthenticatedAs($user);
    }

    public function test_signed_in_user_can_connect_an_account(): void
    {
        $user = User::factory()->create();
        $this->fakeMicrosoft('ms-9', 'work@example.com');

        $this->actingAs($user)->get(route('social.redirect', 'microsoft'));
        $this->actingAs($user)->get(route('social.callback', 'microsoft'))->assertRedirect(route('profile.edit'));

        $this->assertDatabaseHas('social_accounts', ['user_id' => $user->id, 'provider_id' => 'ms-9']);
    }

    public function test_an_account_of_another_user_cannot_be_connected(): void
    {
        $other = User::factory()->create();
        $other->socialAccounts()->create(['provider' => 'microsoft', 'provider_id' => 'ms-9']);
        $user = User::factory()->create();
        $this->fakeMicrosoft('ms-9');

        $this->actingAs($user)->get(route('social.redirect', 'microsoft'));
        $this->actingAs($user)->get(route('social.callback', 'microsoft'));

        $this->assertSame(0, $user->socialAccounts()->count());
    }

    public function test_user_can_disconnect_an_account(): void
    {
        $user = User::factory()->create();
        $user->socialAccounts()->create(['provider' => 'microsoft', 'provider_id' => 'ms-1']);

        $this->actingAs($user)->delete(route('connected-accounts.destroy', 'microsoft'))->assertRedirect();

        $this->assertSame(0, $user->socialAccounts()->count());
    }

    public function test_profile_lists_the_connection(): void
    {
        $user = User::factory()->create();
        $user->socialAccounts()->create(['provider' => 'microsoft', 'provider_id' => 'ms-1', 'email' => 'work@example.com']);

        $this->actingAs($user)->get(route('profile.edit'))->assertInertia(fn ($page) => $page
            ->where('socialProviders.0.connected', true)
            ->where('socialProviders.0.connected_email', 'work@example.com'));
    }
}
