<?php

namespace Tests\Feature\Services;

use App\Enums\ServerStatus;
use App\Enums\ServerType;
use App\Models\NotificationPreference;
use App\Models\Server;
use App\Models\Team;
use App\Notifications\ServerAlertNotification;
use App\Services\Alerts\AlertEvaluator;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class DatabaseAndRedisAlertsTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function server(ServerType $type): Server
    {
        $server = Team::factory()->create()->servers()->create([
            'name' => 'srv', 'type' => $type->value, 'host' => 'example.com', 'port' => 3306, 'username' => 'root',
            'auth_type' => 'password', 'password' => 'secret',
        ]);
        $server->forceFill(['status' => ServerStatus::Online, 'last_seen_at' => now()])->save();

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

    public function test_a_database_with_exhausted_connections_and_a_broken_replica_raises_alerts(): void
    {
        Notification::fake();
        $server = $this->server(ServerType::Mysql);
        $server->databaseMetrics()->create([
            'collected_at' => now(), 'threads_connected' => 95, 'max_connections' => 100,
            'replica_io_running' => true, 'replica_sql_running' => false, 'replica_lag_seconds' => 600,
        ]);

        $this->assertSame(['db:connections', 'db:lag', 'db:replication'], $this->openKeys($server));
    }

    public function test_a_database_alert_is_resolved_with_a_fresh_reading_but_not_with_a_stale_one(): void
    {
        Notification::fake();
        $server = $this->server(ServerType::Mysql);
        $server->databaseMetrics()->create(['collected_at' => now(), 'threads_connected' => 99, 'max_connections' => 100]);
        $this->assertSame(['db:connections'], $this->openKeys($server));

        $server->databaseMetrics()->delete();
        $server->databaseMetrics()->create(['collected_at' => now()->subMinutes(30), 'threads_connected' => 1, 'max_connections' => 100]);
        $this->assertSame(['db:connections'], $this->openKeys($server));

        $server->databaseMetrics()->create(['collected_at' => now(), 'threads_connected' => 1, 'max_connections' => 100]);
        $this->assertSame([], $this->openKeys($server));
    }

    public function test_redis_problems_raise_an_alert_per_port(): void
    {
        Notification::fake();
        $server = $this->server(ServerType::Redis);
        $server->redisMetrics()->create(['collected_at' => now(), 'port' => 6379, 'role' => 'master', 'used_memory' => 950, 'max_memory' => 1000, 'persistence_ok' => false]);
        $server->redisMetrics()->create(['collected_at' => now(), 'port' => 6380, 'role' => 'replica', 'master_link_status' => 'down', 'cluster' => ['state' => 'fail']]);

        $this->assertSame([
            'redis:cluster:6380', 'redis:memory:6379', 'redis:persistence:6379', 'redis:replication:6380',
        ], $this->openKeys($server));
    }

    public function test_only_users_who_switched_the_kind_on_are_notified(): void
    {
        Notification::fake();
        $server = $this->server(ServerType::Redis);
        $owner = $server->team->owner;
        $owner->forceFill(['email_verified_at' => now()])->save();
        $server->redisMetrics()->create(['collected_at' => now(), 'port' => 6379, 'role' => 'master', 'used_memory' => 990, 'max_memory' => 1000]);

        $owner->notificationPreference()->create([...array_fill_keys(NotificationPreference::FLAGS, true), 'notify_redis' => false]);
        $this->openKeys($server);
        Notification::assertNothingSent();

        $server->alerts()->delete();
        $owner->notificationPreference()->update(['notify_redis' => true]);
        $this->openKeys($server);
        Notification::assertSentTo($owner, ServerAlertNotification::class);
    }

    public function test_the_profile_saves_the_new_switches(): void
    {
        $owner = Team::factory()->create()->owner;

        $this->actingAs($owner)->put(route('notifications.update'), [
            ...array_fill_keys(NotificationPreference::FLAGS, true), 'notify_database' => false, 'notify_redis' => false,
        ])->assertSessionHasNoErrors();

        $preference = NotificationPreference::for($owner->fresh());
        $this->assertFalse($preference->notify_database);
        $this->assertFalse($preference->notify_redis);
    }
}
