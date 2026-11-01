<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * One container of an Azure Blob Storage account that is checked every few minutes with a SAS token.
 *
 * @property int $id
 * @property int $team_id
 * @property string $name
 * @property string $account
 * @property string $container
 * @property string $sas_token
 * @property int $check_interval Minutes between two checks
 * @property string $status unknown, online or offline
 * @property Carbon|null $last_checked_at
 * @property Carbon|null $last_ok_at
 * @property string|null $last_error
 * @property int $failures Consecutive failed checks
 * @property Carbon|null $alert_opened_at
 * @property int|null $blob_count
 * @property int|null $total_bytes
 * @property bool $is_partial The container is bigger than what one check counts, so the numbers are a lower bound
 * @property int|null $response_ms
 */
#[Fillable(['team_id', 'name', 'account', 'container', 'sas_token', 'check_interval'])]
#[Hidden(['sas_token'])]
class StorageMonitor extends Model
{
    public const STATUS_UNKNOWN = 'unknown';

    public const STATUS_ONLINE = 'online';

    public const STATUS_OFFLINE = 'offline';

    /** Default minutes between two checks of one container, and the limits a person can choose from. */
    public const INTERVAL_MINUTES = 5;

    public const MIN_INTERVAL_MINUTES = 1;

    public const MAX_INTERVAL_MINUTES = 1440;

    /** A new model has not seen the defaults of the database yet. */
    protected $attributes = [
        'status' => self::STATUS_UNKNOWN,
        'failures' => 0,
        'check_interval' => self::INTERVAL_MINUTES,
        'is_partial' => false,
    ];

    protected function casts(): array
    {
        return [
            'sas_token' => 'encrypted',
            'last_checked_at' => 'datetime',
            'last_ok_at' => 'datetime',
            'alert_opened_at' => 'datetime',
            'is_partial' => 'boolean',
            'check_interval' => 'integer',
        ];
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    /** @return HasMany<StorageCheck, $this> */
    public function checks(): HasMany
    {
        return $this->hasMany(StorageCheck::class);
    }

    /**
     * When the SAS token stops working. Azure writes it into the token as `se`.
     */
    public function tokenExpiresAt(): ?Carbon
    {
        parse_str(ltrim($this->sas_token, '?'), $parts);

        try {
            return isset($parts['se']) ? Carbon::parse($parts['se']) : null;
        } catch (\Throwable) {
            return null;
        }
    }
}
