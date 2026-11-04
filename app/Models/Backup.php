<?php

namespace App\Models;

use Database\Factories\BackupFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;
use Illuminate\Support\Str;
use Spatie\Activitylog\Models\Concerns\LogsActivity;
use Spatie\Activitylog\Support\LogOptions;

/**
 * @property int $id
 * @property int $team_id
 * @property int|null $server_id
 * @property string $name
 * @property string|null $notes
 * @property bool $is_active
 * @property string $token
 * @property int|null $expected_interval_hours
 * @property Carbon|null $last_run_at
 * @property string|null $last_status
 * @property string|null $last_message
 * @property int|null $last_size_bytes
 * @property Carbon|null $resumed_at
 * @property Carbon|null $alerted_at
 */
#[Fillable(['team_id', 'server_id', 'name', 'notes', 'is_active', 'expected_interval_hours'])]
#[Hidden(['token'])]
class Backup extends Model
{
    /** @use HasFactory<BackupFactory> */
    use HasFactory;

    use LogsActivity;

    public const STATUSES = ['success', 'failed'];

    protected static function booted(): void
    {
        static::creating(function (Backup $backup) {
            $backup->token ??= self::newToken();
        });
    }

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'last_run_at' => 'datetime',
            'resumed_at' => 'datetime',
            'alerted_at' => 'datetime',
        ];
    }

    public static function newToken(): string
    {
        return Str::random(48);
    }

    public function team(): BelongsTo
    {
        return $this->belongsTo(Team::class);
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    /**
     * Backups that are switched on.
     *
     * @param  Builder<Backup>  $query
     */
    public function scopeActive(Builder $query): void
    {
        $query->where('is_active', true);
    }

    /**
     * No run reported within the expected interval (plus a one hour grace period). A paused
     * backup is never overdue, and a resumed one is counted from the moment it was resumed.
     */
    public function isOverdue(): bool
    {
        if (! $this->is_active || $this->expected_interval_hours === null) {
            return false;
        }

        $since = collect([$this->last_run_at ?? $this->created_at, $this->resumed_at])->filter()->max();

        return $since->copy()->addHours($this->expected_interval_hours + 1)->isPast();
    }

    public function getActivitylogOptions(): LogOptions
    {
        return LogOptions::defaults()
            ->useLogName('backup')
            ->logOnly(['name', 'server_id', 'is_active', 'expected_interval_hours', 'team_id'])
            ->logOnlyDirty()
            ->dontLogEmptyChanges();
    }
}
