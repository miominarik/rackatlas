<?php

namespace Tests\Feature\Http\Controllers\Terminal;

use App\Enums\ServerAuthType;
use App\Models\Server;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class TerminalTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['terminal.secret' => 'bridge-secret', 'terminal.url' => 'wss://terminal.test']);
    }

    private function sshServer(Team $team, array $overrides = []): Server
    {
        return $team->servers()->create([
            'name' => 'web', 'host' => '8.8.8.8', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password, 'password' => 'secret',
            ...$overrides,
        ]);
    }

    private function ticketFor(User $user, Server $server): string
    {
        return $this->actingAs($user)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertOk()
            ->assertJsonPath('url', 'wss://terminal.test')
            ->json('token');
    }

    public function test_page_lists_servers_and_marks_agent_ones_as_not_connectable(): void
    {
        $team = Team::factory()->create();
        $this->sshServer($team, ['name' => 'ssh']);
        $this->sshServer($team, ['name' => 'agent', 'auth_type' => ServerAuthType::Agent, 'password' => null]);

        $this->actingAs($team->owner)->get(route('terminal'))
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('terminal')
                ->where('enabled', true)
                ->where('servers.0.name', 'agent')
                ->where('servers.0.can_connect', false)
                ->where('servers.1.can_connect', true));
    }

    public function test_ticket_is_exchanged_once_for_the_login_details(): void
    {
        $team = Team::factory()->create();
        $server = $this->sshServer($team);
        $token = $this->ticketFor($team->owner, $server);

        $this->withToken('bridge-secret')->postJson(route('terminal.exchange'), ['token' => $token, 'ip' => '203.0.113.7'])
            ->assertOk()
            ->assertJsonPath('host', '8.8.8.8')
            ->assertJsonPath('username', 'root')
            ->assertJsonPath('password', 'secret');

        $this->withToken('bridge-secret')->postJson(route('terminal.exchange'), ['token' => $token])->assertNotFound();
        $this->assertDatabaseHas('activity_log', ['event' => 'terminal-opened', 'causer_id' => $team->owner->id]);
    }

    public function test_exchange_needs_the_bridge_secret(): void
    {
        $team = Team::factory()->create();
        $token = $this->ticketFor($team->owner, $this->sshServer($team));

        $this->postJson(route('terminal.exchange'), ['token' => $token])->assertUnauthorized();
        $this->withToken('wrong')->postJson(route('terminal.exchange'), ['token' => $token])->assertUnauthorized();
    }

    public function test_exchange_refuses_private_addresses(): void
    {
        $team = Team::factory()->create();
        $token = $this->ticketFor($team->owner, $this->sshServer($team, ['host' => '10.0.0.5']));

        $this->withToken('bridge-secret')->postJson(route('terminal.exchange'), ['token' => $token])->assertUnprocessable();
    }

    public function test_agent_server_cannot_get_a_ticket(): void
    {
        $team = Team::factory()->create();
        $server = $this->sshServer($team, ['auth_type' => ServerAuthType::Agent, 'password' => null]);

        $this->actingAs($team->owner)->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertUnprocessable();
    }

    public function test_server_of_another_team_cannot_get_a_ticket(): void
    {
        $server = $this->sshServer(Team::factory()->create());

        $this->actingAs(Team::factory()->create()->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertNotFound();
    }

    public function test_terminal_is_off_without_a_secret(): void
    {
        config(['terminal.secret' => null]);
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $this->sshServer($team)->id])
            ->assertStatus(503);
        $this->actingAs($team->owner)->get(route('terminal'))
            ->assertInertia(fn ($page) => $page->where('enabled', false));
    }

    public function test_bridge_pins_the_first_host_key_only(): void
    {
        $server = $this->sshServer(Team::factory()->create());
        $first = 'SHA256:'.str_repeat('A', 43);
        $second = 'SHA256:'.str_repeat('B', 43);

        $this->withToken('bridge-secret')->postJson(route('terminal.host-key'), ['server_id' => $server->id, 'fingerprint' => $first])->assertOk();
        $this->withToken('bridge-secret')->postJson(route('terminal.host-key'), ['server_id' => $server->id, 'fingerprint' => $second])->assertOk();

        $this->assertSame($first, $server->fresh()->ssh_host_fingerprint);
    }

    private function agentTerminalServer(Team $team, array $overrides = []): Server
    {
        return $this->sshServer($team, [
            'auth_type' => ServerAuthType::Agent, 'password' => null, 'agent_terminal' => true,
            ...$overrides,
        ]);
    }

    public function test_agent_server_with_terminal_gets_a_ticket_and_the_agent_mode(): void
    {
        $team = Team::factory()->create();
        $server = $this->agentTerminalServer($team);
        $token = $this->ticketFor($team->owner, $server);

        $this->withToken('bridge-secret')->postJson(route('terminal.exchange'), ['token' => $token, 'ip' => '203.0.113.7'])
            ->assertOk()
            ->assertJsonPath('mode', 'agent')
            ->assertJsonPath('server_id', $server->id)
            ->assertJsonPath('user_id', $team->owner->id)
            ->assertJsonMissingPath('password');

        $this->assertDatabaseHas('activity_log', ['event' => 'terminal-opened', 'causer_id' => $team->owner->id]);
    }

    public function test_ticket_tells_the_browser_whether_to_encrypt_end_to_end(): void
    {
        $team = Team::factory()->create();
        $agent = $this->agentTerminalServer($team);
        $ssh = $this->sshServer($team);

        $this->actingAs($team->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $agent->id])
            ->assertOk()
            ->assertJsonPath('mode', 'agent');

        $this->actingAs($team->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $ssh->id])
            ->assertOk()
            ->assertJsonPath('mode', 'ssh');
    }

    public function test_agent_terminal_wins_over_ssh_for_a_server_with_both(): void
    {
        $team = Team::factory()->create();
        $server = $this->sshServer($team, ['uses_agent' => true, 'agent_terminal' => true]);
        $token = $this->ticketFor($team->owner, $server);

        $this->withToken('bridge-secret')->postJson(route('terminal.exchange'), ['token' => $token])
            ->assertOk()
            ->assertJsonPath('mode', 'agent');
    }

    public function test_ssh_exchange_reports_the_ssh_mode(): void
    {
        $team = Team::factory()->create();
        $token = $this->ticketFor($team->owner, $this->sshServer($team));

        $this->withToken('bridge-secret')->postJson(route('terminal.exchange'), ['token' => $token])
            ->assertOk()
            ->assertJsonPath('mode', 'ssh');
    }

    public function test_terminal_flag_without_the_agent_does_not_open_a_terminal_through_it(): void
    {
        $team = Team::factory()->create();
        $server = $this->sshServer($team, ['agent_terminal' => true]);

        $this->assertFalse($server->opensTerminalViaAgent());
        $this->assertTrue($server->canOpenTerminal());
    }

    public function test_page_marks_agent_servers_with_terminal_as_connectable(): void
    {
        $team = Team::factory()->create();
        $this->agentTerminalServer($team);

        $this->actingAs($team->owner)->get(route('terminal'))
            ->assertInertia(fn ($page) => $page->where('servers.0.can_connect', true));
    }

    public function test_agent_asks_whether_the_terminal_is_on_and_where_the_bridge_is(): void
    {
        $team = Team::factory()->create();
        $on = $this->agentTerminalServer($team);
        $off = $this->agentTerminalServer($team, ['name' => 'quiet', 'agent_terminal' => false]);

        $this->withToken($on->issueAgentToken())->getJson(route('agent.terminal'))
            ->assertOk()
            ->assertExactJson(['enabled' => true, 'url' => 'wss://terminal.test']);

        $this->withToken($off->issueAgentToken())->getJson(route('agent.terminal'))
            ->assertOk()
            ->assertExactJson(['enabled' => false, 'url' => null]);

        $this->withToken('ra_'.str_repeat('x', 40))->getJson(route('agent.terminal'))->assertUnauthorized();
    }

    public function test_bridge_accepts_only_the_token_of_a_server_with_the_agent_terminal(): void
    {
        $team = Team::factory()->create();
        $on = $this->agentTerminalServer($team);
        $off = $this->agentTerminalServer($team, ['name' => 'quiet', 'agent_terminal' => false]);

        $this->withToken('bridge-secret')->postJson(route('terminal.agent-auth'), ['token' => $on->issueAgentToken()])
            ->assertOk()->assertJsonPath('server_id', $on->id);
        $this->withToken('bridge-secret')->postJson(route('terminal.agent-auth'), ['token' => $off->issueAgentToken()])
            ->assertForbidden();
        $this->withToken('bridge-secret')->postJson(route('terminal.agent-auth'), ['token' => 'nonsense'])
            ->assertForbidden();
        $this->withoutHeader('Authorization')->postJson(route('terminal.agent-auth'), ['token' => $on->issueAgentToken()])->assertUnauthorized();
    }

    public function test_bridge_reports_a_finished_session_to_the_activity_log(): void
    {
        $team = Team::factory()->create();
        $server = $this->agentTerminalServer($team);

        $this->withToken('bridge-secret')->postJson(route('terminal.session-ended'), [
            'server_id' => $server->id, 'user_id' => $team->owner->id, 'seconds' => 42, 'via' => 'agent',
        ])->assertOk();

        $this->assertDatabaseHas('activity_log', ['event' => 'terminal-closed', 'causer_id' => $team->owner->id]);
    }

    public function test_saving_a_server_keeps_the_terminal_flag_only_with_the_agent(): void
    {
        $team = Team::factory()->create();
        $payload = ['name' => 'web', 'host' => '8.8.8.8', 'port' => 22, 'username' => 'root', 'auth_type' => 'password', 'password' => 'secret'];

        $this->actingAs($team->owner)->post(route('servers.store'), [...$payload, 'agent_terminal' => true])->assertSessionHasNoErrors();
        $this->assertFalse($team->servers()->firstOrFail()->agent_terminal);

        $this->actingAs($team->owner)->post(route('servers.store'), [...$payload, 'name' => 'api', 'uses_agent' => true, 'agent_terminal' => true])->assertSessionHasNoErrors();
        $this->assertTrue($team->servers()->where('name', 'api')->firstOrFail()->agent_terminal);

        $this->actingAs($team->owner)->post(route('servers.store'), ['name' => 'bare', 'auth_type' => 'agent', 'agent_terminal' => true])->assertSessionHasNoErrors();
        $this->assertTrue($team->servers()->where('name', 'bare')->firstOrFail()->agent_terminal);
    }
}
