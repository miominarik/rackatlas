<?php

namespace App\Http\Requests\Servers;

use App\Enums\ServerAuthType;
use App\Enums\ServerType;
use App\Models\Team;
use Illuminate\Validation\Rule;

class TestConnectionRequest extends ServerRequest
{
    public function team(): ?Team
    {
        return $this->user()->currentTeam();
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $team = $this->team();
        $isDatabase = in_array($this->input('type'), [ServerType::Mysql->value, ServerType::Redis->value, ServerType::Sentinel->value], true);
        $isRedis = in_array($this->input('type'), [ServerType::Redis->value, ServerType::Sentinel->value], true);

        return [
            'type' => ['nullable', Rule::enum(ServerType::class)],
            'host' => ['required', 'string', 'max:255', 'regex:/^[A-Za-z0-9._:\-\[\]]+$/'],
            'port' => ['required', 'integer', 'between:1,65535'],
            'username' => [$isRedis ? 'nullable' : 'required', 'string', 'max:64', 'regex:/^\S+$/'],
            'auth_type' => [$isDatabase ? 'nullable' : 'required', Rule::enum(ServerAuthType::class)],
            'password' => ['nullable', 'string', 'max:1000'],
            'ssh_key_id' => ['nullable', Rule::exists('ssh_keys', 'id')->where('team_id', $team->id)],
            'sentinel_port' => ['nullable', 'integer', 'between:1,65535'],
            'sentinel_master_name' => ['nullable', 'string', 'max:100', 'regex:/^\S+$/'],
            'server_id' => ['nullable', Rule::exists('servers', 'id')->where('team_id', $team->id)],
        ];
    }
}
