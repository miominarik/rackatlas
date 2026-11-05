<?php

namespace App\Http\Resources\V1;

use App\Models\Server;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Server
 */
class ServerResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'category' => $this->whenLoaded('category', fn () => $this->category?->name),
            'provider' => $this->provider,
            'country' => $this->country,
            'host' => $this->host,
            'status' => $this->status->value,
            'agent_version' => $this->agent_version,
            'system_info' => $this->system_info,
            'last_seen_at' => $this->last_seen_at?->toIso8601String(),
            'last_checked_at' => $this->last_checked_at?->toIso8601String(),
            'current' => $this->whenLoaded('latestMetric', fn () => $this->latestMetric
                ? new MetricResource($this->latestMetric)
                : null),
        ];
    }
}
