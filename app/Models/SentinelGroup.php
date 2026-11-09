<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * The servers that run Redis Sentinel for one monitored master: Redis servers with a Sentinel and
 * servers that only run a Sentinel, for example to have a quorum.
 *
 * @property int $id
 * @property int $team_id
 * @property string $master_name The name of the monitored master in the Sentinel configuration
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 */
#[Fillable(['team_id', 'master_name'])]
class SentinelGroup extends Model
{
    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function servers(): HasMany
    {
        return $this->hasMany(Server::class);
    }

    /**
     * A group without servers is of no use, so it goes with the last one.
     */
    public function deleteIfEmpty(): void
    {
        if (! $this->servers()->exists()) {
            $this->delete();
        }
    }
}
