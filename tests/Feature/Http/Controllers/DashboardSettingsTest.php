<?php

namespace Tests\Feature\Http\Controllers;

use App\Enums\ServerAuthType;
use App\Models\Team;
use App\Support\DashboardSettings;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class DashboardSettingsTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_old_saved_layout_gets_the_new_options_from_the_defaults(): void
    {
        $resolved = DashboardSettings::resolve(['servers' => ['sort' => 'name']]);

        $this->assertSame('name', $resolved['servers']['sort']);
        $this->assertSame('grid', $resolved['servers']['layout']);
        $this->assertSame(0, $resolved['servers']['columns']);
        $this->assertSame(60, $resolved['servers']['history_minutes']);
        $this->assertSame(['limit' => 10, 'hours' => 24, 'level' => 'error'], $resolved['logs']);
        $this->assertSame(['limit' => 10, 'hours' => 24], $resolved['errors']);
    }

    public function test_invalid_saved_values_fall_back_to_the_defaults(): void
    {
        $resolved = DashboardSettings::resolve([
            'servers' => ['layout' => 'cube', 'columns' => 9, 'history_minutes' => 5],
            'logs' => ['limit' => 1000, 'hours' => 1, 'level' => 'debug'],
        ]);

        $this->assertSame('grid', $resolved['servers']['layout']);
        $this->assertSame(0, $resolved['servers']['columns']);
        $this->assertSame(60, $resolved['servers']['history_minutes']);
        $this->assertSame(10, $resolved['logs']['limit']);
        $this->assertSame(24, $resolved['logs']['hours']);
        $this->assertSame('error', $resolved['logs']['level']);
    }

    public function test_new_options_are_saved_and_shown_on_the_dashboard(): void
    {
        $team = Team::factory()->create();
        $settings = DashboardSettings::defaults();
        $settings['servers']['layout'] = 'list';
        $settings['servers']['columns'] = 3;
        $settings['servers']['history_minutes'] = 1440;
        $settings['logs'] = ['limit' => 20, 'hours' => 168, 'level' => 'critical'];
        $settings['errors'] = ['limit' => 5, 'hours' => 6];

        $this->actingAs($team->owner)->put(route('dashboard.settings.update'), $settings)->assertSessionHasNoErrors();

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->where('settings.servers.layout', 'list')
            ->where('settings.servers.columns', 3)
            ->where('settings.servers.history_minutes', 1440)
            ->where('settings.logs.level', 'critical')
            ->where('settings.errors.hours', 6));
    }

    public function test_options_outside_the_allowed_values_are_rejected(): void
    {
        $team = Team::factory()->create();
        $settings = DashboardSettings::defaults();
        $settings['servers']['columns'] = 7;
        $settings['logs']['limit'] = 999;

        $this->actingAs($team->owner)->put(route('dashboard.settings.update'), $settings)
            ->assertSessionHasErrors(['servers.columns', 'logs.limit']);
    }

    public function test_history_and_lists_follow_the_saved_options(): void
    {
        $team = Team::factory()->create();
        $server = $team->servers()->create([
            'name' => 'web', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password, 'password' => 'secret',
        ]);

        foreach ([10, 200] as $minutesAgo) {
            $server->metrics()->create([
                'collected_at' => now()->subMinutes($minutesAgo), 'cpu_percent' => 50, 'cpu_cores' => 2,
                'load_1' => 1, 'load_5' => 1, 'load_15' => 1, 'memory_total' => 100, 'memory_used' => 40,
                'swap_total' => 0, 'swap_used' => 0, 'uptime_seconds' => 1000,
            ]);
        }

        $server->logs()->create(['level' => 'error', 'source' => 'nginx', 'message' => 'bad', 'count' => 1, 'occurred_at' => now()->subHours(2)]);
        $server->logs()->create(['level' => 'critical', 'source' => 'kernel', 'message' => 'oops', 'count' => 1, 'occurred_at' => now()->subHours(2)]);
        $server->logs()->create(['level' => 'critical', 'source' => 'kernel', 'message' => 'old', 'count' => 1, 'occurred_at' => now()->subHours(30)]);

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->has("history.{$server->id}", 1)
            ->has('logs', 2));

        $settings = DashboardSettings::defaults();
        $settings['servers']['history_minutes'] = 360;
        $settings['logs'] = ['limit' => 20, 'hours' => 168, 'level' => 'critical'];
        $this->actingAs($team->owner)->put(route('dashboard.settings.update'), $settings);

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->has("history.{$server->id}", 2)
            ->has('logs', 2)
            ->where('logs.0.level', 'critical'));
    }
}
