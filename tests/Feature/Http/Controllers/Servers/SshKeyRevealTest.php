<?php

namespace Tests\Feature\Http\Controllers\Servers;

use App\Models\SshKey;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Tests\TestCase;

class SshKeyRevealTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function key(Team $team): SshKey
    {
        return $team->sshKeys()->create([
            'name' => 'k', 'algorithm' => 'ed25519', 'fingerprint' => 'SHA256:x',
            'public_key' => 'ssh-ed25519 AAA', 'private_key' => 'SECRET-PRIVATE', 'passphrase' => 'pw',
        ]);
    }

    public function test_the_owner_gets_the_private_key_with_the_right_password(): void
    {
        $team = Team::factory()->create();
        $key = $this->key($team);

        $this->actingAs($team->owner)
            ->postJson(route('ssh-keys.reveal', $key), ['password' => 'password'])
            ->assertOk()
            ->assertJsonPath('private_key', 'SECRET-PRIVATE')
            ->assertJsonPath('passphrase', 'pw');

        $this->assertDatabaseHas('activity_log', ['log_name' => 'ssh-key', 'description' => 'private key revealed']);
    }

    public function test_a_wrong_password_reveals_nothing(): void
    {
        $team = Team::factory()->create();

        $this->actingAs($team->owner)
            ->postJson(route('ssh-keys.reveal', $this->key($team)), ['password' => 'nope'])
            ->assertUnprocessable()
            ->assertJsonMissingPath('private_key');
    }

    public function test_someone_outside_the_team_is_refused(): void
    {
        $key = $this->key(Team::factory()->create());

        $this->actingAs(User::factory()->create())
            ->postJson(route('ssh-keys.reveal', $key), ['password' => 'password'])
            ->assertForbidden();
    }
}
