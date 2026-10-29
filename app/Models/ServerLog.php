<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $server_id
 * @property string $level
 * @property string $source
 * @property string $message
 * @property int $count
 * @property \Illuminate\Support\Carbon $occurred_at
 */
#[Fillable(['server_id', 'level', 'source', 'message', 'count', 'occurred_at'])]
class ServerLog extends Model
{
    use Prunable;

    public const RETENTION_DAYS = 14;

    public const LEVELS = ['critical', 'error'];

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }

    public function prunable(): Builder
    {
        return static::where('occurred_at', '<', now()->subDays(self::RETENTION_DAYS));
    }
}
