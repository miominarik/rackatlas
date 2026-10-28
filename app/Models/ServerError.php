<?php

namespace App\Models;

use App\Enums\ServerErrorType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Prunable;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * @property int $id
 * @property int $server_id
 * @property ServerErrorType $type
 * @property string $message
 * @property array<string, mixed>|null $context
 * @property \Illuminate\Support\Carbon $occurred_at
 */
#[Fillable(['server_id', 'type', 'message', 'context', 'occurred_at'])]
class ServerError extends Model
{
    use Prunable;

    public const RETENTION_DAYS = 90;

    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'type' => ServerErrorType::class,
            'context' => 'array',
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
