<?php

namespace App\Models;

use App\Enums\ServerAuthType;
use App\Enums\ServerStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $server_category_id
 * @property string $name
 * @property string $host
 * @property int $port
 * @property string $username
 * @property ServerAuthType $auth_type
 * @property string|null $password
 * @property int|null $ssh_key_id
 * @property ServerStatus $status
 * @property \Illuminate\Support\Carbon|null $last_checked_at
 * @property \Illuminate\Support\Carbon|null $last_seen_at
 */
#[Fillable(['team_id', 'server_category_id', 'name', 'host', 'port', 'username', 'auth_type', 'password', 'ssh_key_id'])]
#[Hidden(['password'])]
class Server extends Model
{
    protected function casts(): array
    {
        return [
            'auth_type' => ServerAuthType::class,
            'password' => 'encrypted',
            'status' => ServerStatus::class,
            'last_checked_at' => 'datetime',
            'last_seen_at' => 'datetime',
        ];
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

    public function errors(): HasMany
    {
        return $this->hasMany(ServerError::class);
    }
}
