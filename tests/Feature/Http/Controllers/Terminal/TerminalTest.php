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
}
