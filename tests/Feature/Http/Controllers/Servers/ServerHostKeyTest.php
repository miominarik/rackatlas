<?php

namespace Tests\Feature\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Models\Server;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class ServerHostKeyTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function pinnedServer(Team $team): Server
    {
        $server = $team->servers()->create([
            'name' => 'web', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password, 'password' => 'secret',
        ]);
        $server->forceFill(['ssh_host_fingerprint' => 'SHA256:abc'])->save();

        return $server;
    }

    public function test_manager_can_reset_the_pinned_host_key(): void
    {
        $team = Team::factory()->create();
        $server = $this->pinnedServer($team);

        $this->actingAs($team->owner)->delete(route('servers.host-key.destroy', $server))->assertRedirect();

        $this->assertNull($server->fresh()->ssh_host_fingerprint);
    }

    public function test_outsider_cannot_reset_the_pinned_host_key(): void
    {
        $server = $this->pinnedServer(Team::factory()->create());

        $this->actingAs(User::factory()->create())->delete(route('servers.host-key.destroy', $server))->assertForbidden();

        $this->assertSame('SHA256:abc', $server->fresh()->ssh_host_fingerprint);
    }

    public function test_changing_the_address_drops_the_pinned_host_key_but_other_edits_keep_it(): void
    {
        $team = Team::factory()->create();
        $server = $this->pinnedServer($team);
        $payload = [
            'name' => 'renamed', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => 'password', 'password' => '',
        ];

        $this->actingAs($team->owner)->put(route('servers.update', $server), $payload);
        $this->assertSame('SHA256:abc', $server->fresh()->ssh_host_fingerprint);

        $this->actingAs($team->owner)->put(route('servers.update', $server), [...$payload, 'host' => 'other.example.com']);
        $this->assertNull($server->fresh()->ssh_host_fingerprint);
    }
}
