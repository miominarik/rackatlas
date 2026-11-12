<?php

namespace App\Models;

use Database\Factories\DockerContainerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A Docker container of a server, as the agent (or the SSH collector) last saw it.
 *
 * @property int $id
 * @property int $server_id
 * @property string $container_id
 * @property string $name
 * @property string $image
 * @property string $state running, exited, restarting, paused, created, removing or dead
 * @property string|null $status Docker's own wording, for example "Up 2 hours (healthy)"
 * @property string|null $ports
 * @property float|null $cpu_percent
 * @property int|null $memory_bytes
 * @property int|null $memory_limit_bytes
 * @property string|null $pending_action start, stop or restart that somebody asked for
 * @property Carbon|null $action_requested_at
 * @property Carbon|null $action_sent_at When the agent was told to do it
 * @property string|null $action_result What the agent answered, shown when the action failed
 * @property string|null $logs
 * @property Carbon|null $logs_updated_at
 * @property Carbon|null $logs_requested_at
 */
#[Fillable(['server_id', 'container_id', 'name', 'image', 'state', 'status', 'ports', 'cpu_percent', 'memory_bytes', 'memory_limit_bytes', 'pending_action', 'action_requested_at', 'action_sent_at', 'action_result', 'logs', 'logs_updated_at', 'logs_requested_at'])]
class DockerContainer extends Model
{
    /** @use HasFactory<DockerContainerFactory> */
    use HasFactory;

    public const ACTIONS = ['start', 'stop', 'restart'];

    /** How long the agent has to carry out a request before it counts as lost. */
    public const REQUEST_MINUTES = 10;

    protected function casts(): array
    {
        return [
            'cpu_percent' => 'float',
            'memory_bytes' => 'integer',
            'memory_limit_bytes' => 'integer',
            'action_requested_at' => 'datetime',
            'action_sent_at' => 'datetime',
            'logs_updated_at' => 'datetime',
            'logs_requested_at' => 'datetime',
        ];
    }

    public function actionIsPending(): bool
    {
        return $this->pending_action !== null
            && $this->action_requested_at?->gt(now()->subMinutes(self::REQUEST_MINUTES)) === true;
    }

    public function logsArePending(): bool
    {
        return $this->logs_requested_at?->gt(now()->subMinutes(self::REQUEST_MINUTES)) === true;
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
