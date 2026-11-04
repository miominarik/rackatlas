<?php

namespace Tests\Feature\Http\Controllers;

use App\Enums\TeamRole;
use App\Models\Backup;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class BackupTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_owner_creates_a_backup_with_a_webhook_token(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('backups.store'), ['name' => 'Nightly DB', 'expected_interval_hours' => 24])
            ->assertSessionHasNoErrors();

        $backup = $team->backups()->firstOrFail();
        $this->assertSame('Nightly DB', $backup->name);
        $this->assertSame(48, strlen($backup->token));
    }

    public function test_index_exposes_the_webhook_url(): void
    {
        $backup = Backup::factory()->create();

        $this->actingAs($backup->team->owner)
            ->get(route('backups.index'))
            ->assertInertia(fn ($page) => $page
                ->component('backups/index')
                ->where('backups.0.webhook_url', route('webhooks.backups', $backup->token)));
    }

    public function test_backup_can_be_edited_and_deleted(): void
    {
        $backup = Backup::factory()->create();
        $owner = $backup->team->owner;

        $this->actingAs($owner)
            ->put(route('backups.update', $backup), ['name' => 'Renamed'])
            ->assertSessionHasNoErrors();
        $this->assertSame('Renamed', $backup->fresh()->name);

        $this->actingAs($owner)->delete(route('backups.destroy', $backup));
        $this->assertModelMissing($backup);
    }

    public function test_regenerating_changes_the_token(): void
    {
        $backup = Backup::factory()->create();
        $old = $backup->token;

        $this->actingAs($backup->team->owner)->post(route('backups.regenerate', $backup));

        $this->assertNotSame($old, $backup->fresh()->token);
        $this->post(route('webhooks.backups', $old))->assertNotFound();
    }

    public function test_server_must_belong_to_the_team(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('backups.store'), ['name' => 'x', 'server_id' => 999])
            ->assertSessionHasErrors('server_id');
    }

    public function test_other_team_and_plain_members_cannot_change_backups(): void
    {
        $backup = Backup::factory()->create();
        $stranger = User::factory()->create();
        $member = User::factory()->create();
        $backup->team->members()->attach($member, ['role' => TeamRole::Member->value]);

        foreach ([$stranger, $member] as $user) {
            $this->actingAs($user)->delete(route('backups.destroy', $backup))->assertForbidden();
        }

        $this->assertModelExists($backup);
    }

    public function test_webhook_updates_the_backup(): void
    {
        $backup = Backup::factory()->create();

        $this->postJson(route('webhooks.backups', $backup->token), ['size' => 2048, 'message' => 'done'])
            ->assertOk()->assertJson(['ok' => true]);

        $backup->refresh();
        $this->assertNotNull($backup->last_run_at);
        $this->assertSame('success', $backup->last_status);
        $this->assertSame(2048, $backup->last_size_bytes);
        $this->assertSame('done', $backup->last_message);
    }

    public function test_webhook_works_with_get_and_records_failures(): void
    {
        $backup = Backup::factory()->create();

        $this->get(route('webhooks.backups', $backup->token).'?status=failed')->assertOk();

        $this->assertSame('failed', $backup->fresh()->last_status);
    }

    public function test_webhook_with_an_unknown_token_is_not_found(): void
    {
        $this->postJson(route('webhooks.backups', 'nope'))->assertNotFound();
    }

    public function test_overdue_is_computed_from_the_expected_interval(): void
    {
        $backup = Backup::factory()->create(['expected_interval_hours' => 24]);
        $backup->forceFill(['last_run_at' => now()->subHours(30)])->save();
        $this->assertTrue($backup->isOverdue());

        $backup->forceFill(['last_run_at' => now()->subHours(2)])->save();
        $this->assertFalse($backup->isOverdue());
    }
}
