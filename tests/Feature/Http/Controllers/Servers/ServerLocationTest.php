<?php

namespace Tests\Feature\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Models\Team;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ServerLocationTest extends TestCase
{
    use LazilyRefreshDatabase;

    /**
     * @return array<string, mixed>
     */
    private function payload(array $overrides = []): array
    {
        return [
            'name' => 'web',
            'auth_type' => ServerAuthType::Agent->value,
            ...$overrides,
        ];
    }

    public function test_provider_and_country_are_saved_with_a_server(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), $this->payload(['provider' => ' Hetzner ', 'country' => 'DE']))
            ->assertSessionHasNoErrors();

        $server = $team->servers()->firstOrFail();
        $this->assertSame('Hetzner', $server->provider);
        $this->assertSame('DE', $server->country);
    }

    public function test_unknown_country_is_rejected(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->post(route('servers.store'), $this->payload(['country' => 'XX']))
            ->assertSessionHasErrors('country');

        $this->assertSame(0, $team->servers()->count());
    }
}
