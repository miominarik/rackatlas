<?php

namespace App\Models;

use Database\Factories\ServerServiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A systemd service of a server, as the agent last reported it.
 *
 * @property int $id
 * @property int $server_id
 * @property string $unit
 * @property string|null $description
 * @property string $active_state active, activating, reloading, inactive, deactivating or failed
 * @property string|null $sub_state running, exited, dead, ...
 * @property string|null $unit_file_state enabled, disabled, static, masked, ...
 * @property string|null $journal The journal of the unit, sent by the agent when someone asked for it
 * @property Carbon|null $journal_updated_at When the agent sent it
 * @property Carbon|null $journal_requested_at When someone asked for a new one, until the agent answers
 */
#[Fillable(['server_id', 'unit', 'description', 'active_state', 'sub_state', 'unit_file_state', 'journal', 'journal_updated_at', 'journal_requested_at'])]
class ServerService extends Model
{
    /** @use HasFactory<ServerServiceFactory> */
    use HasFactory;

    public const FAILED = 'failed';

    public const RUNNING = 'running';

    public const STOPPED = 'stopped';

    public const DISABLED = 'disabled';

    /** How long the agent has to answer a request for the journal before it counts as lost. */
    public const JOURNAL_REQUEST_MINUTES = 10;

    /** From the most urgent to the least. */
    public const STATUSES = [self::FAILED, self::RUNNING, self::STOPPED, self::DISABLED];

    protected function casts(): array
    {
        return [
            'journal_updated_at' => 'datetime',
            'journal_requested_at' => 'datetime',
        ];
    }

    /**
     * What the owner wants to know: is it running, stopped (should run, but does not), switched off or crashed.
     */
    public function status(): string
    {
        if ($this->active_state === 'failed') {
            return self::FAILED;
        }

        if (in_array($this->active_state, ['active', 'activating', 'reloading'], true)) {
            return self::RUNNING;
        }

        return in_array($this->unit_file_state, ['disabled', 'masked'], true) ? self::DISABLED : self::STOPPED;
    }

    /**
     * Whether the agent is still expected to send the journal that was asked for.
     */
    public function journalIsPending(): bool
    {
        return $this->journal_requested_at !== null
            && $this->journal_requested_at->gt(now()->subMinutes(self::JOURNAL_REQUEST_MINUTES));
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
