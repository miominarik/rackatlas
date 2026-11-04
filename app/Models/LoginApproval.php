<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A sign-in that waits for the user to allow it on one of their approving devices.
 *
 * @property int $id
 * @property int $user_id
 * @property int $number
 * @property array<int, int> $choices
 * @property string $status
 * @property string|null $ip_address
 * @property string|null $browser
 * @property string|null $platform
 * @property Carbon $expires_at
 * @property Carbon|null $decided_at
 * @property int|null $decided_by_device_id
 */
#[Fillable(['user_id', 'number', 'choices', 'status', 'ip_address', 'browser', 'platform', 'expires_at', 'decided_at', 'decided_by_device_id'])]
class LoginApproval extends Model
{
    use Prunable;

    public const PENDING = 'pending';

    public const APPROVED = 'approved';

    public const DENIED = 'denied';

    /** How long the user has to answer. */
    public const LIFETIME_MINUTES = 2;

    protected function casts(): array
    {
        return [
            'choices' => 'array',
            'expires_at' => 'datetime',
            'decided_at' => 'datetime',
        ];
    }

    /**
     * A new request: the number shown on the signing-in screen plus two others to choose from
     * on the approving device.
     */
    public static function start(User $user, ?string $ip, ?string $browser, ?string $platform): self
    {
        $numbers = collect(range(10, 99))->shuffle()->take(3)->values();

        return static::create([
            'user_id' => $user->id,
            'number' => $numbers[0],
            'choices' => $numbers->sort()->values()->all(),
            'status' => self::PENDING,
            'ip_address' => $ip,
            'browser' => $browser,
            'platform' => $platform,
            'expires_at' => now()->addMinutes(self::LIFETIME_MINUTES),
        ]);
    }

    public function isPending(): bool
    {
        return $this->status === self::PENDING && $this->expires_at->isFuture();
    }

    public function isExpired(): bool
    {
        return $this->status === self::PENDING && $this->expires_at->isPast();
    }

    /**
     * @param  Builder<LoginApproval>  $query
     */
    public function scopeOpen(Builder $query): void
    {
        $query->where('status', self::PENDING)->where('expires_at', '>', now());
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function prunable(): Builder
    {
        return static::where('created_at', '<', now()->subDays(7));
    }
}
