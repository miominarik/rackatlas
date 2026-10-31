<?php

namespace Tests\Feature\Http\Controllers\Settings;

use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Tests\TestCase;

class SecurityControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_password_change_keeps_current_session_and_rejects_old_session(): void
    {
        $user = User::factory()->create();
        $oldSessionHash = Auth::guard('web')->hashPasswordForCookie($user->password);

        $this->actingAs($user)->withSession(['password_hash_web' => $oldSessionHash])
            ->put(route('user-password.update'), [
                'current_password' => 'password',
                'password' => 'Changed-password-123!',
                'password_confirmation' => 'Changed-password-123!',
            ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('Changed-password-123!', $user->fresh()->password));
        $this->getJson(route('devices.index'))->assertOk();

        $this->actingAs($user->fresh())->withSession(['password_hash_web' => $oldSessionHash])
            ->getJson(route('devices.index'))->assertUnauthorized();
        $this->assertGuest();
    }

    public function test_password_confirmation_is_limited_to_six_attempts_per_minute(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        for ($attempt = 0; $attempt < 6; $attempt++) {
            $this->postJson(route('password.confirm.store'), ['password' => 'wrong'])
                ->assertUnprocessable();
        }

        $this->postJson(route('password.confirm.store'), ['password' => 'wrong'])->assertTooManyRequests();
    }

    public function test_password_reset_rejects_an_existing_session(): void
    {
        $user = User::factory()->create();
        $oldSessionHash = Auth::guard('web')->hashPasswordForCookie($user->password);
        config(['services.turnstile.site_key' => null]);

        $this->post(route('password.update'), [
            'email' => $user->email,
            'token' => Password::createToken($user),
            'password' => 'Reset-password-123!',
            'password_confirmation' => 'Reset-password-123!',
        ])->assertRedirect()->assertSessionHasNoErrors();

        $this->assertTrue(Hash::check('Reset-password-123!', $user->fresh()->password));
        $this->actingAs($user->fresh())->withSession(['password_hash_web' => $oldSessionHash])
            ->getJson(route('devices.index'))->assertUnauthorized();
    }

    public function test_changing_passkey_credential_id_does_not_reset_rate_limit(): void
    {
        $this->withSession(['audit' => true]);

        for ($attempt = 0; $attempt < 10; $attempt++) {
            $this->postJson(route('passkey.login'), ['credential' => ['id' => 'credential-'.$attempt]])
                ->assertUnprocessable();
        }

        $this->postJson(route('passkey.login'), ['credential' => ['id' => 'another-credential']])
            ->assertTooManyRequests();
    }
}
