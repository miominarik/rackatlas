<?php

namespace App\Models;

use Carbon\CarbonInterface;
use Database\Factories\ApiTokenFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;

/**
 * A key of a team for the external API. It sees the resources of its team only, and only what its scopes allow.
 *
 * @property int $id
 * @property int $team_id
 * @property int|null $created_by
 * @property string $name
 * @property string $token_hash
 * @property array<int, string> $abilities
 * @property Carbon|null $last_used_at
 * @property Carbon|null $expires_at
 */
#[Fillable(['team_id', 'created_by', 'name', 'abilities', 'expires_at'])]
#[Hidden(['token_hash'])]
class ApiToken extends Model
{
    /** @use HasFactory<ApiTokenFactory> */
    use HasFactory;

    public const SCOPE_SERVERS = 'servers:read';

    public const SCOPE_METRICS = 'metrics:read';

    public const SCOPE_APPLICATIONS = 'applications:read';

    public const SCOPE_BACKUPS = 'backups:read';

    public const SCOPE_ALERTS = 'alerts:read';

    public const SCOPES = [
        self::SCOPE_SERVERS,
        self::SCOPE_METRICS,
        self::SCOPE_APPLICATIONS,
        self::SCOPE_BACKUPS,
        self::SCOPE_ALERTS,
    ];

    /** Updating `last_used_at` on every request would write to the database a lot, so it is refreshed at most this often. */
    public const LAST_USED_REFRESH_MINUTES = 5;

    protected function casts(): array
    {
        return [
            'abilities' => 'array',
            'last_used_at' => 'datetime',
            'expires_at' => 'datetime',
        ];
    }

    /**
     * Create a key for a team. The plain value is returned once, only its hash is stored.
     *
     * @param  array<int, string>  $abilities
     * @return array{0: self, 1: string}
     */
    public static function issue(Team $team, ?User $creator, string $name, array $abilities, ?CarbonInterface $expiresAt = null): array
    {
        $plain = 'rak_'.Str::random(40);

        $token = new static([
            'team_id' => $team->id,
            'created_by' => $creator?->id,
            'name' => $name,
            'abilities' => array_values(array_intersect(self::SCOPES, $abilities)),
            'expires_at' => $expiresAt,
        ]);
        $token->forceFill(['token_hash' => hash('sha256', $plain)])->save();

        return [$token, $plain];
    }

    public static function findByPlainToken(string $plain): ?self
    {
        return static::query()->where('token_hash', hash('sha256', $plain))->first();
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function can(string $scope): bool
    {
        return in_array($scope, $this->abilities, true);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function touchLastUsed(): void
    {
        if ($this->last_used_at === null || $this->last_used_at->lt(now()->subMinutes(self::LAST_USED_REFRESH_MINUTES))) {
            $this->forceFill(['last_used_at' => now()])->saveQuietly();
        }
    }
}
