<?php

namespace App\Mail;

use App\Models\TeamInvitation;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class TeamInvitationMail extends Mailable
{
    public function __construct(public TeamInvitation $invitation, public string $token) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: __('You have been invited to join :team', ['team' => $this->invitation->team->name]),
        );
    }

    public function content(): Content
    {
        return new Content(
            markdown: 'mail.team-invitation',
            with: [
                'url' => route('team-invitations.show', $this->token),
                'team' => $this->invitation->team->name,
                'inviter' => $this->invitation->inviter->name,
                'role' => __(ucfirst($this->invitation->role->value)),
                'expiresAt' => $this->invitation->expires_at,
            ],
        );
    }
}
