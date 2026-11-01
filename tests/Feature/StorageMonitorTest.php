<?php

namespace Tests\Feature;

use App\Enums\TeamRole;
use App\Jobs\CheckStorageMonitor;
use App\Models\StorageMonitor;
use App\Models\Team;
use App\Models\User;
use App\Notifications\StorageAlertNotification;
use App\Services\Storage\StorageMonitorRunner;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class StorageMonitorTest extends TestCase
{
    use RefreshDatabase;

    private const TOKEN = 'sv=2024-11-04&ss=b&se=2030-01-01T00:00:00Z&sp=rl&sig=abc';

    private function listing(string $next = ''): string
    {
        return '<?xml version="1.0"?><EnumerationResults><Blobs>'
            .'<Blob><Name>a</Name><Properties><Content-Length>100</Content-Length></Properties></Blob>'
            .'<Blob><Name>b</Name><Properties><Content-Length>250</Content-Length></Properties></Blob>'
            ."</Blobs><NextMarker>{$next}</NextMarker></EnumerationResults>";
    }

    private function monitor(?Team $team = null): StorageMonitor
    {
        return ($team ?? Team::factory()->create())->storageMonitors()->create([
            'name' => 'Backups', 'account' => 'myaccount', 'container' => 'backups', 'sas_token' => self::TOKEN,
        ]);
    }

    public function test_adding_a_storage_checks_it_at_once(): void
    {
        Http::fake(['*.blob.core.windows.net/*' => Http::response($this->listing())]);
        $team = Team::factory()->create();

        $this->actingAs($team->owner)->post(route('storage.store'), [
            'name' => 'Backups', 'account' => 'MyAccount', 'container' => 'backups', 'check_interval' => 5,
            'sas_token' => 'https://myaccount.blob.core.windows.net/backups?'.self::TOKEN,
        ])->assertRedirect();

        $monitor = StorageMonitor::firstOrFail();
        $this->assertSame('myaccount', $monitor->account);
        $this->assertSame(self::TOKEN, $monitor->sas_token);
        $this->assertSame('online', $monitor->status);
        $this->assertSame(2, $monitor->blob_count);
        $this->assertSame(350, $monitor->total_bytes);
        $this->assertFalse($monitor->is_partial);
        $this->assertDatabaseHas('storage_checks', ['storage_monitor_id' => $monitor->id, 'ok' => true]);
    }

    public function test_the_token_is_stored_encrypted_and_never_sent_to_the_page(): void
    {
        Http::fake(['*' => Http::response($this->listing())]);
        $monitor = $this->monitor();

        $this->assertNotSame(self::TOKEN, \DB::table('storage_monitors')->value('sas_token'));

        $this->actingAs($monitor->team->owner)->get(route('storage.show', $monitor))
            ->assertOk()
            ->assertDontSee('sig=abc');
    }

    public function test_the_token_must_look_like_a_sas_token(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)->post(route('storage.store'), [
            'name' => 'x', 'account' => 'myaccount', 'container' => 'backups', 'check_interval' => 5, 'sas_token' => 'nonsense',
        ])->assertSessionHasErrors('sas_token');

        $this->assertDatabaseCount('storage_monitors', 0);
    }

    public function test_an_empty_token_keeps_the_stored_one_on_update(): void
    {
        Http::fake(['*' => Http::response($this->listing())]);
        $monitor = $this->monitor();

        $this->actingAs($monitor->team->owner)->put(route('storage.update', $monitor), [
            'name' => 'Renamed', 'account' => 'myaccount', 'container' => 'backups', 'check_interval' => 5, 'sas_token' => '',
        ])->assertRedirect();

        $monitor->refresh();
        $this->assertSame('Renamed', $monitor->name);
        $this->assertSame(self::TOKEN, $monitor->sas_token);
    }

    public function test_a_big_container_is_counted_in_pages_and_marked_partial_when_cut(): void
    {
        Http::fake(['*' => Http::response($this->listing('more'))]);
        $monitor = $this->monitor();

        app(StorageMonitorRunner::class)->run($monitor);

        $monitor->refresh();
        $this->assertTrue($monitor->is_partial);
        $this->assertSame(40, $monitor->blob_count);
    }

    public function test_the_team_is_alerted_after_two_failures_and_once_when_it_recovers(): void
    {
        Notification::fake();
        $monitor = $this->monitor();
        $runner = app(StorageMonitorRunner::class);

        Http::fake(['*' => Http::sequence()
            ->push('<Error><Code>AuthorizationFailure</Code></Error>', 403)
            ->push('<Error><Code>AuthorizationFailure</Code></Error>', 403)
            ->push('<Error><Code>AuthorizationFailure</Code></Error>', 403)
            ->push($this->listing())]);

        $runner->run($monitor);
        $this->assertSame('unknown', $monitor->refresh()->status);
        Notification::assertNothingSent();

        $runner->run($monitor->refresh());
        $this->assertSame('offline', $monitor->refresh()->status);
        $this->assertNotNull($monitor->last_error);

        $runner->run($monitor->refresh());
        Notification::assertSentToTimes($monitor->team->owner, StorageAlertNotification::class, 1);

        $runner->run($monitor->refresh());

        $this->assertSame('online', $monitor->refresh()->status);
        $this->assertNull($monitor->alert_opened_at);
        Notification::assertSentToTimes($monitor->team->owner, StorageAlertNotification::class, 2);
    }

    public function test_a_member_can_view_but_not_change_a_storage(): void
    {
        Http::fake(['*' => Http::response($this->listing())]);
        $monitor = $this->monitor();
        $member = User::factory()->create();
        $monitor->team->members()->attach($member, ['role' => TeamRole::Member->value]);

        $this->actingAs($member)->get(route('storage.show', $monitor))->assertOk();
        $this->actingAs($member)->post(route('storage.check', $monitor))->assertForbidden();
        $this->actingAs($member)->delete(route('storage.destroy', $monitor))->assertForbidden();
        $this->assertDatabaseCount('storage_monitors', 1);
    }

    public function test_an_outsider_cannot_see_or_change_a_storage(): void
    {
        $monitor = $this->monitor();
        $outsider = User::factory()->create();

        $this->actingAs($outsider)->get(route('storage.show', $monitor))->assertForbidden();
        $this->actingAs($outsider)->get(route('storage.edit', $monitor))->assertForbidden();
        $this->actingAs($outsider)->put(route('storage.update', $monitor), [
            'name' => 'x', 'account' => 'myaccount', 'container' => 'backups', 'check_interval' => 5, 'sas_token' => self::TOKEN,
        ])->assertForbidden();
        $this->actingAs($outsider)->delete(route('storage.destroy', $monitor))->assertForbidden();
    }

    public function test_the_owner_can_delete_a_storage(): void
    {
        $monitor = $this->monitor();

        $this->actingAs($monitor->team->owner)->delete(route('storage.destroy', $monitor))
            ->assertRedirect(route('storage.index'));

        $this->assertDatabaseCount('storage_monitors', 0);
    }

    public function test_guests_are_sent_to_login(): void
    {
        $this->get(route('storage.index'))->assertRedirect(route('login'));
    }

    public function test_the_dashboard_lists_the_storage_of_the_team(): void
    {
        $monitor = $this->monitor();

        $this->actingAs($monitor->team->owner)->get(route('dashboard'))
            ->assertInertia(fn ($page) => $page
                ->where('storage.0.name', 'Backups')
                ->missing('storage.0.sas_token')
                ->where('settings.widgets.6.id', 'storage'));
    }

    public function test_each_storage_is_checked_by_its_own_interval(): void
    {
        Queue::fake();
        $team = Team::factory()->create();
        $make = fn (string $name, int $interval, $checked) => $team->storageMonitors()->create([
            'name' => $name, 'account' => 'myaccount', 'container' => 'backups', 'sas_token' => self::TOKEN,
            'check_interval' => $interval,
        ])->forceFill(['last_checked_at' => $checked])->save();

        $make('due', 10, now()->subMinutes(11));
        $make('not-yet', 30, now()->subMinutes(11));
        $make('never', 60, null);

        $this->artisan('storage:check')->assertSuccessful();

        Queue::assertPushed(CheckStorageMonitor::class, 2);
    }

    public function test_the_interval_must_be_a_sensible_number_of_minutes(): void
    {
        $team = Team::factory()->create();

        foreach ([0, 1441, 'often'] as $value) {
            $this->actingAs($team->owner)->post(route('storage.store'), [
                'name' => 'x', 'account' => 'myaccount', 'container' => 'backups',
                'sas_token' => self::TOKEN, 'check_interval' => $value,
            ])->assertSessionHasErrors('check_interval');
        }
    }
}
