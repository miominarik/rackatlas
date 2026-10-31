<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string $color
 */
#[Fillable(['team_id', 'name', 'color'])]
class ServerCategory extends Model
{
    use LogsActivity;

    public const COLORS = ['slate', 'emerald', 'blue', 'amber', 'red', 'violet', 'pink'];

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function servers(): HasMany
    {
        return $this->hasMany(Server::class);
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('category')
            ->logOnly(['name', 'color', 'team_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
