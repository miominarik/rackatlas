<?php

namespace Tests\Feature\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Models\Server;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

class ServerShowTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function server(Team $team): Server
    {
        return $team->servers()->create([
            'name' => 'db-1', 'host' => 'example.com', 'port' => 22, 'username' => 'root',
            'auth_type' => ServerAuthType::Password, 'password' => 'secret',
        ]);
    }

    public function test_team_member_sees_server_detail_without_secrets(): void
    {
        $team = Team::factory()->create();
        $server = $this->server($team);

        $this->actingAs($team->owner)->get(route('servers.show', $server))
            ->assertOk()
            ->assertInertia(fn (Assert $page) => $page
                ->component('servers/show')
                ->where('server.name', 'db-1')
                ->where('canManage', true)
                ->missing('server.password'));
    }

    public function test_outsider_cannot_see_server_detail(): void
    {
        $server = $this->server(Team::factory()->create());

        $this->actingAs(User::factory()->create())->get(route('servers.show', $server))->assertForbidden();
    }

    public function test_guest_is_redirected_to_login(): void
    {
        $server = $this->server(Team::factory()->create());

        $this->get(route('servers.show', $server))->assertRedirect(route('login'));
    }
}
