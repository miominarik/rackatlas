<?php

namespace Tests\Feature\Http\Controllers;

use App\Enums\ServerAuthType;
use App\Models\Backup;
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
        $this->assertSame(['limit' => 10, 'hours' => 24], $resolved['errors']);
    }

    public function test_a_new_widget_is_placed_after_the_widget_before_it_in_the_defaults(): void
    {
        $saved = ['widgets' => array_map(
            fn (string $id) => ['id' => $id, 'visible' => true],
            ['summary', 'problems', 'servers', 'top', 'errors'],
        )];

        $ids = array_column(DashboardSettings::resolve($saved)['widgets'], 'id');

        $this->assertSame(['summary', 'problems', 'servers', 'top', 'backups', 'errors'], $ids);
    }

    public function test_invalid_saved_values_fall_back_to_the_defaults(): void
    {
        $resolved = DashboardSettings::resolve([
            'servers' => ['layout' => 'cube', 'columns' => 9, 'history_minutes' => 5],
            'errors' => ['limit' => 1000, 'hours' => 1],
        ]);

        $this->assertSame('grid', $resolved['servers']['layout']);
        $this->assertSame(0, $resolved['servers']['columns']);
        $this->assertSame(60, $resolved['servers']['history_minutes']);
        $this->assertSame(10, $resolved['errors']['limit']);
        $this->assertSame(24, $resolved['errors']['hours']);
    }

    public function test_new_options_are_saved_and_shown_on_the_dashboard(): void
    {
        $team = Team::factory()->create();
        $settings = DashboardSettings::defaults();
        $settings['servers']['layout'] = 'list';
        $settings['servers']['columns'] = 3;
        $settings['servers']['history_minutes'] = 1440;
        $settings['errors'] = ['limit' => 5, 'hours' => 6];

        $this->actingAs($team->owner)->put(route('dashboard.settings.update'), $settings)->assertSessionHasNoErrors();

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->where('settings.servers.layout', 'list')
            ->where('settings.servers.columns', 3)
            ->where('settings.servers.history_minutes', 1440)
            ->where('settings.errors.hours', 6));
    }

    public function test_options_outside_the_allowed_values_are_rejected(): void
    {
        $team = Team::factory()->create();
        $settings = DashboardSettings::defaults();
        $settings['servers']['columns'] = 7;
        $settings['errors']['limit'] = 999;

        $this->actingAs($team->owner)->put(route('dashboard.settings.update'), $settings)
            ->assertSessionHasErrors(['servers.columns', 'errors.limit']);
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

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->has("history.{$server->id}", 1));

        $settings = DashboardSettings::defaults();
        $settings['servers']['history_minutes'] = 360;
        $this->actingAs($team->owner)->put(route('dashboard.settings.update'), $settings);

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->has("history.{$server->id}", 2));
    }

    public function test_dashboard_lists_backups_with_the_ones_needing_attention_first(): void
    {
        $team = Team::factory()->create();
        Backup::factory()->for($team)->create(['name' => 'A fine one', 'last_run_at' => now(), 'last_status' => 'success']);
        Backup::factory()->for($team)->create(['name' => 'Z failed', 'last_run_at' => now(), 'last_status' => 'failed']);

        $this->actingAs($team->owner)->get(route('dashboard'))->assertInertia(fn ($page) => $page
            ->has('backups', 2)
            ->where('backups.0.name', 'Z failed')
            ->missing('logs'));
    }
}
