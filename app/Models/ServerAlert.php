<?php

namespace App\Models;

use App\Enums\AlertType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * A problem of a server that was reported and is still open until `resolved_at` is set.
 *
 * @property int $id
 * @property int $server_id
 * @property AlertType $type
 * @property string $key
 * @property array<string, mixed>|null $context
 * @property Carbon $opened_at
 * @property Carbon|null $resolved_at
 */
#[Fillable(['server_id', 'type', 'key', 'context', 'opened_at', 'resolved_at'])]
class ServerAlert extends Model
{
    public $timestamps = false;

    protected function casts(): array
    {
        return [
            'type' => AlertType::class,
            'context' => 'array',
            'opened_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }

    public function server(): BelongsTo
    {
        return $this->belongsTo(Server::class);
    }
}
