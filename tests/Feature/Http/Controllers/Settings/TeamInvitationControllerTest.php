<?php

namespace Tests\Feature\Http\Controllers\Settings;

use App\Enums\TeamRole;
use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class TeamInvitationControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    public function test_foreign_team_emails_are_not_disclosed_before_authorization(): void
    {
        $team = Team::factory()->create();
        $outsider = User::factory()->create();
        $team->invitations()->create([
            'email' => 'invited@example.com', 'role' => TeamRole::Member,
            'token' => str_repeat('a', 64), 'invited_by' => $team->owner_id,
            'expires_at' => now()->addDay(),
        ]);
        Mail::fake();

        foreach ([$team->owner->email, 'invited@example.com', 'unknown@example.com'] as $email) {
            $this->actingAs($outsider)->postJson(route('teams.invitations.store', $team), [
                'email' => $email, 'role' => 'member',
            ])->assertForbidden()->assertJsonMissingValidationErrors();
        }

        $this->assertDatabaseCount('team_invitations', 1);
        Mail::assertNothingSent();
    }

    public function test_owner_can_still_invite_a_member(): void
    {
        $team = Team::factory()->create();
        Mail::fake();

        $this->actingAs($team->owner)->post(route('teams.invitations.store', $team), [
            'email' => 'new@example.com', 'role' => 'member',
        ])->assertRedirect(route('teams.show', $team));

        $this->assertDatabaseHas('team_invitations', [
            'team_id' => $team->id, 'email' => 'new@example.com', 'role' => 'member',
        ]);
        Mail::assertSent(TeamInvitationMail::class);
    }
}
