<?php

namespace Tests\Feature\Http\Controllers\Terminal;

use App\Enums\ServerAuthType;
use App\Jobs\RunTerminalSession;
use App\Models\Server;
use App\Models\Team;
use App\Models\User;
use App\Services\Terminal\TerminalSessions;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class TerminalTest extends TestCase
{
    use LazilyRefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'broadcasting.default' => 'reverb',
            'broadcasting.connections.reverb.key' => 'key',
            'broadcasting.connections.reverb.secret' => 'secret',
            'broadcasting.connections.reverb.app_id' => 'id',
        ]);
        Queue::fake();
    }

    private function sshServer(Team $team, array $overrides = []): Server
    {
        return $team->servers()->create([
            'name' => 'web', 'host' => '8.8.8.8', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password, 'password' => 'secret',
            ...$overrides,
        ]);
    }

    private function openSession(User $user, Server $server): string
    {
        return $this->actingAs($user)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertOk()
            ->json('id');
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

    public function test_starting_a_session_dispatches_the_worker_on_the_terminal_queue(): void
    {
        $team = Team::factory()->create();
        $id = $this->openSession($team->owner, $this->sshServer($team));

        Queue::assertPushedOn('terminal', RunTerminalSession::class, fn ($job) => $job->sessionId === $id);
    }

    public function test_input_and_resize_reach_the_session_in_order(): void
    {
        $team = Team::factory()->create();
        $id = $this->openSession($team->owner, $this->sshServer($team));

        $this->postJson(route('terminal.sessions.input', $id), ['data' => 'ls'])->assertOk();
        $this->postJson(route('terminal.sessions.input', $id), ['data' => " -la\r"])->assertOk();
        $this->postJson(route('terminal.sessions.resize', $id), ['cols' => 120, 'rows' => 40])->assertOk();

        $sessions = app(TerminalSessions::class);
        $this->assertSame("ls -la\r", $sessions->pullInput($id));
        $this->assertSame('', $sessions->pullInput($id));
        $this->assertSame([120, 40], $sessions->pullSize($id));
    }

    public function test_attach_and_close_flip_the_session_flags(): void
    {
        $team = Team::factory()->create();
        $id = $this->openSession($team->owner, $this->sshServer($team));
        $sessions = app(TerminalSessions::class);

        $this->assertFalse($sessions->isAttached($id));
        $this->postJson(route('terminal.sessions.attach', $id))->assertOk();
        $this->assertTrue($sessions->isAttached($id));

        $this->deleteJson(route('terminal.sessions.destroy', $id))->assertOk();
        $this->assertTrue($sessions->isClosed($id));
    }

    public function test_someone_else_cannot_touch_the_session(): void
    {
        $team = Team::factory()->create();
        $id = $this->openSession($team->owner, $this->sshServer($team));
        $stranger = User::factory()->create();

        $this->actingAs($stranger)->postJson(route('terminal.sessions.input', $id), ['data' => 'x'])->assertNotFound();
        $this->actingAs($stranger)->postJson(route('terminal.sessions.attach', $id))->assertNotFound();
        $this->actingAs($stranger)->deleteJson(route('terminal.sessions.destroy', $id))->assertNotFound();
    }

    public function test_only_the_owner_of_the_session_passes_the_channel_authorization(): void
    {
        $team = Team::factory()->create();
        $id = $this->openSession($team->owner, $this->sshServer($team));
        $sessions = app(TerminalSessions::class);

        $this->assertTrue($sessions->ownedBy($id, $team->owner->id));
        $this->assertFalse($sessions->ownedBy($id, User::factory()->create()->id));
        $this->assertFalse($sessions->ownedBy('missing', $team->owner->id));
    }

    public function test_agent_server_cannot_start_a_session(): void
    {
        $team = Team::factory()->create();
        $server = $this->sshServer($team, ['auth_type' => ServerAuthType::Agent, 'password' => null]);

        $this->actingAs($team->owner)->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertUnprocessable();
        Queue::assertNothingPushed();
    }

    public function test_server_of_another_team_cannot_start_a_session(): void
    {
        $server = $this->sshServer(Team::factory()->create());

        $this->actingAs(Team::factory()->create()->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $server->id])
            ->assertNotFound();
    }

    public function test_terminal_is_off_without_reverb(): void
    {
        config(['broadcasting.default' => 'log']);
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->postJson(route('terminal.sessions.store'), ['server_id' => $this->sshServer($team)->id])
            ->assertStatus(503);
        $this->actingAs($team->owner)->get(route('terminal'))
            ->assertInertia(fn ($page) => $page->where('enabled', false));
    }
}
