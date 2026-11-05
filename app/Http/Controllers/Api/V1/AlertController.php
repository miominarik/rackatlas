<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\V1\AlertResource;
use App\Models\ServerAlert;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class AlertController extends ApiController
{
    /** The newest alerts returned at most. */
    private const LIMIT = 500;

    /**
     * Problems of the servers of the team. Open ones by default.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'status' => ['nullable', Rule::in(['open', 'resolved', 'all'])],
            'server_id' => ['nullable', 'integer'],
        ]);

        $alerts = ServerAlert::query()
            ->whereIn('server_id', $this->team($request)->servers()->select('id'))
            ->when($filters['server_id'] ?? null, fn ($query, $id) => $query->where('server_id', $id))
            ->when(($filters['status'] ?? 'open') === 'open', fn ($query) => $query->whereNull('resolved_at'))
            ->when(($filters['status'] ?? null) === 'resolved', fn ($query) => $query->whereNotNull('resolved_at'))
            ->with('server:id,name')
            ->latest('opened_at')
            ->limit(self::LIMIT)
            ->get();

        return AlertResource::collection($alerts);
    }
}
