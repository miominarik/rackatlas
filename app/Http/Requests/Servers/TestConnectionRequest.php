<?php

namespace App\Http\Requests\Servers;

use App\Enums\ServerAuthType;
use Illuminate\Validation\Rule;

class TestConnectionRequest extends ServerRequest
{
    public function team(): ?\App\Models\Team
    {
        return $this->user()->currentTeam();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $team = $this->team();

        return [
            'host' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9._:\-\[\]]+$/'],
            'port' => ['required', 'integer', 'between:1,65535'],
            'username' => ['required', 'string', 'max:64', 'regex:/^\S+$/'],
            'auth_type' => ['required', Rule::enum(ServerAuthType::class)],
            'password' => ['nullable', 'string', 'max:1000'],
            'ssh_key_id' => ['nullable', Rule::exists('ssh_keys', 'id')->where('team_id', $team->id)],
            'server_id' => ['nullable', Rule::exists('servers', 'id')->where('team_id', $team->id)],
        ];
    }
}
