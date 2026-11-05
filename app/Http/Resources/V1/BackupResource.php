<?php

namespace App\Http\Resources\V1;

use App\Models\Backup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Backup
 */
class BackupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'server_id' => $this->server_id,
            'server_name' => $this->whenLoaded('server', fn () => $this->server?->name),
            'is_active' => $this->is_active,
            'expected_interval_hours' => $this->expected_interval_hours,
            'last_run_at' => $this->last_run_at?->toIso8601String(),
            'last_status' => $this->last_status,
            'last_message' => $this->last_message,
            'last_size_bytes' => $this->last_size_bytes,
            'overdue' => $this->isOverdue(),
        ];
    }
}
