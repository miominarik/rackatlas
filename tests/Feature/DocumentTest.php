<?php

namespace Tests\Feature;

use App\Enums\DocumentStatus;
use App\Enums\ServerAuthType;
use App\Enums\TeamRole;
use App\Models\Document;
use App\Models\Server;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class DocumentTest extends TestCase
{
    use LazilyRefreshDatabase;

    /**
     * @param  array<string, string>|null  $permissions
     */
    private function member(Team $team, ?array $permissions = null): User
    {
        $user = User::factory()->create();
        $team->members()->attach($user->id, [
            'role' => TeamRole::Member->value,
            'permissions' => $permissions === null ? null : json_encode($permissions),
        ]);

        return $user;
    }

    private function server(Team $team, string $name = 'alpha'): Server
    {
        return $team->servers()->create([
            'name' => $name,
            'host' => '8.8.8.8',
            'port' => 22,
            'username' => 'root',
            'auth_type' => ServerAuthType::Password->value,
            'password' => 'secret',
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'template' => 'server',
            'title' => 'Production web',
            'status' => 'draft',
            'fields' => ['purpose' => 'E-shop', 'unknown' => 'dropped', 'os' => ''],
            'sections' => [['title' => 'What runs here', 'body' => '- nginx']],
            ...$overrides,
        ];
    }

    public function test_owner_creates_a_document_from_a_template(): void
    {
        $team = Team::factory()->create();
        $server = $this->server($team);

        $this->actingAs($team->owner)
            ->post(route('documents.store'), $this->payload(['server_id' => $server->id]))
            ->assertSessionHasNoErrors()
            ->assertRedirect();

        $document = $team->documents()->firstOrFail();
        $this->assertSame($server->id, $document->server_id);
        $this->assertSame(['purpose' => 'E-shop'], $document->fields);
        $this->assertSame($team->owner->id, $document->created_by);
        $this->assertSame($team->owner->id, $document->updated_by);
    }

    public function test_the_template_picker_and_a_template_form_open(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)->get(route('documents.create'))
            ->assertInertia(fn (Assert $page) => $page->component('documents/form')->has('templates.server.fields'));
        $this->actingAs($team->owner)->get(route('documents.create', ['template' => 'backup']))
            ->assertInertia(fn (Assert $page) => $page->where('template', 'backup'));
    }

    public function test_a_private_key_is_rejected(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('documents.store'), $this->payload([
                'sections' => [['title' => 'Keys', 'body' => "-----BEGIN OPENSSH PRIVATE KEY-----\nabc"]],
            ]))
            ->assertSessionHasErrors('sections.0.body');

        $this->assertSame(0, $team->documents()->count());
    }

    public function test_unknown_template_and_foreign_server_are_rejected(): void
    {
        $team = Team::factory()->create();
        $foreign = $this->server(Team::factory()->create());

        $this->actingAs($team->owner)
            ->post(route('documents.store'), $this->payload(['template' => 'nope', 'server_id' => $foreign->id]))
            ->assertSessionHasErrors(['template', 'server_id']);
    }

    public function test_update_keeps_the_template_and_records_the_editor(): void
    {
        $document = Document::factory()->create(['template' => 'server']);
        $editor = $this->member($document->team, ['docs' => 'edit']);

        $this->actingAs($editor)
            ->put(route('documents.update', $document), $this->payload(['template' => null, 'title' => 'Renamed', 'status' => 'current']))
            ->assertSessionHasNoErrors();

        $document->refresh();
        $this->assertSame('Renamed', $document->title);
        $this->assertSame('server', $document->template);
        $this->assertSame(DocumentStatus::Current, $document->status);
        $this->assertSame($editor->id, $document->updated_by);
    }

    public function test_review_marks_the_document_current_today(): void
    {
        $document = Document::factory()->create(['status' => DocumentStatus::Outdated]);

        $this->actingAs($document->team->owner)->post(route('documents.review', $document))->assertRedirect();

        $document->refresh();
        $this->assertSame(DocumentStatus::Current, $document->status);
        $this->assertTrue($document->reviewed_at->isToday());
    }

    public function test_delete_removes_the_document(): void
    {
        $document = Document::factory()->create();

        $this->actingAs($document->team->owner)->delete(route('documents.destroy', $document))
            ->assertRedirect(route('documents.index'));

        $this->assertModelMissing($document);
    }

    public function test_a_view_only_member_reads_but_does_not_change(): void
    {
        $document = Document::factory()->create();
        $viewer = $this->member($document->team);

        $this->actingAs($viewer)->get(route('documents.index'))->assertOk();
        $this->actingAs($viewer)->get(route('documents.show', $document))
            ->assertInertia(fn (Assert $page) => $page->where('canManage', false));
        $this->actingAs($viewer)->get(route('documents.create'))->assertForbidden();
        $this->actingAs($viewer)->get(route('documents.edit', $document))->assertForbidden();
        $this->actingAs($viewer)->post(route('documents.store'), $this->payload())->assertForbidden();
        $this->actingAs($viewer)->put(route('documents.update', $document), $this->payload())->assertForbidden();
        $this->actingAs($viewer)->post(route('documents.review', $document))->assertForbidden();
        $this->actingAs($viewer)->delete(route('documents.destroy', $document))->assertForbidden();
        $this->assertModelExists($document);
    }

    public function test_the_section_can_be_closed_for_a_member(): void
    {
        $document = Document::factory()->create();
        $member = $this->member($document->team, ['docs' => 'none']);

        $this->actingAs($member)->get(route('documents.index'))->assertForbidden();
        $this->actingAs($member)->get(route('documents.show', $document))->assertForbidden();
    }

    public function test_documents_of_another_team_are_not_reachable(): void
    {
        $mine = Team::factory()->create();
        $foreign = Document::factory()->create(['title' => 'Secret plan']);

        $this->actingAs($mine->owner)->get(route('documents.show', $foreign))->assertForbidden();
        $this->actingAs($mine->owner)->get(route('documents.edit', $foreign))->assertForbidden();
        $this->actingAs($mine->owner)->put(route('documents.update', $foreign), $this->payload())->assertForbidden();
        $this->actingAs($mine->owner)->delete(route('documents.destroy', $foreign))->assertForbidden();
        $this->actingAs($mine->owner)->get(route('documents.index'))
            ->assertInertia(fn (Assert $page) => $page->has('documents', 0));
    }

    public function test_the_index_shows_which_servers_have_no_documentation(): void
    {
        $team = Team::factory()->create();
        $documented = $this->server($team, 'documented');
        $this->server($team, 'bare');
        Document::factory()->create(['team_id' => $team->id, 'server_id' => $documented->id]);

        $this->actingAs($team->owner)->get(route('documents.index'))
            ->assertInertia(fn (Assert $page) => $page
                ->has('documents', 1)
                ->where('servers.0.name', 'bare')
                ->where('servers.0.documented', false)
                ->where('servers.1.name', 'documented')
                ->where('servers.1.documented', true));
    }

    public function test_server_detail_lists_its_documents(): void
    {
        $team = Team::factory()->create();
        $server = $this->server($team);
        Document::factory()->create(['team_id' => $team->id, 'server_id' => $server->id, 'title' => 'Overview']);
        Document::factory()->create(['team_id' => $team->id, 'title' => 'Elsewhere']);

        $this->actingAs($team->owner)->get(route('servers.show', $server))
            ->assertInertia(fn (Assert $page) => $page
                ->has('documents.items', 1)
                ->where('documents.items.0.title', 'Overview')
                ->where('documents.canCreate', true));

        $closed = $this->member($team, ['docs' => 'none']);
        $this->actingAs($closed)->get(route('servers.show', $server))
            ->assertInertia(fn (Assert $page) => $page->where('documents', null));
    }
}
