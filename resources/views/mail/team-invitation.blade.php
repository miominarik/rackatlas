<x-mail::message>
# {{ __('Join :team', ['team' => $team]) }}

{{ __(':inviter has invited you to join the team **:team** on :app.', ['inviter' => $inviter, 'team' => $team, 'app' => config('app.name')]) }}

<x-mail::button :url="$url">
{{ __('Accept invitation') }}
</x-mail::button>

{{ __('This invitation expires on :date. Use the email address this message was sent to when you log in or register.', ['date' => $expiresAt->format('j. n. Y')]) }}

{{ __('If you were not expecting this invitation, you can ignore this email.') }}
</x-mail::message>
