<x-mail::message>
# {{ __('Join :team', ['team' => $team]) }}

{{ __(':inviter has invited you to join the team **:team** on :app.', ['inviter' => $inviter, 'team' => $team, 'app' => config('app.name')]) }}

<x-mail::panel>
**{{ __('Team') }}:** {{ $team }}

**{{ __('Role') }}:** {{ $role }}

**{{ __('Valid until') }}:** {{ $expiresAt->isoFormat('LL') }}
</x-mail::panel>

<x-mail::button :url="$url">
{{ __('Accept invitation') }}
</x-mail::button>

<x-slot:subcopy>
{{ __('Use the email address this message was sent to when you log in or register.') }}

{{ __('If you were not expecting this invitation, you can ignore this email.') }}
</x-slot:subcopy>
</x-mail::message>
