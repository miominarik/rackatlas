<?php

namespace App\Models;

use Database\Factories\FcmTokenFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * An Android phone with the app installed that registered with Firebase Cloud Messaging.
 *
 * @property int $id
 * @property int $user_id
 * @property int|null $user_device_id
 * @property string $token_hash
 * @property string $token
 * @property string|null $name
 * @property Carbon|null $last_used_at
 * @property Carbon|null $last_attempted_at
 * @property string|null $last_error
 */
#[Fillable(['user_id', 'user_device_id', 'token_hash', 'token', 'name', 'last_used_at', 'last_attempted_at', 'last_error'])]
#[Hidden(['token'])]
class FcmToken extends Model
{
    /** @use HasFactory<FcmTokenFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'token' => 'encrypted',
            'last_used_at' => 'datetime',
            'last_attempted_at' => 'datetime',
        ];
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /** @return BelongsTo<User, $this> */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
