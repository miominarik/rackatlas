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
}
