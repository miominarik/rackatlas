<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Address;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;

class FeedbackMail extends Mailable
{
    public function __construct(
        public string $name,
        public string $email,
        public string $feedback,
        public string $language,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            replyTo: $this->email !== '' ? [new Address($this->email, $this->name !== '' ? $this->name : null)] : [],
            subject: 'RackAtlas feedback'.($this->name !== '' ? ' - '.$this->name : ''),
        );
    }

    public function content(): Content
    {
        return new Content(markdown: 'mail.feedback');
    }
}
