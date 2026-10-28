<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string $algorithm
 * @property string $fingerprint
 * @property string $public_key
 * @property string $private_key
 * @property string|null $passphrase
 */
#[Fillable(['team_id', 'name', 'algorithm', 'fingerprint', 'public_key', 'private_key', 'passphrase'])]
#[Hidden(['private_key', 'passphrase'])]
class SshKey extends Model
{
    protected function casts(): array
    {
        return [
            'private_key' => 'encrypted',
            'passphrase' => 'encrypted',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function servers(): HasMany
    {
        return $this->hasMany(Server::class);
    }
}
