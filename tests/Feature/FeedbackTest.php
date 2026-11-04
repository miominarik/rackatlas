<?php

namespace Tests\Feature;

use App\Mail\FeedbackMail;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class FeedbackTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        config(['services.turnstile.secret_key' => null, 'services.turnstile.site_key' => null]);
    }

    public function test_a_visitor_can_share_an_opinion(): void
    {
        Mail::fake();
        config(['services.feedback.to' => 'owner@example.com']);

        $this->post(route('feedback.store'), [
            'name' => 'Jana',
            'email' => 'jana@example.com',
            'message' => 'The dashboard is great, I miss a dark map.',
        ])->assertSessionHasNoErrors();

        Mail::assertSent(FeedbackMail::class, fn (FeedbackMail $mail) => $mail->hasTo('owner@example.com')
            && $mail->hasReplyTo('jana@example.com')
            && $mail->feedback === 'The dashboard is great, I miss a dark map.');
    }

    public function test_name_and_email_are_optional(): void
    {
        Mail::fake();

        $this->post(route('feedback.store'), ['message' => 'Please add more graphs.'])
            ->assertSessionHasNoErrors();

        Mail::assertSent(FeedbackMail::class);
    }

    public function test_the_message_is_required_and_the_honeypot_must_stay_empty(): void
    {
        Mail::fake();

        $this->post(route('feedback.store'), ['message' => 'short'])->assertSessionHasErrors('message');
        $this->post(route('feedback.store'), ['message' => 'A long enough message.', 'website' => 'http://spam'])
            ->assertSessionHasErrors('website');

        Mail::assertNothingSent();
    }

    public function test_it_is_rate_limited(): void
    {
        Mail::fake();

        foreach (range(1, 5) as $_) {
            $this->post(route('feedback.store'), ['message' => 'A long enough message.']);
        }

        $this->post(route('feedback.store'), ['message' => 'A long enough message.'])->assertStatus(429);
    }
}
