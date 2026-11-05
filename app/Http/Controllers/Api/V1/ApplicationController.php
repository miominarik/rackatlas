<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\V1\ServiceResource;
use App\Models\ServerService;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class ApplicationController extends ApiController
{
    /**
     * The systemd services of the servers of the team, optionally of one server or in one state.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $filters = $request->validate([
            'server_id' => ['nullable', 'integer'],
            'status' => ['nullable', Rule::in(ServerService::STATUSES)],
        ]);

        $services = ServerService::query()
            ->whereIn('server_id', $this->team($request)->servers()->select('id'))
            ->when($filters['server_id'] ?? null, fn ($query, $id) => $query->where('server_id', $id))
            ->with('server:id,name')
            ->orderBy('server_id')
            ->orderBy('unit')
            ->get()
            ->when($filters['status'] ?? null, fn ($all, $status) => $all->filter(fn (ServerService $service) => $service->status() === $status))
            ->values();

        return ServiceResource::collection($services);
    }
}
