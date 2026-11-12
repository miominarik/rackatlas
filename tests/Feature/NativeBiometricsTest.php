<?php

namespace Tests\Feature;

use App\Http\Middleware\TrackDevice;
use App\Models\User;
use App\Models\UserDevice;
use App\Support\NativeApp;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class NativeBiometricsTest extends TestCase
{
    use LazilyRefreshDatabase;

    private const TOKEN = 'device-token-for-tests';

    private function appAgent(): string
    {
        return 'Mozilla/5.0 (Linux; Android 15; wv) '.NativeApp::USER_AGENT_TOKEN;
    }

    private function deviceFor(User $user, bool $biometrics): UserDevice
    {
        return $user->devices()->create([
            'token_hash' => UserDevice::hashToken(self::TOKEN),
            'type' => 'mobile',
            'biometrics_enabled' => $biometrics,
            'last_active_at' => now(),
        ]);
    }

    public function test_biometrics_can_only_be_changed_from_the_app(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user)->put(route('devices.biometrics.update'), ['enabled' => true])->assertForbidden();
    }

    public function test_the_app_turns_biometrics_on_and_off_for_its_own_device(): void
    {
        $user = User::factory()->create();
        $device = $this->deviceFor($user, false);

        $this->actingAs($user)
            ->withHeader('User-Agent', $this->appAgent())
            ->withCookie(TrackDevice::COOKIE, self::TOKEN)
            ->put(route('devices.biometrics.update'), ['enabled' => true])
            ->assertRedirect();

        $this->assertTrue($device->fresh()->biometrics_enabled);

        $this->actingAs($user)
            ->withHeader('User-Agent', $this->appAgent())
            ->withCookie(TrackDevice::COOKIE, self::TOKEN)
            ->put(route('devices.biometrics.update'), ['enabled' => false]);

        $this->assertFalse($device->fresh()->biometrics_enabled);
    }

    public function test_a_biometric_device_signs_itself_in_again_without_a_session(): void
    {
        $user = User::factory()->create();
        $this->deviceFor($user, true);

        $this->withCookie(TrackDevice::COOKIE, self::TOKEN)
            ->get(route('profile.edit'))
            ->assertOk();

        $this->assertAuthenticatedAs($user);
    }

    public function test_a_device_without_biometrics_stays_signed_out(): void
    {
        $user = User::factory()->create();
        $this->deviceFor($user, false);

        $this->withCookie(TrackDevice::COOKIE, self::TOKEN)
            ->get(route('profile.edit'))
            ->assertRedirect(route('login'));
    }

    public function test_a_device_signed_out_from_the_settings_does_not_come_back(): void
    {
        $user = User::factory()->create();
        $this->deviceFor($user, true)->revoke();

        $this->withCookie(TrackDevice::COOKIE, self::TOKEN)
            ->get(route('profile.edit'))
            ->assertRedirect(route('login'));
    }

    public function test_logging_out_turns_biometrics_off_so_the_device_stays_signed_out(): void
    {
        $user = User::factory()->create();
        $device = $this->deviceFor($user, true);

        $this->withCookie(TrackDevice::COOKIE, self::TOKEN)->get(route('profile.edit'))->assertOk();
        $this->post(route('logout'));

        $this->assertFalse($device->fresh()->biometrics_enabled);
        $this->get(route('profile.edit'))->assertRedirect(route('login'));
    }
}
