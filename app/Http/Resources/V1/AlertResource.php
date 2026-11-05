<?php

namespace App\Http\Resources\V1;

use App\Models\ServerAlert;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServerAlert
 */
class AlertResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'server_id' => $this->server_id,
            'server_name' => $this->whenLoaded('server', fn () => $this->server->name),
            'type' => $this->type->value,
            'key' => $this->key,
            'context' => $this->context,
            'opened_at' => $this->opened_at->toIso8601String(),
            'resolved_at' => $this->resolved_at?->toIso8601String(),
            'open' => $this->resolved_at === null,
        ];
    }
}
