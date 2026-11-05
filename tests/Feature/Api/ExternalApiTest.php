<?php

namespace Tests\Feature\Api;

use App\Enums\AlertType;
use App\Models\ApiToken;
use App\Models\Backup;
use App\Models\Server;
use App\Models\ServerService;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ExternalApiTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function server(Team $team, string $name = 'web'): Server
    {
        return $team->servers()->create([
            'name' => $name, 'host' => '8.8.8.8', 'port' => 22, 'username' => 'root',
            'auth_type' => 'agent',
        ]);
    }

    /**
     * @param  array<int, string>|null  $scopes
     * @return array{0: Team, 1: array<string, string>}
     */
    private function client(?array $scopes = null): array
    {
        $team = Team::factory()->create();
        [, $plain] = ApiToken::issue($team, $team->owner, 'Grafana', $scopes ?? ApiToken::SCOPES);

        return [$team, ['Authorization' => 'Bearer '.$plain]];
    }

    private function sample(Server $server, string $at, float $cpu = 20.0): void
    {
        $server->metrics()->create([
            'collected_at' => $at, 'cpu_percent' => $cpu, 'cpu_cores' => 2,
            'load_1' => 0.5, 'load_5' => 0.4, 'load_15' => 0.3,
            'memory_total' => 1000, 'memory_used' => 250, 'swap_total' => 0, 'swap_used' => 0,
            'uptime_seconds' => 100, 'net_rx_bps' => 10, 'net_tx_bps' => 20,
        ]);
    }

    public function test_requests_without_a_valid_key_are_refused(): void
    {
        $this->getJson('/api/v1/me')->assertUnauthorized();
        $this->getJson('/api/v1/me', ['Authorization' => 'Bearer rak_nope'])->assertUnauthorized();

        $team = Team::factory()->create();
        [, $plain] = ApiToken::issue($team, null, 'old', ApiToken::SCOPES, now()->subDay());
        $this->getJson('/api/v1/me', ['Authorization' => 'Bearer '.$plain])->assertUnauthorized();
    }

    public function test_me_tells_the_team_and_the_scopes_of_the_key(): void
    {
        [$team, $headers] = $this->client([ApiToken::SCOPE_SERVERS]);

        $this->getJson('/api/v1/me', $headers)
            ->assertOk()
            ->assertJsonPath('data.team.id', $team->id)
            ->assertJsonPath('data.key.scopes', ['servers:read']);

        $this->assertNotNull(ApiToken::first()->last_used_at);
    }

    public function test_a_route_needs_its_scope(): void
    {
        [, $headers] = $this->client([ApiToken::SCOPE_SERVERS]);

        $this->getJson('/api/v1/servers', $headers)->assertOk();
        $this->getJson('/api/v1/backups', $headers)->assertForbidden();
        $this->getJson('/api/v1/applications', $headers)->assertForbidden();
        $this->getJson('/api/v1/alerts', $headers)->assertForbidden();
        $this->getJson('/api/v1/servers/1/metrics', $headers)->assertForbidden();
    }

    public function test_servers_are_limited_to_the_team_of_the_key(): void
    {
        [$team, $headers] = $this->client();
        $own = $this->server($team, 'mine');
        $foreign = $this->server(Team::factory()->create(), 'theirs');
        $this->sample($own, now()->subMinute()->toDateTimeString(), 42.0);

        $this->getJson('/api/v1/servers', $headers)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'mine')
            ->assertJsonPath('data.0.current.cpu_percent', 42)
            ->assertJsonPath('data.0.current.memory_percent', 25)
            ->assertJsonMissingPath('data.0.password')
            ->assertJsonMissingPath('data.0.agent_token_hash');

        $this->getJson('/api/v1/servers/'.$own->id, $headers)->assertOk();
        $this->getJson('/api/v1/servers/'.$foreign->id, $headers)->assertNotFound();
        $this->getJson('/api/v1/servers/'.$foreign->id.'/metrics', $headers)->assertNotFound();
    }

    public function test_metrics_come_as_buckets_with_averages_and_maximums(): void
    {
        [$team, $headers] = $this->client();
        $server = $this->server($team);
        $this->sample($server, now()->subMinutes(10)->startOfHour()->addMinute()->toDateTimeString(), 10.0);
        $this->sample($server, now()->subMinutes(10)->startOfHour()->addMinutes(2)->toDateTimeString(), 30.0);

        $from = now()->subHours(3)->toIso8601String();

        $response = $this->getJson('/api/v1/servers/'.$server->id.'/metrics?'.http_build_query(['from' => $from, 'interval' => 3600]), $headers)
            ->assertOk()
            ->assertJsonPath('meta.interval_seconds', 3600);

        $rows = collect($response->json('data'))->where('samples', 2);
        $this->assertCount(1, $rows);
        $this->assertEquals(20, $rows->first()['cpu_percent_avg']);
        $this->assertEquals(30, $rows->first()['cpu_percent_max']);
        $this->assertEquals(25, $rows->first()['memory_percent_avg']);
    }

    public function test_metric_ranges_are_validated(): void
    {
        [$team, $headers] = $this->client();
        $url = '/api/v1/servers/'.$this->server($team)->id.'/metrics';

        $this->getJson($url.'?interval=7', $headers)->assertUnprocessable()->assertJsonValidationErrors('interval');
        $this->getJson($url.'?from=yesterday-ish', $headers)->assertUnprocessable()->assertJsonValidationErrors('from');
        $this->getJson($url.'?from='.urlencode(now()->subDays(40)->toIso8601String()), $headers)->assertUnprocessable()->assertJsonValidationErrors('from');
        $this->getJson($url.'?from='.urlencode(now()->subDays(20)->toIso8601String()).'&interval=60', $headers)->assertUnprocessable()->assertJsonValidationErrors('interval');
        $this->getJson($url.'?from='.urlencode(now()->addDay()->toIso8601String()), $headers)->assertUnprocessable();
    }

    public function test_disk_history_has_one_row_per_mount(): void
    {
        [$team, $headers] = $this->client();
        $server = $this->server($team);
        $this->sample($server, now()->subMinutes(5)->toDateTimeString());
        $server->metrics()->first()->disks()->getRelated()->newQuery()->create([
            'server_metric_id' => $server->metrics()->first()->id,
            'device' => '/dev/vda1', 'mount' => '/', 'filesystem' => 'ext4',
            'total_bytes' => 10 * 1073741824, 'used_bytes' => 5 * 1073741824,
        ]);

        $this->getJson('/api/v1/servers/'.$server->id.'/metrics/disks?interval=3600', $headers)
            ->assertOk()
            ->assertJsonPath('data.0.mount', '/')
            ->assertJsonPath('data.0.used_percent', 50);
    }

    public function test_applications_can_be_filtered_by_status_and_stay_in_the_team(): void
    {
        [$team, $headers] = $this->client();
        $server = $this->server($team);
        ServerService::factory()->for($server)->create(['unit' => 'nginx.service']);
        ServerService::factory()->for($server)->create(['unit' => 'bad.service', 'active_state' => 'failed']);
        ServerService::factory()->for($this->server(Team::factory()->create()))->create(['unit' => 'foreign.service']);

        $this->getJson('/api/v1/applications', $headers)->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/applications?status=failed', $headers)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.unit', 'bad.service');
        $this->getJson('/api/v1/applications?status=nonsense', $headers)->assertUnprocessable();
    }

    public function test_backups_do_not_leak_the_webhook_token(): void
    {
        [$team, $headers] = $this->client();
        $backup = Backup::factory()->for($team)->create(['name' => 'db', 'last_status' => 'success']);
        Backup::factory()->create();

        $response = $this->getJson('/api/v1/backups', $headers)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.name', 'db')
            ->assertJsonPath('data.0.overdue', false);

        $this->assertStringNotContainsString($backup->token, $response->getContent());
    }

    public function test_alerts_are_open_ones_by_default(): void
    {
        [$team, $headers] = $this->client();
        $server = $this->server($team);
        $server->alerts()->create(['type' => AlertType::Offline, 'key' => 'offline', 'opened_at' => now()]);
        $server->alerts()->create(['type' => AlertType::Log, 'key' => 'log', 'opened_at' => now()->subDay(), 'resolved_at' => now()]);

        $this->getJson('/api/v1/alerts', $headers)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.type', 'offline');
        $this->getJson('/api/v1/alerts?status=all', $headers)->assertOk()->assertJsonCount(2, 'data');
        $this->getJson('/api/v1/alerts?status=resolved', $headers)->assertOk()->assertJsonCount(1, 'data')->assertJsonPath('data.0.open', false);
    }

    public function test_the_api_speaks_json_only(): void
    {
        [, $headers] = $this->client();

        $this->get('/api/v1/me', $headers + ['Accept' => 'text/html'])->assertStatus(406);

        $this->call('GET', '/api/v1/me', [], [], [], $this->transformHeadersToServerVars($headers + ['Content-Type' => 'application/x-www-form-urlencoded']), 'a=b')
            ->assertStatus(415);

        $this->get('/api/v1/me', $headers + ['Accept' => '*/*'])->assertOk()->assertHeader('Content-Type', 'application/json');
        $this->get('/api/v1/nothing-here', $headers)->assertNotFound()->assertHeader('Content-Type', 'application/json');
    }

    public function test_the_api_is_read_only(): void
    {
        [, $headers] = $this->client();

        $this->postJson('/api/v1/servers', [], $headers)->assertStatus(405);
        $this->deleteJson('/api/v1/backups', [], $headers)->assertStatus(405);
    }
}
