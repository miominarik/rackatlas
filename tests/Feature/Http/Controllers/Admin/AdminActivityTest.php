<?php

namespace Tests\Feature\Http\Controllers\Admin;

use App\Models\Server;
use App\Models\SshKey;
use App\Models\Team;
use App\Models\User;
use Illuminate\Auth\Events\Failed;
use Illuminate\Auth\Events\Login;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Spatie\Activitylog\Models\Activity;
use Tests\TestCase;

class AdminActivityTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_only_admins_can_see_the_activity_log(): void
    {
        $this->actingAs(User::factory()->create())->get(route('admin.activity.index'))->assertForbidden();

        $this->actingAs(User::factory()->admin()->create())->get(route('admin.activity.index'))
            ->assertOk()->assertInertia(fn ($page) => $page->component('admin/activity'));
    }

    public function test_model_changes_are_logged_with_the_causer(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);

        $team = Team::factory()->create(['name' => 'Before']);
        $team->update(['name' => 'After']);

        $activity = Activity::query()->inLog('team')->where('event', 'updated')->latest('id')->firstOrFail();

        $this->assertSame($user->id, $activity->causer_id);
        $this->assertSame('After', $activity->attribute_changes['attributes']['name']);
        $this->assertSame('Before', $activity->attribute_changes['old']['name']);
    }

    public function test_secrets_never_reach_the_log(): void
    {
        $this->actingAs(User::factory()->create());

        $team = Team::factory()->create();
        SshKey::create([
            'team_id' => $team->id, 'name' => 'k', 'algorithm' => 'ssh-ed25519', 'fingerprint' => 'SHA256:x',
            'public_key' => 'ssh-ed25519 AAAA', 'private_key' => 'PRIVATE-MATERIAL',
        ]);
        Server::create([
            'team_id' => $team->id, 'name' => 's', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => 'password', 'password' => 'SERVER-SECRET',
        ]);
        User::factory()->create();

        $dump = Activity::all()->toJson();

        $this->assertStringNotContainsString('PRIVATE-MATERIAL', $dump);
        $this->assertStringNotContainsString('SERVER-SECRET', $dump);
        $this->assertDatabaseHas('activity_log', ['log_name' => 'ssh-key', 'event' => 'created']);
        $this->assertStringNotContainsString('"password":', $dump);
        $this->assertStringNotContainsString('remember_token', $dump);
    }

    public function test_sign_ins_and_failed_attempts_are_logged(): void
    {
        $user = User::factory()->create();

        event(new Login('web', $user, false));
        event(new Failed('web', null, ['email' => 'nobody@example.com', 'password' => 'secret']));

        $this->assertDatabaseHas('activity_log', ['log_name' => 'auth', 'event' => 'login', 'causer_id' => $user->id]);

        $failed = Activity::query()->where('event', 'login-failed')->firstOrFail();
        $this->assertSame('nobody@example.com', $failed->getProperty('email'));
        $this->assertStringNotContainsString('secret', $failed->toJson());
    }

    public function test_the_log_can_be_filtered(): void
    {
        $admin = User::factory()->admin()->create();
        event(new Login('web', $admin, false));
        Team::factory()->create();

        $this->actingAs($admin)->get(route('admin.activity.index', ['log' => 'auth']))
            ->assertInertia(fn ($page) => $page->has('activities.data', 1)->where('activities.data.0.event', 'login'));
    }
}
