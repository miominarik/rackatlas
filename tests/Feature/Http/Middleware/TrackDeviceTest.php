<?php

namespace Tests\Feature\Http\Middleware;

use App\Models\User;
use App\Models\UserDevice;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Auth;
use Tests\TestCase;

class TrackDeviceTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_revoked_session_device_is_rejected_without_device_cookie(): void
    {
        $user = User::factory()->create();
        $device = $user->devices()->create([
            'token_hash' => UserDevice::hashToken('revoked-device'),
            'revoked_at' => now(),
        ]);

        $this->actingAs($user)->withSession(['ra_device_id' => $device->id])
            ->get(route('devices.index'))->assertRedirect(route('login'));

        $this->assertGuest();
        $this->assertDatabaseCount('user_devices', 1);
    }

    public function test_revoking_a_device_invalidates_its_remembered_login_without_device_cookie(): void
    {
        $user = User::factory()->create();
        $guard = Auth::guard('web');
        $cookieName = $guard->getRecallerName();
        $cookie = $user->id.'|'.$user->remember_token.'|'.$guard->hashPasswordForCookie($user->password);
        $device = $user->devices()->create([
            'token_hash' => UserDevice::hashToken('other-device'),
        ]);

        $this->actingAs($user)->delete(route('devices.destroy', $device))->assertRedirect();
        $this->assertNotNull($device->fresh()->revoked_at);

        $this->app['session']->flush();
        Auth::forgetGuards();
        $this->withCredentials()->withCookie($cookieName, $cookie)->getJson(route('devices.index'))->assertUnauthorized();
        $this->assertGuest();
    }

    public function test_valid_remembered_login_still_works_without_device_cookie(): void
    {
        $user = User::factory()->create();
        $guard = Auth::guard('web');
        $cookie = $user->id.'|'.$user->remember_token.'|'.$guard->hashPasswordForCookie($user->password);

        $this->withCredentials()->withCookie($guard->getRecallerName(), $cookie)
            ->getJson(route('devices.index'))->assertOk();

        $this->assertAuthenticatedAs($user);
    }

    public function test_signing_out_other_devices_invalidates_untracked_remembered_logins(): void
    {
        $user = User::factory()->create();
        $rememberToken = $user->remember_token;

        $this->actingAs($user)->post(route('devices.destroy-others'))->assertRedirect();

        $this->assertNotSame($rememberToken, $user->fresh()->remember_token);
        $this->assertAuthenticatedAs($user);
    }
}
