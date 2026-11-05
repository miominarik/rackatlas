<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Requests\Api\V1\MetricSeriesRequest;
use App\Services\Api\MetricSeries;
use Illuminate\Http\JsonResponse;

class ServerMetricController extends ApiController
{
    /**
     * CPU, memory, load and network of one server, one row per time bucket.
     */
    public function index(MetricSeriesRequest $request, MetricSeries $series, int $server): JsonResponse
    {
        $server = $this->server($request, $server);

        return $this->respond($request, $series->points($server, $request->from(), $request->to(), $request->bucket()));
    }

    /**
     * Disk usage of one server, one row per mount point and time bucket.
     */
    public function disks(MetricSeriesRequest $request, MetricSeries $series, int $server): JsonResponse
    {
        $server = $this->server($request, $server);

        return $this->respond($request, $series->disks($server, $request->from(), $request->to(), $request->bucket()));
    }

    /**
     * @param  array<int, array<string, mixed>>  $rows
     */
    private function respond(MetricSeriesRequest $request, array $rows): JsonResponse
    {
        return response()->json([
            'data' => $rows,
            'meta' => [
                'from' => $request->from()->toIso8601String(),
                'to' => $request->to()->toIso8601String(),
                'interval_seconds' => $request->bucket(),
            ],
        ]);
    }
}
