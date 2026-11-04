<?php

namespace Tests\Feature;

use App\Http\Middleware\TrackDevice;
use App\Models\LoginApproval;
use App\Models\PushSubscription;
use App\Models\User;
use App\Models\UserDevice;
use App\Services\Auth\LoginApprovals;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class LoginApprovalTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['services.turnstile.secret_key' => null, 'services.turnstile.site_key' => null]);
    }

    private function approvingDevice(User $user, string $token = 'phone-token'): UserDevice
    {
        return $user->devices()->create([
            'token_hash' => UserDevice::hashToken($token),
            'name' => 'Phone',
            'type' => 'mobile',
            'approves_logins' => true,
        ]);
    }

    private function withDeviceCookie(string $token): static
    {
        return $this->withCookie(TrackDevice::COOKIE, $token);
    }

    private function signIn(User $user)
    {
        return $this->post(route('login.store'), ['email' => $user->email, 'password' => 'password']);
    }

    public function test_a_user_without_approving_devices_signs_in_directly(): void
    {
        $user = User::factory()->create();

        $this->signIn($user)->assertRedirect();
        $this->get(route('dashboard'))->assertOk();
    }

    public function test_a_sign_in_waits_for_the_approving_device_and_only_the_waiting_page_is_open(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);

        $this->signIn($user);

        $this->assertAuthenticatedAs($user);
        $this->assertSame(1, LoginApproval::count());
        $this->get(route('dashboard'))->assertRedirect(route('login-approval.show'));
        $this->getJson(route('devices.index'))->assertStatus(423);
        $this->get(route('login-approval.show'))->assertOk();
        $this->getJson(route('login-approval.status'))->assertJson(['status' => 'pending']);
    }

    public function test_the_waiting_page_sees_an_approval_and_then_lets_the_user_in(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);
        $this->signIn($user);
        LoginApproval::query()->update(['status' => LoginApproval::APPROVED]);

        $this->getJson(route('login-approval.status'))->assertJson(['status' => 'approved']);
        $this->get(route('dashboard'))->assertOk();
    }

    public function test_the_approving_device_itself_signs_in_without_waiting(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);

        $this->withDeviceCookie('phone-token')->signIn($user);

        $this->assertSame(0, LoginApproval::count());
        $this->get(route('dashboard'))->assertOk();
    }

    public function test_choosing_the_right_number_on_the_device_lets_the_sign_in_through(): void
    {
        $user = User::factory()->create();
        $phone = $this->approvingDevice($user);

        $this->signIn($user);
        $approval = LoginApproval::firstOrFail();

        // Another browser of the same user, on the approving device.
        $this->flushSession();
        $this->actingAs($user)
            ->withDeviceCookie('phone-token')
            ->post(route('login-approvals.decide', $approval), ['choice' => $approval->number])
            ->assertRedirect();

        $this->assertSame(LoginApproval::APPROVED, $approval->fresh()->status);
        $this->assertSame($phone->id, $approval->fresh()->decided_by_device_id);

        $this->flushSession();
        $this->actingAs($user)->withSession([LoginApprovals::SESSION_KEY => $approval->id])
            ->get(route('dashboard'))->assertOk();
    }

    public function test_a_wrong_number_or_deny_refuses_the_sign_in(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);

        foreach ([['choice' => 5], ['deny' => true]] as $answer) {
            $approval = LoginApproval::start($user, '127.0.0.1', 'Chrome', 'Windows');

            $this->actingAs($user)
                ->withDeviceCookie('phone-token')
                ->post(route('login-approvals.decide', $approval), $answer);

            $this->assertSame(LoginApproval::DENIED, $approval->fresh()->status);
        }
    }

    public function test_a_denied_sign_in_is_signed_out(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);
        $this->signIn($user);
        LoginApproval::query()->update(['status' => LoginApproval::DENIED]);

        $this->get(route('dashboard'))->assertRedirect(route('login'));
        $this->assertGuest();
    }

    public function test_a_device_that_does_not_approve_cannot_answer(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);
        $approval = LoginApproval::start($user, null, null, null);

        $this->actingAs($user)
            ->post(route('login-approvals.decide', $approval), ['choice' => $approval->number])
            ->assertNotFound();

        $this->assertSame(LoginApproval::PENDING, $approval->fresh()->status);
    }

    public function test_the_pending_request_is_shown_on_the_approving_device_only(): void
    {
        $user = User::factory()->create();
        $this->approvingDevice($user);
        $approval = LoginApproval::start($user, '10.0.0.1', 'Chrome', 'Windows');

        $this->actingAs($user)->withDeviceCookie('phone-token')
            ->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('loginApproval.id', $approval->id)->has('loginApproval.choices', 3));

        $user->devices()->create(['token_hash' => UserDevice::hashToken('laptop'), 'type' => 'desktop']);

        $this->flushSession();
        $this->actingAs($user)->withDeviceCookie('laptop')->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page->where('loginApproval', null));
    }

    public function test_a_recovery_code_approves_the_waiting_sign_in(): void
    {
        $user = User::factory()->withTwoFactor()->create();
        $this->approvingDevice($user);
        $approval = LoginApproval::start($user, null, null, null);
        $recovery = $user->recoveryCodes()[0];

        $this->actingAs($user)->withSession([LoginApprovals::SESSION_KEY => $approval->id])
            ->post(route('login-approval.code'), ['recovery_code' => 'wrong'])
            ->assertSessionHasErrors('recovery_code');

        $this->post(route('login-approval.code'), ['recovery_code' => $recovery])->assertRedirect(route('dashboard'));

        $this->assertSame(LoginApproval::APPROVED, $approval->fresh()->status);
        $this->assertNotContains($recovery, $user->fresh()->recoveryCodes());
    }

    public function test_the_switch_needs_two_factor_and_push_on_the_device(): void
    {
        $user = User::factory()->create();
        $device = $user->devices()->create([
            'token_hash' => UserDevice::hashToken('mine'),
            'type' => 'mobile',
        ]);
        $url = route('devices.login-approval.update', $device);
        $confirmed = ['auth.password_confirmed_at' => time()];

        $this->actingAs($user)->withSession($confirmed)->withDeviceCookie('mine')
            ->patch($url, ['enabled' => true])->assertSessionHasErrors('enabled');

        $user->forceFill(['two_factor_secret' => 'x', 'two_factor_recovery_codes' => 'x', 'two_factor_confirmed_at' => now()])->save();
        $this->patch($url, ['enabled' => true])->assertSessionHasErrors('enabled');

        PushSubscription::create([
            'user_id' => $user->id,
            'user_device_id' => $device->id,
            'endpoint_hash' => 'h',
            'endpoint' => 'https://fcm.googleapis.com/x',
            'public_key' => 'k',
            'auth_token' => 'a',
            'content_encoding' => 'aes128gcm',
        ]);
        $this->patch($url, ['enabled' => true])->assertSessionHasNoErrors();
        $this->assertTrue($device->fresh()->approves_logins);

        $this->patch($url, ['enabled' => false])->assertSessionHasNoErrors();
        $this->assertFalse($device->fresh()->approves_logins);
    }

    public function test_turning_two_factor_off_removes_the_approving_devices(): void
    {
        $admin = User::factory()->admin()->create();
        $user = User::factory()->withTwoFactor()->create();
        $device = $this->approvingDevice($user);

        $this->actingAs($admin)->withSession(['auth.password_confirmed_at' => time()])
            ->delete(route('admin.users.two-factor.destroy', $user));

        $this->assertFalse($device->fresh()->approves_logins);
    }
}
