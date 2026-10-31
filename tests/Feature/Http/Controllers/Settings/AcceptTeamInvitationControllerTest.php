<?php

namespace Tests\Feature\Http\Controllers\Settings;

use App\Enums\TeamRole;
use App\Mail\TeamInvitationMail;
use App\Models\Team;
use App\Models\TeamInvitation;
use App\Models\User;
use Illuminate\Foundation\Testing\LazilyRefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class AcceptTeamInvitationControllerTest extends TestCase
{
    use LazilyRefreshDatabase;

    private function invite(Team $team, string $email, string $token, bool $expired = false): TeamInvitation
    {
        return $team->invitations()->create([
            'email' => $email, 'role' => TeamRole::Member,
            'token' => TeamInvitation::hashToken($token), 'invited_by' => $team->owner_id,
            'expires_at' => $expired ? now()->subDay() : now()->addDay(),
        ]);
    }

    public function test_sent_invitation_stores_only_the_hash_of_the_token(): void
    {
        $team = Team::factory()->create();
        Mail::fake();

        $this->actingAs($team->owner)->post(route('teams.invitations.store', $team), [
            'email' => 'new@example.com', 'role' => 'member',
        ]);

        $stored = $team->invitations()->firstOrFail()->token;

        Mail::assertSent(TeamInvitationMail::class, function (TeamInvitationMail $mail) use ($stored) {
            return $mail->token !== $stored
                && TeamInvitation::hashToken($mail->token) === $stored
                && str_contains($mail->render(), $mail->token);
        });
    }

    public function test_opening_the_link_changes_nothing(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        $this->invite($team, $user->email, 'plain-token');

        $this->actingAs($user)->get(route('team-invitations.show', 'plain-token'))->assertOk();

        $this->assertFalse($team->members()->whereKey($user->id)->exists());
        $this->assertDatabaseCount('team_invitations', 1);
    }

    public function test_the_hash_cannot_be_used_as_the_token(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        $invitation = $this->invite($team, $user->email, 'plain-token');

        $this->actingAs($user)->get(route('team-invitations.show', $invitation->token))->assertNotFound();
        $this->actingAs($user)->post(route('team-invitations.accept', $invitation->token))->assertNotFound();
    }

    public function test_post_accepts_the_invitation(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        $this->invite($team, $user->email, 'plain-token');

        $this->actingAs($user)->post(route('team-invitations.accept', 'plain-token'))
            ->assertRedirect(route('teams.show', $team));

        $this->assertTrue($team->members()->whereKey($user->id)->exists());
        $this->assertDatabaseCount('team_invitations', 0);
    }

    public function test_invitation_for_another_email_is_not_accepted(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        $this->invite($team, 'someone-else@example.com', 'plain-token');

        $this->actingAs($user)->post(route('team-invitations.accept', 'plain-token'))
            ->assertRedirect(route('teams.index'));

        $this->assertFalse($team->members()->whereKey($user->id)->exists());
        $this->assertDatabaseCount('team_invitations', 1);
    }

    public function test_expired_invitation_is_not_accepted(): void
    {
        $team = Team::factory()->create();
        $user = User::factory()->create();
        $this->invite($team, $user->email, 'plain-token', expired: true);

        $this->actingAs($user)->post(route('team-invitations.accept', 'plain-token'))
            ->assertRedirect(route('teams.index'));

        $this->assertFalse($team->members()->whereKey($user->id)->exists());
    }

    public function test_resend_sends_a_fresh_token(): void
    {
        $team = Team::factory()->create();
        $invitation = $this->invite($team, 'new@example.com', 'old-token');
        Mail::fake();

        $this->actingAs($team->owner)->post(route('teams.invitations.resend', [$team, $invitation]));

        $invitation->refresh();
        $this->assertNotSame(TeamInvitation::hashToken('old-token'), $invitation->token);
        Mail::assertSent(TeamInvitationMail::class, fn (TeamInvitationMail $mail) => TeamInvitation::hashToken($mail->token) === $invitation->token);
    }
}
