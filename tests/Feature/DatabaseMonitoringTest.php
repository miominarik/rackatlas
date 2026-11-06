<?php

namespace Tests\Feature;

use App\Enums\ServerAuthType;
use App\Enums\ServerStatus;
use App\Enums\ServerType;
use App\Jobs\CollectDatabaseMetrics;
use App\Jobs\CollectServerMetrics;
use App\Models\Server;
use App\Models\Team;
use App\Services\Database\MysqlMetricsCollector;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class DatabaseMonitoringTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function mysqlServer(Team $team, array $overrides = []): Server
    {
        return $team->servers()->create([
            'type' => ServerType::Mysql->value,
            'name' => 'Main database',
            'host' => '8.8.8.8',
            'port' => 3306,
            'username' => 'monitor',
            'auth_type' => ServerAuthType::Password->value,
            'password' => 'secret',
            ...$overrides,
        ]);
    }

    public function test_mysql_server_is_added_without_ssh_details(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), [
                'type' => 'mysql', 'name' => 'Main database', 'host' => '8.8.8.8',
                'port' => 3306, 'username' => 'monitor', 'password' => 'secret',
            ])
            ->assertSessionHasNoErrors()
            ->assertRedirect(route('servers.index'));

        $server = $team->servers()->firstOrFail();
        $this->assertSame(ServerType::Mysql, $server->type);
        $this->assertSame(ServerAuthType::Password, $server->auth_type);
        $this->assertSame('secret', $server->password);
        $this->assertFalse($server->collectsViaAgent());
        $this->assertFalse($server->canOpenTerminal());
        $this->assertNull($server->agent_token_hash);
    }

    public function test_mysql_server_needs_a_password(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), [
                'type' => 'mysql', 'name' => 'db', 'host' => '8.8.8.8', 'port' => 3306, 'username' => 'monitor',
            ])
            ->assertSessionHasErrors('password');
    }

    public function test_type_cannot_be_changed_on_update(): void
    {
        $team = Team::factory()->create();
        $server = $this->mysqlServer($team);

        $this->actingAs($team->owner)
            ->put(route('servers.update', $server), [
                'type' => 'server', 'name' => 'Renamed', 'host' => '8.8.8.8', 'port' => 3306,
                'username' => 'monitor', 'password' => '',
            ])
            ->assertSessionHasNoErrors();

        $server->refresh();
        $this->assertSame(ServerType::Mysql, $server->type);
        $this->assertSame('Renamed', $server->name);
        $this->assertSame('secret', $server->password);
    }

    public function test_databases_page_lists_only_mysql_servers(): void
    {
        $team = Team::factory()->create();
        $this->mysqlServer($team);
        $team->servers()->create([
            'name' => 'Web', 'host' => '8.8.4.4', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'x',
        ]);

        $this->actingAs($team->owner)
            ->get(route('databases.index'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('databases/index')
                ->has('databases', 1)
                ->where('databases.0.name', 'Main database'));
    }

    public function test_database_page_is_not_available_for_a_linux_server(): void
    {
        $team = Team::factory()->create();
        $server = $team->servers()->create([
            'name' => 'Web', 'host' => '8.8.4.4', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'x',
        ]);

        $this->actingAs($team->owner)->get(route('databases.show', $server))->assertNotFound();
    }

    public function test_server_page_of_a_database_redirects_to_the_database_page(): void
    {
        $team = Team::factory()->create();
        $server = $this->mysqlServer($team);

        $this->actingAs($team->owner)
            ->get(route('servers.show', $server))
            ->assertRedirect(route('databases.show', $server));
    }

    public function test_database_of_another_team_is_forbidden(): void
    {
        $server = $this->mysqlServer(Team::factory()->create());

        $this->actingAs(Team::factory()->create()->owner)
            ->get(route('databases.show', $server))
            ->assertForbidden();
    }

    public function test_each_collection_command_handles_only_its_own_type(): void
    {
        Queue::fake();

        $team = Team::factory()->create();
        $this->mysqlServer($team);
        $team->servers()->create([
            'name' => 'Web', 'host' => '8.8.4.4', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'x',
        ]);

        $this->artisan('servers:collect-metrics')->assertSuccessful();
        $this->artisan('databases:collect-metrics')->assertSuccessful();

        Queue::assertPushed(CollectServerMetrics::class, 1);
        Queue::assertPushed(CollectDatabaseMetrics::class, 1);
    }

    public function test_unreachable_database_is_marked_offline_with_an_error(): void
    {
        $server = $this->mysqlServer(Team::factory()->create(), ['host' => '127.0.0.1']);

        $this->assertNull(app(MysqlMetricsCollector::class)->collect($server));

        $server->refresh();
        $this->assertSame(ServerStatus::Offline, $server->status);
        $this->assertSame(1, $server->errors()->count());
    }

    public function test_running_queries_are_listed(): void
    {
        $team = Team::factory()->create();
        $server = $this->mysqlServer($team);
        $query = ['id' => 7, 'user' => 'app', 'host' => '10.0.0.1:5555', 'db' => 'shop', 'time' => 12, 'state' => null, 'query' => 'SELECT SLEEP(30)'];

        $this->mock(MysqlMetricsCollector::class)
            ->shouldReceive('runningQueries')->once()->andReturn([$query]);

        $this->actingAs($team->owner)
            ->getJson(route('databases.processes.index', $server))
            ->assertOk()
            ->assertJson(['success' => true, 'queries' => [$query]]);
    }

    public function test_a_query_can_be_killed(): void
    {
        $team = Team::factory()->create();
        $server = $this->mysqlServer($team);

        $this->mock(MysqlMetricsCollector::class)
            ->shouldReceive('killQuery')->once()->withArgs(fn ($s, $id) => $s->is($server) && $id === 7);

        $this->actingAs($team->owner)
            ->postJson(route('databases.processes.kill', [$server, 7]))
            ->assertOk()
            ->assertJson(['success' => true]);
    }

    public function test_processes_of_another_team_are_forbidden(): void
    {
        $server = $this->mysqlServer(Team::factory()->create());
        $stranger = Team::factory()->create()->owner;

        $this->actingAs($stranger)
            ->getJson(route('databases.processes.index', $server))
            ->assertForbidden();
        $this->actingAs($stranger)
            ->postJson(route('databases.processes.kill', [$server, 7]))
            ->assertForbidden();
    }

    public function test_processes_of_a_linux_server_are_not_found(): void
    {
        $team = Team::factory()->create();
        $server = $team->servers()->create([
            'name' => 'Web', 'host' => '8.8.4.4', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'x',
        ]);

        $this->actingAs($team->owner)
            ->getJson(route('databases.processes.index', $server))
            ->assertNotFound();
    }

    public function test_chart_history_has_traffic_and_query_rates_and_the_replication_state(): void
    {
        $team = Team::factory()->create();
        $server = $this->mysqlServer($team);

        $base = [
            'uptime_seconds' => 1000, 'threads_connected' => 5, 'threads_running' => 1, 'max_connections' => 150,
            'questions_total' => 0, 'slow_queries_total' => 0, 'aborted_connects_total' => 0,
        ];
        $server->databaseMetrics()->create([
            ...$base, 'collected_at' => now()->subMinutes(2),
            'bytes_received_total' => 1000, 'bytes_sent_total' => 5000, 'com_select_total' => 100,
            'com_insert_total' => 10, 'com_update_total' => 0, 'com_delete_total' => 0,
        ]);
        $server->databaseMetrics()->create([
            ...$base, 'collected_at' => now()->subMinute(),
            'bytes_received_total' => 7000, 'bytes_sent_total' => 11000, 'com_select_total' => 220,
            'com_insert_total' => 10, 'com_update_total' => 60, 'com_delete_total' => 0,
            'replica_io_running' => true, 'replica_sql_running' => false, 'replica_lag_seconds' => 42,
            'replica_source' => 'db1:3306', 'replica_error' => 'Duplicate entry',
        ]);

        $this->actingAs($team->owner)
            ->get(route('databases.show', ['server' => $server, 'range' => '1h']))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('range', '1h')
                ->where('history.0.bytes_received_per_second', null)
                ->where('history.1.bytes_received_per_second', 100)
                ->where('history.1.bytes_sent_per_second', 100)
                ->where('history.1.selects_per_second', 2)
                ->where('history.1.inserts_per_second', 0)
                ->where('history.1.updates_per_second', 1)
                ->where('history.1.replica_lag_seconds', 42)
                ->where('database.metric.replication.io_running', true)
                ->where('database.metric.replication.sql_running', false)
                ->where('database.metric.replication.lag_seconds', 42)
                ->where('database.metric.replication.source', 'db1:3306'));
    }

    public function test_a_server_that_is_not_a_replica_has_no_replication_state(): void
    {
        $team = Team::factory()->create();
        $server = $this->mysqlServer($team);
        $server->databaseMetrics()->create([
            'collected_at' => now(), 'uptime_seconds' => 1, 'threads_connected' => 1, 'threads_running' => 1,
            'max_connections' => 150, 'questions_total' => 1, 'slow_queries_total' => 0, 'aborted_connects_total' => 0,
        ]);

        $this->actingAs($team->owner)
            ->get(route('databases.show', $server))
            ->assertInertia(fn ($page) => $page->where('database.metric.replication', null)->where('range', '24h'));
    }
}
