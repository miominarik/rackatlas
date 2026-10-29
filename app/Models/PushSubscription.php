<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A browser or phone that registered to receive push notifications.
 *
 * @property int $id
 * @property int $user_id
 * @property string $endpoint_hash
 * @property string $endpoint
 * @property string $public_key
 * @property string $auth_token
 * @property string $content_encoding
 * @property string|null $name
 * @property Carbon|null $last_used_at
 * @property Carbon|null $last_attempted_at
 * @property string|null $last_error
 */
#[Fillable(['user_id', 'endpoint_hash', 'endpoint', 'public_key', 'auth_token', 'content_encoding', 'name', 'last_used_at', 'last_attempted_at', 'last_error'])]
#[Hidden(['endpoint', 'public_key', 'auth_token'])]
class PushSubscription extends Model
{
    protected function casts(): array
    {
        return [
            'endpoint' => 'encrypted',
            'public_key' => 'encrypted',
            'auth_token' => 'encrypted',
            'last_used_at' => 'datetime',
            'last_attempted_at' => 'datetime',
        ];
    }

    public static function hashEndpoint(string $endpoint): string
    {
        return hash('sha256', $endpoint);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
