<?php

namespace Tests\Feature;

use App\Enums\ServerAuthType;
use App\Models\Server;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class FleetMetricsTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function serverWithMetric(Team $team, string $name, float $cpu): Server
    {
        $server = $team->servers()->create([
            'name' => $name,
            'host' => '8.8.8.8',
            'port' => 22,
            'username' => 'root',
            'auth_type' => ServerAuthType::Password->value,
            'password' => 'secret',
        ]);

        $server->metrics()->create([
            'collected_at' => now()->subMinute(),
            'cpu_percent' => $cpu,
            'cpu_cores' => 4,
            'load_1' => 0.5,
            'load_5' => 0.4,
            'load_15' => 0.3,
            'memory_total' => 1000,
            'memory_used' => 500,
            'swap_total' => 0,
            'swap_used' => 0,
            'uptime_seconds' => 3600,
        ]);

        return $server;
    }

    public function test_metrics_show_all_servers_of_the_team_by_default(): void
    {
        $team = Team::factory()->create();
        $this->serverWithMetric($team, 'alpha', 10);
        $this->serverWithMetric($team, 'beta', 90);

        $this->actingAs($team->owner)
            ->get(route('metrics.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('metrics')
                ->where('server', null)
                ->has('fleet.servers', 2)
                ->where('fleet.servers.0.name', 'alpha')
                ->where('fleet.servers.1.current.cpu_percent', 90)
                ->has('fleet.servers.0.points', 1));
    }

    public function test_one_server_can_still_be_opened(): void
    {
        $team = Team::factory()->create();
        $this->serverWithMetric($team, 'alpha', 10);
        $beta = $this->serverWithMetric($team, 'beta', 90);

        $this->actingAs($team->owner)
            ->get(route('metrics.index', ['server' => $beta->id]))
            ->assertInertia(fn (Assert $page) => $page
                ->where('server.name', 'beta')
                ->where('fleet', null));
    }

    public function test_fleet_does_not_include_servers_of_other_teams(): void
    {
        $team = Team::factory()->create();
        $this->serverWithMetric($team, 'mine', 10);
        $this->serverWithMetric(Team::factory()->create(), 'foreign', 10);

        $this->actingAs($team->owner)
            ->get(route('metrics.index'))
            ->assertInertia(fn (Assert $page) => $page->has('fleet.servers', 1));
    }

    public function test_invalid_server_parameter_is_rejected(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->get(route('metrics.index', ['server' => 'abc']))
            ->assertSessionHasErrors('server');
    }
}
