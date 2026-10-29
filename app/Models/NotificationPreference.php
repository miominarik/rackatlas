<?php

namespace App\Models;

use App\Enums\AlertType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $user_id
 * @property bool $email_enabled
 * @property bool $push_enabled
 * @property bool $notify_offline
 * @property bool $notify_resources
 * @property bool $notify_services
 * @property bool $notify_logs
 * @property bool $notify_recovery
 */
#[Fillable([
    'user_id', 'email_enabled', 'push_enabled', 'notify_offline', 'notify_resources',
    'notify_services', 'notify_logs', 'notify_recovery',
])]
class NotificationPreference extends Model
{
    public const FLAGS = [
        'email_enabled', 'push_enabled', 'notify_offline', 'notify_resources',
        'notify_services', 'notify_logs', 'notify_recovery',
    ];

    /**
     * Until a user saves their choices everything is on, so nobody misses an outage.
     */
    public static function defaults(): self
    {
        return new self(array_fill_keys(self::FLAGS, true));
    }

    public static function for(User $user): self
    {
        return $user->notificationPreference ?? self::defaults();
    }

    /**
     * Whether this user wants to hear about an alert of the given kind.
     */
    public function wants(AlertType $type, bool $resolved): bool
    {
        return (bool) $this->{$type->preference()} && (! $resolved || $this->notify_recovery);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
