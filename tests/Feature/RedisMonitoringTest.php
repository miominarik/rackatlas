<?php

namespace Tests\Feature;

use App\Enums\ServerAuthType;
use App\Enums\ServerStatus;
use App\Enums\ServerType;
use App\Enums\TeamRole;
use App\Jobs\CollectDatabaseMetrics;
use App\Jobs\CollectRedisMetrics;
use App\Models\Server;
use App\Models\Team;
use App\Models\User;
use App\Services\Redis\RedisMetricsCollector;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class RedisMonitoringTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function redisServer(Team $team, array $overrides = []): Server
    {
        return $team->servers()->create([
            'type' => ServerType::Redis->value,
            'name' => 'Cache 1',
            'host' => '8.8.8.8',
            'port' => 6379,
            'auth_type' => ServerAuthType::Password->value,
            ...$overrides,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function sentinelReport(string $masterIp = '8.8.8.8'): array
    {
        return [
            'reachable' => true, 'master_name' => 'mymaster', 'master_ip' => $masterIp, 'master_port' => 6379,
            'master_flags' => ['master'], 'master_down' => false, 'failover_in_progress' => false, 'quorum' => 2,
            'known_sentinels' => 2, 'quorum_ok' => true, 'quorum_message' => 'OK 2 usable Sentinels', 'replicas' => [],
        ];
    }

    public function test_redis_server_is_added_without_username_and_password(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), ['type' => 'redis', 'name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('servers.index'));

        $server = $team->servers()->firstOrFail();
        $this->assertSame(ServerType::Redis, $server->type);
        $this->assertTrue($server->isRedis());
        $this->assertNull($server->username);
        $this->assertNull($server->password);
        $this->assertFalse($server->collectsViaAgent());
        $this->assertFalse($server->canOpenTerminal());
    }

    public function test_redis_server_keeps_its_password_when_the_field_is_left_empty(): void
    {
        $team = Team::factory()->create();
        $server = $this->redisServer($team, ['password' => 'secret']);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $server), ['name' => 'Renamed', 'host' => '8.8.8.8', 'port' => 6379, 'password' => ''])
            ->assertSessionHasNoErrors();

        $server->refresh();
        $this->assertSame('Renamed', $server->name);
        $this->assertSame('secret', $server->password);
    }

    private function sentinelServer(Team $team, array $overrides = []): Server
    {
        return $team->servers()->create([
            'type' => ServerType::Sentinel->value,
            'name' => 'Quorum',
            'host' => '1.1.1.1',
            'port' => 26379,
            'auth_type' => ServerAuthType::Password->value,
            ...$overrides,
        ]);
    }

    public function test_servers_with_the_same_master_name_share_one_sentinel_group(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team, ['name' => 'Cache 1']);
        $second = $this->redisServer($team, ['name' => 'Cache 2', 'host' => '8.8.4.4']);

        foreach ([$first, $second] as $server) {
            $this->actingAs($team->owner)
                ->put(route('servers.update', $server), [
                    'name' => $server->name, 'host' => $server->host, 'port' => 6379,
                    'sentinel_port' => 26379, 'sentinel_master_name' => 'mymaster',
                ])
                ->assertSessionHasNoErrors();
        }

        $this->assertSame(1, $team->sentinelGroups()->count());
        $this->assertSame($first->refresh()->sentinel_group_id, $second->refresh()->sentinel_group_id);
        $this->assertSame(26379, $second->sentinel_port);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $first), ['name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379, 'sentinel_master_name' => ''])
            ->assertSessionHasNoErrors();

        $this->assertNull($first->refresh()->sentinel_group_id);
        $this->assertNull($first->sentinel_port);
        $this->assertNotNull($second->refresh()->sentinel_group_id);
        $this->assertSame(1, $team->sentinelGroups()->count());
    }

    public function test_a_redis_server_with_a_master_name_needs_a_sentinel_port(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $first), ['name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379, 'sentinel_master_name' => 'mymaster'])
            ->assertSessionHasErrors('sentinel_port');
    }

    public function test_sentinel_only_server_is_added_into_a_group_with_its_port(): void
    {
        $team = Team::factory()->create();
        $redis = $this->redisServer($team);
        $this->actingAs($team->owner)
            ->put(route('servers.update', $redis), [
                'name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379, 'sentinel_port' => 26379, 'sentinel_master_name' => 'mymaster',
            ]);

        $this->actingAs($team->owner)
            ->post(route('servers.store'), ['type' => 'sentinel', 'name' => 'Quorum', 'host' => '8.8.4.4', 'port' => 26379])
            ->assertSessionHasErrors('sentinel_master_name');

        $this->actingAs($team->owner)
            ->post(route('servers.store'), ['type' => 'sentinel', 'name' => 'Quorum', 'host' => '8.8.4.4', 'port' => 26379, 'sentinel_master_name' => 'mymaster'])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('servers.index'));

        $server = $team->servers()->where('type', 'sentinel')->firstOrFail();
        $this->assertTrue($server->isSentinel());
        $this->assertFalse($server->isRedis());
        $this->assertSame($redis->refresh()->sentinel_group_id, $server->sentinel_group_id);
        $this->assertSame(26379, $server->sentinel_port);
        $this->assertSame(1, $team->sentinelGroups()->count());
    }

    public function test_deleting_the_last_server_of_a_group_deletes_the_group(): void
    {
        $team = Team::factory()->create();
        $group = $team->sentinelGroups()->create(['master_name' => 'mymaster']);
        $first = $this->redisServer($team);
        $second = $this->sentinelServer($team);
        $first->joinSentinelGroup($group, 26379);
        $second->joinSentinelGroup($group, 26379);

        $first->delete();
        $this->assertSame(1, $team->sentinelGroups()->count());

        $second->delete();
        $this->assertSame(0, $team->sentinelGroups()->count());
    }

    public function test_redis_page_lists_only_redis_servers_and_shows_the_sentinel_state(): void
    {
        $team = Team::factory()->create();
        $group = $team->sentinelGroups()->create(['master_name' => 'mymaster']);
        $first = $this->redisServer($team, ['name' => 'Cache 1']);
        $second = $this->redisServer($team, ['name' => 'Cache 2', 'host' => '8.8.4.4']);
        $quorum = $this->sentinelServer($team);
        foreach ([$first, $second, $quorum] as $server) {
            $server->joinSentinelGroup($group, 26379);
        }
        $team->servers()->create([
            'name' => 'Web', 'host' => '8.8.4.4', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'x',
        ]);

        foreach ([[$first, 'master', '8.8.8.8'], [$second, 'slave', '8.8.8.8']] as [$server, $role, $masterIp]) {
            $server->redisMetrics()->create([
                'collected_at' => now(), 'version' => '7.2.4', 'role' => $role, 'used_memory' => 500, 'max_memory' => 1000,
                'keyspace_hits_total' => 3, 'keyspace_misses_total' => 1, 'sentinel' => $this->sentinelReport($masterIp),
            ]);
        }
        $quorum->redisMetrics()->create(['collected_at' => now(), 'sentinel' => $this->sentinelReport('8.8.8.8')]);

        $this->actingAs($team->owner)
            ->get(route('redis.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('redis/index')
                ->has('servers', 2)
                ->where('servers.0.metric.memory_percent', 50)
                ->where('servers.0.metric.hit_rate_percent', 75)
                ->has('sentinels', 1)
                ->where('sentinels.0.master_name', 'mymaster')
                ->where('sentinels.0.agree', true)
                ->has('sentinels.0.members', 3)
                ->where('sentinels.0.members.2.type', 'sentinel'));
    }

    public function test_sentinels_that_point_at_different_masters_disagree(): void
    {
        $team = Team::factory()->create();
        $group = $team->sentinelGroups()->create(['master_name' => 'mymaster']);
        $first = $this->redisServer($team);
        $quorum = $this->sentinelServer($team);
        $first->joinSentinelGroup($group, 26379);
        $quorum->joinSentinelGroup($group, 26379);

        $first->redisMetrics()->create(['collected_at' => now(), 'sentinel' => $this->sentinelReport('8.8.8.8')]);
        $quorum->redisMetrics()->create(['collected_at' => now(), 'sentinel' => $this->sentinelReport('8.8.4.4')]);

        $this->actingAs($team->owner)
            ->get(route('redis.index'))
            ->assertInertia(fn ($page) => $page->where('sentinels.0.agree', false));
    }

    public function test_sentinel_only_server_is_collected_and_redirects_to_the_redis_page(): void
    {
        Queue::fake();

        $team = Team::factory()->create();
        $server = $this->sentinelServer($team);

        $this->artisan('redis:collect-metrics')->assertSuccessful();
        Queue::assertPushed(CollectRedisMetrics::class, 1);

        $this->actingAs($team->owner)->get(route('servers.show', $server))->assertRedirect(route('redis.index'));
    }

    public function test_redis_page_is_hidden_from_a_member_without_the_permission(): void
    {
        $team = Team::factory()->create();
        $member = User::factory()->create();
        $team->members()->attach($member->id, ['role' => TeamRole::Member->value, 'permissions' => json_encode(['redis' => 'none'])]);

        $this->actingAs($member)->get(route('redis.index'))->assertForbidden();
    }

    public function test_server_page_of_a_redis_server_redirects_to_the_redis_page(): void
    {
        $team = Team::factory()->create();
        $server = $this->redisServer($team);

        $this->actingAs($team->owner)
            ->get(route('servers.show', $server))
            ->assertRedirect(route('redis.index'));
    }

    public function test_each_collection_command_handles_only_its_own_type(): void
    {
        Queue::fake();

        $team = Team::factory()->create();
        $this->redisServer($team);

        $this->artisan('redis:collect-metrics')->assertSuccessful();
        $this->artisan('databases:collect-metrics')->assertSuccessful();

        Queue::assertPushed(CollectRedisMetrics::class, 1);
        Queue::assertNotPushed(CollectDatabaseMetrics::class);
    }

    public function test_unreachable_redis_server_is_marked_offline_with_an_error(): void
    {
        $server = $this->redisServer(Team::factory()->create(), ['host' => '127.0.0.1']);

        $this->assertNull(app(RedisMetricsCollector::class)->collect($server));

        $server->refresh();
        $this->assertSame(ServerStatus::Offline, $server->status);
        $this->assertSame(1, $server->errors()->count());
    }
}
