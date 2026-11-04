<?php

namespace App\Models;

use App\Enums\ServerAuthType;
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $server_category_id
 * @property string $name
 * @property string|null $provider Hosting company the server runs at
 * @property string|null $country ISO 3166-1 alpha-2 code of the country the server is in
 * @property string $host
 * @property int $port
 * @property string|null $ssh_host_fingerprint
 * @property string $username
 * @property ServerAuthType $auth_type How the app logs in over SSH. Agent means there is no SSH access at all.
 * @property bool $uses_agent Whether the data comes from the agent although the server also has SSH access
 * @property bool $agent_terminal Whether the terminal runs through the agent, which connects out, instead of over SSH
 * @property string|null $password
 * @property int|null $ssh_key_id
 * @property string|null $agent_token_hash
 * @property string|null $agent_version
 * @property array<int, string>|null $failed_units
 * @property array<int, string>|null $ignored_alerts
 * @property array<string, string|int|bool>|null $system_info Facts the agent reports: OS, kernel, CPU model, pending updates
 * @property ServerStatus $status
 * @property Carbon|null $last_checked_at
 * @property Carbon|null $last_seen_at
 */
#[Fillable(['team_id', 'server_category_id', 'name', 'provider', 'country', 'host', 'port', 'username', 'auth_type', 'uses_agent', 'agent_terminal', 'password', 'ssh_key_id', 'ignored_alerts'])]
#[Hidden(['password', 'agent_token_hash'])]
class Server extends Model
{
    use LogsActivity;

    /** The sources of warnings a server can be told to stay quiet about. */
    public const IGNORABLE_ALERTS = ['cpu', 'ram', 'disk', 'services', 'logs'];

    protected function casts(): array
    {
        return [
            'auth_type' => ServerAuthType::class,
            'uses_agent' => 'boolean',
            'agent_terminal' => 'boolean',
            'password' => 'encrypted',
            'status' => ServerStatus::class,
            'last_checked_at' => 'datetime',
            'last_seen_at' => 'datetime',
            'failed_units' => 'array',
            'ignored_alerts' => 'array',
            'system_info' => 'array',
        ];
    }

    /**
     * Whether the warnings from one source (cpu, ram, disk, services, logs) are switched off for this server.
     */
    public function ignoresAlert(string $source): bool
    {
        return in_array($source, $this->ignored_alerts ?? [], true);
    }

    /**
     * Whether the metrics come from the agent. Otherwise the app collects them over SSH.
     */
    public function collectsViaAgent(): bool
    {
        return $this->auth_type === ServerAuthType::Agent || $this->uses_agent;
    }

    /**
     * Whether a terminal can be opened, which needs SSH login details.
     */
    public function hasSshAccess(): bool
    {
        return $this->auth_type !== ServerAuthType::Agent;
    }

    /**
     * Whether the terminal goes through the agent. It needs the agent, so the flag alone is not enough.
     */
    public function opensTerminalViaAgent(): bool
    {
        return $this->agent_terminal && $this->collectsViaAgent();
    }

    /**
     * Whether a terminal can be opened at all, over SSH or through the agent.
     */
    public function canOpenTerminal(): bool
    {
        return $this->hasSshAccess() || $this->opensTerminalViaAgent();
    }

    /**
     * Servers that send their data through the agent, with or without SSH access.
     *
     * @param  Builder<Server>  $query
     */
    #[Scope]
    protected function viaAgent(Builder $query): void
    {
        $query->where(fn (Builder $inner) => $inner
            ->where('auth_type', ServerAuthType::Agent->value)
            ->orWhere('uses_agent', true));
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(ServerCategory::class, 'server_category_id');
    }

    public function sshKey(): BelongsTo
    {
        return $this->belongsTo(SshKey::class);
    }

    public function metrics(): HasMany
    {
        return $this->hasMany(ServerMetric::class);
    }

    public function latestMetric(): HasOne
    {
        return $this->hasOne(ServerMetric::class)->latestOfMany('collected_at');
    }

    public function logs(): HasMany
    {
        return $this->hasMany(ServerLog::class);
    }

    /**
     * Create a new agent token. The plain value is returned once, only its hash is stored.
     */
    public function issueAgentToken(): string
    {
        $token = 'ra_'.Str::random(40);

        $this->forceFill(['agent_token_hash' => hash('sha256', $token)])->save();

        return $token;
    }

    public static function findByAgentToken(string $token): ?self
    {
        return static::query()->viaAgent()
            ->where('agent_token_hash', hash('sha256', $token))
            ->first();
    }

    public function alerts(): HasMany
    {
        return $this->hasMany(ServerAlert::class);
    }

    public function errors(): HasMany
    {
        return $this->hasMany(ServerError::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('server')
            ->logOnly(['name', 'provider', 'country', 'host', 'port', 'username', 'auth_type', 'uses_agent', 'agent_terminal', 'server_category_id', 'ssh_key_id', 'team_id', 'ignored_alerts'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
