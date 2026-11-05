<?php

namespace App\Http\Resources\V1;

use App\Models\ServerMetric;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ServerMetric
 */
class MetricResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'collected_at' => $this->collected_at->toIso8601String(),
            'cpu_percent' => (float) $this->cpu_percent,
            'cpu_cores' => $this->cpu_cores,
            'load_1' => (float) $this->load_1,
            'load_5' => (float) $this->load_5,
            'load_15' => (float) $this->load_15,
            'memory_total_bytes' => $this->memory_total,
            'memory_used_bytes' => $this->memory_used,
            'memory_percent' => $this->memory_total > 0 ? round($this->memory_used / $this->memory_total * 100, 1) : null,
            'swap_total_bytes' => $this->swap_total,
            'swap_used_bytes' => $this->swap_used,
            'uptime_seconds' => $this->uptime_seconds,
            'net_rx_bps' => $this->net_rx_bps,
            'net_tx_bps' => $this->net_tx_bps,
            'disks' => $this->whenLoaded('disks', fn () => $this->disks->map(fn ($disk) => [
                'mount' => $disk->mount,
                'device' => $disk->device,
                'filesystem' => $disk->filesystem,
                'total_bytes' => $disk->total_bytes,
                'used_bytes' => $disk->used_bytes,
                'used_percent' => $disk->usedPercent(),
            ])->values()),
        ];
    }
}
