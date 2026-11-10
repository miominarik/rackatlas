<?php

namespace Tests\Feature\Services;

use App\Enums\ServerAuthType;
use App\Enums\ServerStatus;
use App\Models\Server;
use App\Models\Team;
use App\Notifications\ServerAlertNotification;
use App\Services\Alerts\AlertEvaluator;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class IgnoredAlertsTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function busyServer(?array $ignored): Server
    {
        $server = Team::factory()->create()->servers()->create([
            'name' => 'db', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password, 'password' => 'secret', 'ignored_alerts' => $ignored,
        ]);
        $server->forceFill(['status' => ServerStatus::Online, 'last_seen_at' => now(), 'failed_units' => ['nginx.service']])->save();

        foreach (range(1, 3) as $minute) {
            $server->metrics()->create([
                'collected_at' => now()->subMinutes($minute), 'cpu_percent' => 99, 'cpu_cores' => 4,
                'load_1' => 1, 'load_5' => 1, 'load_15' => 1, 'memory_total' => 1000, 'memory_used' => 990,
                'swap_total' => 0, 'swap_used' => 0, 'uptime_seconds' => 1000,
            ]);
        }

        return $server;
    }

    /**
     * @return array<int, string>
     */
    private function openKeys(Server $server): array
    {
        app(AlertEvaluator::class)->evaluate($server);

        return $server->alerts()->whereNull('resolved_at')->pluck('key')->sort()->values()->all();
    }

    public function test_every_source_warns_by_default(): void
    {
        Notification::fake();

        $this->assertSame(['cpu', 'ram', 'unit:nginx.service'], $this->openKeys($this->busyServer(null)));
    }

    public function test_an_ignored_source_raises_no_alert(): void
    {
        Notification::fake();

        $this->assertSame(['cpu', 'unit:nginx.service'], $this->openKeys($this->busyServer(['ram'])));
        $this->assertSame([], $this->openKeys($this->busyServer(['cpu', 'ram', 'services'])));
    }

    public function test_an_alert_that_was_open_is_closed_silently_when_its_source_is_ignored(): void
    {
        Notification::fake();
        $server = $this->busyServer(null);
        $this->assertContains('ram', $this->openKeys($server));
        Notification::assertSentTimes(ServerAlertNotification::class, 3);

        $server->update(['ignored_alerts' => ['ram']]);

        $this->assertNotContains('ram', $this->openKeys($server));
        Notification::assertSentTimes(ServerAlertNotification::class, 3);
    }

    public function test_the_settings_of_a_server_save_the_ignored_sources(): void
    {
        $server = $this->busyServer(null);
        $payload = [
            'name' => 'db', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => 'password', 'password' => '',
        ];

        $this->actingAs($server->team->owner)->put(route('servers.update', $server), [...$payload, 'ignored_alerts' => ['ram', 'ram', 'disk']])
            ->assertSessionHasNoErrors();
        $this->assertSame(['ram', 'disk'], $server->fresh()->ignored_alerts);

        $this->actingAs($server->team->owner)->put(route('servers.update', $server), [...$payload, 'ignored_alerts' => ['bogus']])
            ->assertSessionHasErrors('ignored_alerts.0');

        $this->actingAs($server->team->owner)->put(route('servers.update', $server), $payload);
        $this->assertNull($server->fresh()->ignored_alerts);
    }

    public function test_a_server_in_maintenance_raises_no_alerts_and_sends_nothing(): void
    {
        Notification::fake();
        $server = $this->busyServer(null);
        $server->update(['in_maintenance' => true]);

        $this->assertSame([], $this->openKeys($server));
        app(AlertEvaluator::class)->notifyLogs($server, [['level' => 'critical', 'source' => 'app', 'message' => 'boom']]);
        Notification::assertNothingSent();

        $server->update(['in_maintenance' => false]);
        $this->assertSame(['cpu', 'ram', 'unit:nginx.service'], $this->openKeys($server));
    }

    public function test_maintenance_is_saved_with_the_settings_of_a_server(): void
    {
        $server = $this->busyServer(null);
        $payload = [
            'name' => 'db', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => 'password', 'password' => '',
        ];

        $this->actingAs($server->team->owner)->put(route('servers.update', $server), [...$payload, 'in_maintenance' => true])
            ->assertSessionHasNoErrors();
        $this->assertTrue($server->fresh()->in_maintenance);

        $this->actingAs($server->team->owner)->put(route('servers.update', $server), $payload);
        $this->assertFalse($server->fresh()->in_maintenance);
    }
}
