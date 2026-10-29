<?php

namespace App\Http\Requests\Servers;

use App\Enums\ServerAuthType;
use App\Models\Server;
use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServerRequest extends FormRequest
{
    public function team(): ?Team
    {
        return $this->route('server')?->team ?? $this->user()->currentTeam();
    }

    public function authorize(): bool
    {
        $team = $this->team();

        return $team !== null && $this->user()->can('manage', $team);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $team = $this->team();
        $isPassword = $this->input('auth_type') === ServerAuthType::Password->value;
        $isKey = $this->input('auth_type') === ServerAuthType::Key->value;
        // A server with the agent reports by itself, so it needs no address or login.
        $needsAddress = $this->input('auth_type') !== ServerAuthType::Agent->value;
        $existing = $this->route('server') instanceof Server;

        return [
            'name' => ['required', 'string', 'max:255'],
            'host' => [$needsAddress ? 'required' : 'nullable', 'string', 'max:255', 'regex:/^[A-Za-z0-9._:\-\[\]]+$/'],
            'port' => [$needsAddress ? 'required' : 'nullable', 'integer', 'between:1,65535'],
            'username' => [$needsAddress ? 'required' : 'nullable', 'string', 'max:64', 'regex:/^\S+$/'],
            'server_category_id' => ['nullable', Rule::exists('server_categories', 'id')->where('team_id', $team->id)],
            'new_category' => ['nullable', 'string', 'max:100'],
            'auth_type' => ['required', Rule::enum(ServerAuthType::class)],
            'password' => [Rule::requiredIf($isPassword && ! $existing), 'nullable', 'string', 'max:1000'],
            'ssh_key_id' => [
                Rule::requiredIf($isKey),
                'nullable',
                Rule::exists('ssh_keys', 'id')->where('team_id', $team->id),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'host.regex' => __('Enter a hostname or an IP address without spaces.'),
            'username.regex' => __('The username cannot contain spaces.'),
        ];
    }
}
