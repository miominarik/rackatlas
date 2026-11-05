<?php

namespace Tests\Feature\Http\Controllers;

use App\Models\Server;
use App\Models\ServerService;
use App\Models\Team;
use App\Models\User;
use App\Services\Ssh\ServiceSync;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ApplicationTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function agentServer(Team $team): Server
    {
        return $team->servers()->create([
            'name' => 'web', 'host' => '8.8.8.8', 'port' => 22, 'username' => 'root',
            'auth_type' => 'agent',
        ]);
    }

    public function test_status_tells_running_stopped_disabled_and_failed_apart(): void
    {
        $status = fn (string $active, ?string $file) => (new ServerService(['active_state' => $active, 'unit_file_state' => $file]))->status();

        $this->assertSame('running', $status('active', 'enabled'));
        $this->assertSame('failed', $status('failed', 'enabled'));
        $this->assertSame('stopped', $status('inactive', 'enabled'));
        $this->assertSame('stopped', $status('inactive', 'static'));
        $this->assertSame('disabled', $status('inactive', 'disabled'));
        $this->assertSame('disabled', $status('inactive', 'masked'));
    }

    public function test_sync_replaces_the_list_and_keeps_the_journal_of_a_known_service(): void
    {
        $server = $this->agentServer(Team::factory()->create());
        $sync = app(ServiceSync::class);

        $sync->sync($server, "nginx.service|active|running|enabled|Web server\nold.service|inactive|dead|disabled|Old\n../evil|active|running|enabled|x\n");
        $server->services()->where('unit', 'nginx.service')->update(['journal' => 'kept']);
        $sync->sync($server, "nginx.service|failed|failed|enabled|Web server\n");

        $this->assertSame(['nginx.service'], $server->services()->pluck('unit')->all());
        $nginx = $server->services()->firstOrFail();
        $this->assertSame('failed', $nginx->active_state);
        $this->assertSame('kept', $nginx->journal);
    }

    public function test_an_empty_list_does_not_wipe_the_known_services(): void
    {
        $server = $this->agentServer(Team::factory()->create());
        ServerService::factory()->for($server)->create(['unit' => 'nginx.service']);

        app(ServiceSync::class)->sync($server, "\n");

        $this->assertSame(1, $server->services()->count());
    }

    public function test_page_lists_the_services_of_the_team(): void
    {
        $team = Team::factory()->create();
        $server = $this->agentServer($team);
        ServerService::factory()->for($server)->create(['unit' => 'nginx.service']);
        ServerService::factory()->for($server)->create(['unit' => 'bad.service', 'active_state' => 'failed']);

        $this->actingAs($team->owner)
            ->get(route('applications.index'))
            ->assertInertia(fn ($page) => $page
                ->component('applications/index')
                ->where('servers.0.services.0.unit', 'bad.service')
                ->where('servers.0.services.0.status', 'failed')
                ->where('servers.0.services.1.status', 'running'));
    }

    public function test_requesting_the_journal_marks_it_pending_and_the_agent_is_told_in_the_answer(): void
    {
        $team = Team::factory()->create();
        $server = $this->agentServer($team);
        $token = $server->issueAgentToken();
        $service = ServerService::factory()->for($server)->create(['unit' => 'nginx.service']);
        ServerService::factory()->for($server)->create(['unit' => 'quiet.service']);

        $this->actingAs($team->owner)->post(route('applications.journal.request', $service))->assertRedirect();

        $this->assertTrue($service->fresh()->journalIsPending());
        $this->actingAs($team->owner)->get(route('applications.index'))
            ->assertInertia(fn ($page) => $page->where('servers.0.services.0.journal_pending', true));

        $this->call('POST', route('agent.ingest'), [], [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$token], "###CPU1\ncpu  100 0 100 800 0 0 0 0 0 0\n###CPU2\ncpu  150 0 150 900 0 0 0 0 0 0\n###LOAD\n0.1 0.1 0.1 1/1 1\n###CORES\n2\n###MEM\nMemTotal: 1000 kB\nMemAvailable: 500 kB\n###UPTIME\n10\n")
            ->assertOk()
            ->assertJsonPath('journal', ['nginx.service']);
    }

    public function test_ingest_stores_the_services_section(): void
    {
        $server = $this->agentServer(Team::factory()->create());
        $token = $server->issueAgentToken();

        $report = "###CPU1\ncpu  100 0 100 800 0 0 0 0 0 0\n###CPU2\ncpu  150 0 150 900 0 0 0 0 0 0\n###LOAD\n0.1 0.1 0.1 1/1 1\n###CORES\n2\n###MEM\nMemTotal: 1000 kB\nMemAvailable: 500 kB\n###UPTIME\n10\n"
            ."###JOURNAL_CRITICAL\n###JOURNAL_ERROR\n###SERVICES\nssh.service|active|running|disabled|OpenBSD Secure Shell server\ngetty@tty1.service|active|running||Getty on tty1\n###FAILED_UNITS\n";

        $this->call('POST', route('agent.ingest'), [], [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$token], $report)->assertOk();

        $this->assertEqualsCanonicalizing(['ssh.service', 'getty@tty1.service'], $server->services()->pluck('unit')->all());
    }

    public function test_a_request_nobody_answered_expires(): void
    {
        $service = ServerService::factory()->for($this->agentServer(Team::factory()->create()))
            ->create(['journal_requested_at' => now()->subMinutes(ServerService::JOURNAL_REQUEST_MINUTES + 1)]);

        $this->assertFalse($service->journalIsPending());
    }

    public function test_agent_sends_the_journal_for_a_known_service_only(): void
    {
        $server = $this->agentServer(Team::factory()->create());
        $token = $server->issueAgentToken();
        $service = ServerService::factory()->for($server)->create([
            'unit' => 'nginx.service', 'journal_requested_at' => now(),
        ]);

        $this->call('POST', route('agent.journal'), [], [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$token, 'HTTP_X_UNIT' => 'nginx.service'], 'line one')->assertOk();
        $this->call('POST', route('agent.journal'), [], [], [], ['HTTP_AUTHORIZATION' => 'Bearer '.$token, 'HTTP_X_UNIT' => 'other.service'], 'x')->assertNotFound();

        $service->refresh();
        $this->assertSame('line one', $service->journal);
        $this->assertNull($service->journal_requested_at);
        $this->assertNotNull($service->journal_updated_at);
    }

    public function test_journal_downloads_as_a_text_file_for_the_team_only(): void
    {
        $team = Team::factory()->create();
        $service = ServerService::factory()->for($this->agentServer($team))->create([
            'unit' => 'nginx.service', 'journal' => 'line one', 'journal_updated_at' => now(),
        ]);

        $this->actingAs($team->owner)
            ->get(route('applications.journal', $service))
            ->assertOk()
            ->assertHeader('Content-Disposition', 'attachment; filename="web-nginx.service-journal.txt"')
            ->assertSee('line one');

        $this->actingAs(User::factory()->create())
            ->get(route('applications.journal', $service))
            ->assertForbidden();

        $this->actingAs(User::factory()->create())
            ->post(route('applications.journal.request', $service))
            ->assertForbidden();
    }

    public function test_service_without_a_journal_cannot_be_downloaded(): void
    {
        $team = Team::factory()->create();
        $service = ServerService::factory()->for($this->agentServer($team))->create();

        $this->actingAs($team->owner)->get(route('applications.journal', $service))->assertNotFound();
    }
}
