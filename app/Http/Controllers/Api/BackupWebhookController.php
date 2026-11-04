<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Backup;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class BackupWebhookController extends Controller
{
    /**
     * Called by the backup script when it finishes. Optional: status (success|failed), message, size (bytes).
     */
    public function __invoke(Request $request, string $token): JsonResponse
    {
        $backup = Backup::query()->where('token', $token)->firstOrFail();

        $data = $request->validate([
            'status' => ['nullable', 'string', 'in:'.implode(',', Backup::STATUSES)],
            'message' => ['nullable', 'string'],
            'size' => ['nullable', 'integer', 'min:0'],
        ]);

        $backup->forceFill([
            'last_run_at' => now(),
            'last_status' => $data['status'] ?? 'success',
            'last_message' => isset($data['message']) ? Str::limit($data['message'], 500, '') : null,
            'last_size_bytes' => $data['size'] ?? null,
        ])->save();

        return response()->json(['ok' => true, 'last_run_at' => $backup->last_run_at->toIso8601String()]);
    }
}
