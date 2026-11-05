<?php

namespace App\Http\Resources\V1;

use App\Models\ServerService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServerService
 */
class ServiceResource extends JsonResource
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
            'unit' => $this->unit,
            'description' => $this->description,
            'status' => $this->status(),
            'active_state' => $this->active_state,
            'sub_state' => $this->sub_state,
            'unit_file_state' => $this->unit_file_state,
        ];
    }
}
