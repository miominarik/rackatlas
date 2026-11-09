<?php

namespace App\Http\Requests\Servers;

use App\Enums\ServerAuthType;
use App\Enums\ServerType;
use App\Models\Server;
use App\Models\Team;
use App\Support\EuropeanCountries;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServerRequest extends FormRequest
{
    public function team(): ?Team
    {
        return $this->route('server')?->team ?? $this->user()->currentTeam();
    }

    /**
     * The kind of server. It cannot be changed after the server was created.
     */
    public function serverType(): ServerType
    {
        $existing = $this->route('server');

        return $existing instanceof Server
            ? $existing->type
            : (ServerType::tryFrom((string) $this->input('type')) ?? ServerType::Server);
    }

    public function authorize(): bool
    {
        $team = $this->team();

        return $team !== null && $this->user()->can('permit', [$team, 'servers.edit']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $team = $this->team();
        $isMysql = $this->serverType() === ServerType::Mysql;
        $isSentinel = $this->serverType() === ServerType::Sentinel;
        // A Redis server and a Sentinel-only server log in the same way.
        $isRedis = $isSentinel || $this->serverType() === ServerType::Redis;
        $isDatabase = $isMysql || $isRedis;
        // A database always logs in with a password, over the network. Redis may have none.
        $isPassword = $isMysql || $this->input('auth_type') === ServerAuthType::Password->value;
        $isKey = ! $isDatabase && $this->input('auth_type') === ServerAuthType::Key->value;
        // A server with the agent reports by itself, so it needs no address or login.
        $needsAddress = $isDatabase || $this->input('auth_type') !== ServerAuthType::Agent->value;
        $existing = $this->route('server') instanceof Server;

        return [
            'type' => ['nullable', Rule::enum(ServerType::class)],
            'name' => ['required', 'string', 'max:255'],
            'provider' => ['nullable', 'string', 'max:100'],
            'country' => ['nullable', 'string', Rule::in(EuropeanCountries::CODES)],
            'host' => [$needsAddress ? 'required' : 'nullable', 'string', 'max:255', 'regex:/^[A-Za-z0-9._:\-\[\]]+$/'],
            'port' => [$needsAddress ? 'required' : 'nullable', 'integer', 'between:1,65535'],
            // Redis has the user "default" when no ACL users are used, so it needs no name.
            'username' => [$needsAddress && ! $isRedis ? 'required' : 'nullable', 'string', 'max:64', 'regex:/^\S+$/'],
            'server_category_id' => ['nullable', Rule::exists('server_categories', 'id')->where('team_id', $team->id)],
            'new_category' => ['nullable', 'string', 'max:100'],
            'ignored_alerts' => ['nullable', 'array'],
            'ignored_alerts.*' => ['string', Rule::in(Server::IGNORABLE_ALERTS)],
            'auth_type' => [$isDatabase ? 'nullable' : 'required', Rule::enum(ServerAuthType::class)],
            'uses_agent' => ['nullable', 'boolean'],
            'agent_terminal' => ['nullable', 'boolean'],
            'password' => [Rule::requiredIf($isPassword && ! $existing), 'nullable', 'string', 'max:1000'],
            // Servers with the same master name belong to one Redis Sentinel setup. A Sentinel-only server must have one.
            'sentinel_master_name' => [Rule::requiredIf($isSentinel || ($isRedis && filled($this->input('sentinel_port')))), 'nullable', 'string', 'max:100', 'regex:/^\S+$/'],
            'sentinel_port' => [Rule::requiredIf($isRedis && ! $isSentinel && filled($this->input('sentinel_master_name'))), 'nullable', 'integer', 'between:1,65535'],
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
            'sentinel_master_name.regex' => __('The master name cannot contain spaces.'),
        ];
    }
}
