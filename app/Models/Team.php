<?php

namespace App\Models;

use App\Enums\PermissionLevel;
use App\Enums\ServerType;
use App\Enums\TeamPermission;
use App\Enums\TeamRole;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property string $name
 * @property int $owner_id
 */
#[Fillable(['name', 'owner_id'])]
class Team extends Model
{
    use HasFactory;
    use LogsActivity;

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function members(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role', 'permissions')
            ->withTimestamps();
    }

    public function invitations(): HasMany
    {
        return $this->hasMany(TeamInvitation::class);
    }

    public function servers(): HasMany
    {
        return $this->hasMany(Server::class);
    }

    /**
     * The Linux machines, without the databases that are listed among the servers too.
     */
    public function machines(): HasMany
    {
        return $this->servers()->where('type', ServerType::Server->value);
    }

    public function serverCategories(): HasMany
    {
        return $this->hasMany(ServerCategory::class);
    }

    public function sshKeys(): HasMany
    {
        return $this->hasMany(SshKey::class);
    }

    public function backups(): HasMany
    {
        return $this->hasMany(Backup::class);
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class);
    }

    public function apiTokens(): HasMany
    {
        return $this->hasMany(ApiToken::class);
    }

    public function roleOf(User $user): ?TeamRole
    {
        $role = $this->members()->whereKey($user->getKey())->first()?->pivot->role;

        return $role ? TeamRole::from($role) : null;
    }

    /**
     * What the user may do in this team, a level for every permission. Owners and admins may do
     * everything, a member gets what is set for the member on top of the defaults.
     *
     * @return array<string, PermissionLevel>
     */
    public function permissionsOf(User $user): array
    {
        $member = $this->members()->whereKey($user->getKey())->first();

        if ($member === null) {
            return array_map(fn () => PermissionLevel::None, TeamPermission::defaults());
        }

        if (TeamRole::from($member->pivot->role)->canManage()) {
            return array_map(fn () => PermissionLevel::Edit, TeamPermission::defaults());
        }

        $stored = $member->pivot->permissions;
        $stored = is_string($stored) ? json_decode($stored, true) : $stored;

        return [
            ...TeamPermission::defaults(),
            ...array_map(PermissionLevel::from(...), TeamPermission::sanitize(is_array($stored) ? $stored : null)),
        ];
    }

    /**
     * Whether the user has the permission at the level, as "servers.edit" or "logs.view".
     */
    public function permits(User $user, string $ability): bool
    {
        [$key, $level] = explode('.', $ability) + [1 => 'view'];

        $permission = TeamPermission::tryFrom($key);
        $required = PermissionLevel::tryFrom($level);

        if ($permission === null || $required === null) {
            return false;
        }

        return $this->permissionsOf($user)[$permission->value]->atLeast($required);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('team')
            ->logOnly(['name', 'owner_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
