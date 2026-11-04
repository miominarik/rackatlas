<x-mail::message>
# New feedback

<x-mail::panel>
{{ $feedback }}
</x-mail::panel>

**Name:** {{ $name !== '' ? $name : '-' }}

**Email:** {{ $email !== '' ? $email : '-' }}

**Language:** {{ $language }}
</x-mail::message>
