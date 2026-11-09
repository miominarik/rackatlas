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

    public function test_two_servers_are_linked_through_sentinel_in_both_directions(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team, ['name' => 'Cache 1']);
        $second = $this->redisServer($team, ['name' => 'Cache 2', 'host' => '8.8.4.4']);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $first), [
                'name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379,
                'sentinel_peer_id' => $second->id, 'sentinel_port' => 26379, 'sentinel_master_name' => 'mymaster',
            ])
            ->assertSessionHasNoErrors();

        $first->refresh();
        $second->refresh();
        $this->assertSame($second->id, $first->sentinel_peer_id);
        $this->assertSame($first->id, $second->sentinel_peer_id);
        $this->assertSame(26379, $second->sentinel_port);
        $this->assertSame('mymaster', $second->sentinel_master_name);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $first), ['name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379, 'sentinel_peer_id' => ''])
            ->assertSessionHasNoErrors();

        $this->assertNull($first->refresh()->sentinel_peer_id);
        $this->assertNull($second->refresh()->sentinel_peer_id);
        $this->assertNull($second->sentinel_port);
    }

    public function test_sentinel_peer_needs_a_port_and_a_master_name(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team);
        $second = $this->redisServer($team, ['name' => 'Cache 2']);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $first), ['name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379, 'sentinel_peer_id' => $second->id])
            ->assertSessionHasErrors(['sentinel_port', 'sentinel_master_name']);
    }

    public function test_sentinel_peer_must_be_another_redis_server_of_the_team(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team);
        $foreign = $this->redisServer(Team::factory()->create());
        $mysql = $team->servers()->create([
            'type' => 'mysql', 'name' => 'db', 'host' => '8.8.4.4', 'port' => 3306, 'username' => 'm',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'x',
        ]);

        foreach ([$first->id, $foreign->id, $mysql->id] as $peerId) {
            $this->actingAs($team->owner)
                ->put(route('servers.update', $first), [
                    'name' => 'Cache 1', 'host' => '8.8.8.8', 'port' => 6379,
                    'sentinel_peer_id' => $peerId, 'sentinel_port' => 26379, 'sentinel_master_name' => 'mymaster',
                ])
                ->assertSessionHasErrors('sentinel_peer_id');
        }
    }

    public function test_deleting_a_server_unlinks_its_sentinel_peer(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team);
        $second = $this->redisServer($team, ['name' => 'Cache 2']);
        $first->linkSentinel($second, 26379, 'mymaster');

        $first->delete();

        $this->assertNull($second->refresh()->sentinel_peer_id);
    }

    public function test_redis_page_lists_only_redis_servers_and_shows_the_sentinel_state(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team, ['name' => 'Cache 1']);
        $second = $this->redisServer($team, ['name' => 'Cache 2', 'host' => '8.8.4.4']);
        $first->linkSentinel($second, 26379, 'mymaster');
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
                ->has('sentinels.0.members', 2));
    }

    public function test_sentinels_that_point_at_different_masters_disagree(): void
    {
        $team = Team::factory()->create();
        $first = $this->redisServer($team);
        $second = $this->redisServer($team, ['name' => 'Cache 2', 'host' => '8.8.4.4']);
        $first->linkSentinel($second, 26379, 'mymaster');

        $first->redisMetrics()->create(['collected_at' => now(), 'sentinel' => $this->sentinelReport('8.8.8.8')]);
        $second->redisMetrics()->create(['collected_at' => now(), 'sentinel' => $this->sentinelReport('8.8.4.4')]);

        $this->actingAs($team->owner)
            ->get(route('redis.index'))
            ->assertInertia(fn ($page) => $page->where('sentinels.0.agree', false));
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
