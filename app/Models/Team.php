<?php

namespace App\Models;

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
            ->withPivot('role')
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

    public function serverCategories(): HasMany
    {
        return $this->hasMany(ServerCategory::class);
    }

    public function sshKeys(): HasMany
    {
        return $this->hasMany(SshKey::class);
    }

    public function roleOf(User $user): ?TeamRole
    {
        $role = $this->members()->whereKey($user->getKey())->first()?->pivot->role;

        return $role ? TeamRole::from($role) : null;
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
