<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Resources\V1\ServerResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ServerController extends ApiController
{
    /**
     * The servers of the team with their latest sample.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $servers = $this->team($request)->servers()
            ->with(['category', 'latestMetric.disks'])
            ->orderBy('name')
            ->get();

        return ServerResource::collection($servers);
    }

    public function show(Request $request, int $server): ServerResource
    {
        return new ServerResource($this->server($request, $server)->load(['category', 'latestMetric.disks']));
    }
}
