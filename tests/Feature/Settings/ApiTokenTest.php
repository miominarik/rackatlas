<?php

namespace Tests\Feature\Settings;

use App\Enums\TeamRole;
use App\Models\ApiToken;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ApiTokenTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_a_manager_creates_a_key_and_sees_the_plain_value_once(): void
    {
        $team = Team::factory()->create();

        $response = $this->actingAs($team->owner)->followingRedirects()->post(route('teams.api-tokens.store', $team), [
            'name' => 'Grafana',
            'scopes' => ['servers:read', 'metrics:read'],
            'expires_in_days' => 30,
        ]);

        $token = ApiToken::firstOrFail();
        $this->assertSame(['servers:read', 'metrics:read'], $token->abilities);
        $this->assertTrue($token->expires_at->isFuture());

        $page = $response->viewData('page');
        $plain = $page['flash']['api_token']['token'] ?? null;
        $this->assertNotNull($plain);
        $this->assertStringStartsWith('rak_', $plain);
        $this->assertSame(hash('sha256', $plain), $token->token_hash);

        $this->actingAs($team->owner)->get(route('teams.show', $team))
            ->assertInertia(fn ($page) => $page
                ->component('settings/teams/show')
                ->has('apiTokens', 1)
                ->where('apiTokens.0.name', 'Grafana')
                ->missing('apiTokens.0.token_hash'));
    }

    public function test_the_key_works_against_the_api(): void
    {
        $team = Team::factory()->create();
        [, $plain] = ApiToken::issue($team, $team->owner, 'k', ['servers:read']);

        $this->getJson('/api/v1/servers', ['Authorization' => 'Bearer '.$plain])->assertOk();
    }

    public function test_scopes_are_validated(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)->post(route('teams.api-tokens.store', $team), ['name' => 'x', 'scopes' => []])
            ->assertSessionHasErrors('scopes');
        $this->actingAs($team->owner)->post(route('teams.api-tokens.store', $team), ['name' => 'x', 'scopes' => ['servers:write']])
            ->assertSessionHasErrors('scopes.0');
        $this->actingAs($team->owner)->post(route('teams.api-tokens.store', $team), ['name' => 'x', 'scopes' => ['servers:read'], 'expires_in_days' => 7])
            ->assertSessionHasErrors('expires_in_days');

        $this->assertSame(0, ApiToken::count());
    }

    public function test_a_plain_member_cannot_create_or_revoke_keys(): void
    {
        $team = Team::factory()->create();
        $member = User::factory()->create();
        $team->members()->attach($member->id, ['role' => TeamRole::Member->value]);
        $token = ApiToken::factory()->for($team)->create();

        $this->actingAs($member)->post(route('teams.api-tokens.store', $team), ['name' => 'x', 'scopes' => ['servers:read']])->assertForbidden();
        $this->actingAs($member)->delete(route('teams.api-tokens.destroy', [$team, $token]))->assertForbidden();
        $this->actingAs($member)->get(route('teams.show', $team))
            ->assertInertia(fn ($page) => $page->where('apiTokens', []));
    }

    public function test_revoking_stops_the_key_and_only_works_inside_the_team(): void
    {
        $team = Team::factory()->create();
        [$token, $plain] = ApiToken::issue($team, $team->owner, 'k', ['servers:read']);
        $foreign = ApiToken::factory()->create();

        $this->actingAs($team->owner)->delete(route('teams.api-tokens.destroy', [$team, $foreign]))->assertNotFound();
        $this->assertModelExists($foreign);

        $this->actingAs($team->owner)->delete(route('teams.api-tokens.destroy', [$team, $token]))->assertRedirect();
        $this->assertModelMissing($token);

        $this->getJson('/api/v1/servers', ['Authorization' => 'Bearer '.$plain])->assertUnauthorized();
    }
}
