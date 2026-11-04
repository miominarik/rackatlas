<?php

namespace Tests\Feature\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Models\Server;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ServerAgentWithSshTest extends TestCase
{
    use LazilyRefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'web', 'host' => '8.8.8.8', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password->value, 'password' => 'secret',
            ...$overrides,
        ];
    }

    public function test_ssh_server_can_also_send_its_data_through_the_agent(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), $this->payload(['uses_agent' => true]))
            ->assertSessionHasNoErrors();

        $server = $team->servers()->firstOrFail();
        $this->assertTrue($server->uses_agent);
        $this->assertSame(ServerAuthType::Password, $server->auth_type);
        $this->assertNotNull($server->agent_token_hash);
        $this->assertTrue($server->hasSshAccess());
        $this->assertTrue($server->collectsViaAgent());
    }

    public function test_save_redirects_to_the_install_page_only_with_the_agent(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), $this->payload(['uses_agent' => true]))
            ->assertRedirect(route('servers.agent.show', $team->servers()->firstOrFail()));

        $this->actingAs($team->owner)
            ->post(route('servers.store'), $this->payload(['name' => 'db']))
            ->assertRedirect(route('servers.index'));
    }

    public function test_agent_only_server_never_keeps_the_ssh_flag(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), ['name' => 'web', 'auth_type' => 'agent', 'uses_agent' => true])
            ->assertSessionHasNoErrors();

        $this->assertFalse($team->servers()->firstOrFail()->uses_agent);
    }

    public function test_switching_the_agent_off_removes_the_token(): void
    {
        $team = Team::factory()->create();
        $server = $team->servers()->create($this->payload(['uses_agent' => true]));
        $server->issueAgentToken();

        $this->actingAs($team->owner)
            ->put(route('servers.update', $server), $this->payload(['uses_agent' => false]))
            ->assertSessionHasNoErrors();

        $server->refresh();
        $this->assertFalse($server->collectsViaAgent());
        $this->assertNull($server->agent_token_hash);
    }

    public function test_token_works_only_for_servers_that_use_the_agent(): void
    {
        $team = Team::factory()->create();
        $withAgent = $team->servers()->create($this->payload(['uses_agent' => true]));
        $withoutAgent = $team->servers()->create($this->payload(['name' => 'db']));

        $this->assertTrue($withAgent->is(Server::findByAgentToken($withAgent->issueAgentToken())));
        $this->assertNull(Server::findByAgentToken($withoutAgent->issueAgentToken()));
    }

    public function test_metrics_polling_skips_servers_that_use_the_agent(): void
    {
        $team = Team::factory()->create();
        $team->servers()->create($this->payload(['uses_agent' => true]));

        $this->artisan('servers:collect-metrics')->expectsOutput('0 jobs queued.')->assertSuccessful();

        $team->servers()->create($this->payload(['name' => 'db']));

        $this->artisan('servers:collect-metrics')->expectsOutput('1 jobs queued.')->assertSuccessful();
    }

    public function test_terminal_stays_available_for_a_server_with_the_agent(): void
    {
        config(['terminal.secret' => 'bridge-secret', 'terminal.url' => 'wss://terminal.test']);

        $team = Team::factory()->create();
        $server = $team->servers()->create($this->payload(['uses_agent' => true]));

        $this->actingAs($team->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertOk();
    }
}
