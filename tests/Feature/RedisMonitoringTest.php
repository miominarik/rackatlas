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

    private function clusterView(string $myself, array $nodeIds, string $state = 'ok'): array
    {
        return [
            'state' => $state, 'slots_assigned' => 16384, 'slots_ok' => 16384, 'slots_pfail' => 0, 'slots_fail' => 0,
            'known_nodes' => count($nodeIds), 'size' => 1, 'current_epoch' => 3, 'myself' => $myself,
            'nodes' => array_map(fn (string $id) => [
                'id' => $id, 'address' => '10.0.0.'.ord($id[0]).':6379', 'flags' => [$id === $myself ? 'myself' : 'slave'],
                'myself' => $id === $myself, 'master_id' => null, 'link_state' => 'connected', 'config_epoch' => 1,
                'slots' => 0, 'migrating' => false,
            ], $nodeIds),
        ];
    }

    public function test_redis_page_lists_redis_servers_and_servers_whose_agent_reports_redis(): void
    {
        $team = Team::factory()->create();
        $direct = $this->redisServer($team, ['name' => 'Cache 1']);
        $agent = $team->servers()->create(['name' => 'Node 1', 'host' => '10.0.0.1', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);
        $team->servers()->create(['name' => 'Web', 'host' => '8.8.4.4', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);

        $direct->redisMetrics()->create([
            'collected_at' => now(), 'version' => '7.2.4', 'role' => 'master', 'used_memory' => 500, 'max_memory' => 1000,
            'keyspace_hits_total' => 3, 'keyspace_misses_total' => 1,
        ]);
        $agent->redisMetrics()->create(['collected_at' => now(), 'version' => '7.2.4', 'role' => 'master']);

        $this->actingAs($team->owner)
            ->get(route('redis.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('redis/index')
                ->has('servers', 2)
                ->where('servers.0.via_agent', false)
                ->where('servers.0.metric.memory_percent', 50)
                ->where('servers.0.metric.hit_rate_percent', 75)
                ->where('servers.1.via_agent', true)
                ->has('clusters', 0));
    }

    public function test_nodes_that_know_each_other_are_shown_as_one_cluster_and_problems_are_listed(): void
    {
        $team = Team::factory()->create();
        $ids = ['a'.str_repeat('1', 39), 'b'.str_repeat('2', 39), 'c'.str_repeat('3', 39)];

        foreach ([0, 1] as $i) {
            $server = $team->servers()->create(['name' => 'Node '.$i, 'host' => '10.0.0.'.$i, 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);
            $server->redisMetrics()->create([
                'collected_at' => now()->addSeconds($i), 'version' => '7.2.4', 'role' => 'master',
                'cluster' => $this->clusterView($ids[$i], $ids, $i === 1 ? 'fail' : 'ok'),
            ]);
        }

        // A separate cluster with another set of nodes.
        $other = $team->servers()->create(['name' => 'Other', 'host' => '10.0.1.1', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);
        $other->redisMetrics()->create(['collected_at' => now(), 'cluster' => $this->clusterView('d'.str_repeat('4', 39), ['d'.str_repeat('4', 39)])]);

        $this->actingAs($team->owner)
            ->get(route('redis.index'))
            ->assertInertia(fn ($page) => $page
                ->has('clusters', 2)
                ->where('clusters.0.known_nodes', 3)
                ->where('clusters.0.server_ids', fn ($ids) => count($ids) === 2)
                ->where('clusters.0.unmonitored_nodes', 1)
                ->where('clusters.0.problems.0.type', 'state')
                ->where('clusters.1.problems', []));
    }

    private function agentReport(string $redis): string
    {
        return "###CPU1\ncpu  100 0 100 800 0 0 0 0 0 0\n###CPU2\ncpu  150 0 150 900 0 0 0 0 0 0\n###LOAD\n0.1 0.1 0.1 1/1 1\n###CORES\n2\n###MEM\nMemTotal: 1000 kB\nMemAvailable: 500 kB\n###UPTIME\n10\n".$redis;
    }

    private function ingest(Server $server, string $report): void
    {
        $this->call('POST', route('agent.ingest'), [], [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$server->issueAgentToken()], $report)->assertOk();
    }

    public function test_agent_report_with_redis_sections_stores_the_redis_reading_and_the_cluster(): void
    {
        $server = Team::factory()->create()->servers()->create(['name' => 'Node 1', 'host' => '10.0.0.1', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);
        $id = str_repeat('a', 40);
        $redis = "###REDIS_INFO\r\n# Server\r\nredis_version:7.2.4\r\nrole:master\r\nconnected_clients:3\r\nused_memory:2048\r\nmaxmemory:4096\r\ntotal_commands_processed:100\r\n# Keyspace\r\ndb0:keys=5,expires=0,avg_ttl=0\r\n"
            ."###REDIS_CLUSTER_INFO\r\ncluster_state:ok\r\ncluster_slots_assigned:16384\r\ncluster_known_nodes:2\r\ncluster_size:1\r\n"
            ."###REDIS_CLUSTER_NODES\n{$id} 10.0.0.1:6379@16379 myself,master - 0 0 1 connected 0-5460 [5461->-".str_repeat('b', 40)."]\n".str_repeat('b', 40)." 10.0.0.2:6379@16379,node2 slave {$id} 0 1 1 connected\n";

        $this->ingest($server, $this->agentReport($redis));

        $metric = $server->redisMetrics()->firstOrFail();
        $this->assertSame('7.2.4', $metric->version);
        $this->assertSame(2048, $metric->used_memory);
        $this->assertSame(5, $metric->keys_count);
        $this->assertSame('ok', $metric->cluster['state']);
        $this->assertSame($id, $metric->cluster['myself']);
        $this->assertSame(5461, $metric->cluster['nodes'][0]['slots']);
        $this->assertTrue($metric->cluster['nodes'][0]['migrating']);
        $this->assertSame('10.0.0.2:6379', $metric->cluster['nodes'][1]['address']);
        $this->assertSame($id, $metric->cluster['nodes'][1]['master_id']);
    }

    public function test_agent_report_with_two_redis_instances_stores_both_and_the_page_lists_both(): void
    {
        $team = Team::factory()->create();
        $server = $team->servers()->create(['name' => 'php-01', 'host' => '10.0.0.1', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);

        $this->ingest($server, $this->agentReport(
            "###REDIS_INFO\nredis_version:7.2.4\nrole:master\nrackatlas_port:7000\n"
            ."###REDIS_INFO_1\nredis_version:7.2.4\nrole:slave\nrackatlas_port:7001\n"
        ));

        $this->assertEqualsCanonicalizing([7000, 7001], $server->redisMetrics()->pluck('port')->all());

        $this->actingAs($team->owner)
            ->get(route('redis.index'))
            ->assertInertia(fn ($page) => $page
                ->has('servers', 2)
                ->where('servers.0.name', 'php-01:7000')
                ->where('servers.0.metric.role', 'master')
                ->where('servers.1.name', 'php-01:7001')
                ->where('servers.1.metric.role', 'slave'));
    }

    public function test_agent_report_without_redis_sections_stores_no_redis_reading(): void
    {
        $server = Team::factory()->create()->servers()->create(['name' => 'Web', 'host' => '10.0.0.1', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);

        $this->ingest($server, $this->agentReport(''));

        $this->assertSame(0, $server->redisMetrics()->count());
    }

    public function test_redis_error_of_the_agent_is_logged_until_redis_answers_again(): void
    {
        $server = Team::factory()->create()->servers()->create(['name' => 'Node 1', 'host' => '10.0.0.1', 'port' => 22, 'auth_type' => ServerAuthType::Agent->value]);

        $this->ingest($server, $this->agentReport("###REDIS_ERROR\nCould not connect to Redis at 127.0.0.1:6379: Connection refused\n"));
        $this->assertSame(1, $server->logs()->open()->where('source', 'redis')->count());
        $this->assertSame(0, $server->redisMetrics()->count());

        $this->ingest($server, $this->agentReport("###REDIS_INFO\nredis_version:7.2.4\nrole:master\n"));
        $this->assertSame(0, $server->logs()->open()->where('source', 'redis')->count());
        $this->assertSame(1, $server->redisMetrics()->count());
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
