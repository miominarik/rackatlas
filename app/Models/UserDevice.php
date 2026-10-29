<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A browser or phone the user signed in from. It is recognised by a long lived cookie, so the
 * same device keeps its own settings (for example the dashboard layout) across sessions.
 *
 * @property int $id
 * @property int $user_id
 * @property string $token_hash
 * @property string|null $name
 * @property string|null $browser
 * @property string|null $platform
 * @property string $type
 * @property string|null $ip_address
 * @property string|null $session_id
 * @property Carbon|null $last_active_at
 * @property Carbon|null $revoked_at
 */
#[Fillable(['user_id', 'token_hash', 'name', 'browser', 'platform', 'type', 'ip_address', 'session_id', 'last_active_at', 'revoked_at'])]
#[Hidden(['token_hash', 'session_id'])]
class UserDevice extends Model
{
    use Prunable;

    /** A signed out device is kept this long, so a remembered login cookie cannot bring it back unnoticed. */
    public const REVOKED_RETENTION_DAYS = 90;

    protected function casts(): array
    {
        return [
            'last_active_at' => 'datetime',
            'revoked_at' => 'datetime',
        ];
    }

    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * @param  Builder<UserDevice>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->whereNull('revoked_at');
    }

    /**
     * What the person sees: their own name for the device, or "Chrome · Android".
     */
    public function label(): string
    {
        if (filled($this->name)) {
            return $this->name;
        }

        return trim(implode(' · ', array_filter([$this->browser, $this->platform]))) ?: __('Unknown device');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function prunable(): Builder
    {
        return static::where('revoked_at', '<', now()->subDays(self::REVOKED_RETENTION_DAYS));
    }
}
