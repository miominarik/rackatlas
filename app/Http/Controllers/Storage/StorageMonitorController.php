<?php

namespace App\Http\Controllers\Storage;

use App\Http\Controllers\Controller;
use App\Http\Requests\Storage\StorageMonitorRequest;
use App\Jobs\CheckStorageMonitor;
use App\Models\StorageCheck;
use App\Models\StorageMonitor;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Inertia\Inertia;
use Inertia\Response;

class StorageMonitorController extends Controller
{
    /** Range of the charts in seconds and the size of one point in seconds. */
    private const RANGES = [
        '24h' => [86400, 300],
        '7d' => [604800, 3600],
        '30d' => [2592000, 21600],
    ];

    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        return Inertia::render('storage/index', [
            'team' => $team?->only('id', 'name'),
            'canManage' => $team !== null && $request->user()->can('manage', $team),
            'monitors' => $team
                ? $team->storageMonitors()->orderBy('name')->get()->map(fn (StorageMonitor $monitor) => $this->present($monitor))
                : [],
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function create(Request $request): Response|RedirectResponse
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return $this->needsTeam();
        }

        $this->authorize('manage', $team);

        return Inertia::render('storage/form', ['monitor' => null]);
    }

    public function store(StorageMonitorRequest $request): RedirectResponse
    {
        $monitor = $request->team()->storageMonitors()->create($request->validated());

        // A big container takes longer than a web request may, so the first check runs in the queue.
        CheckStorageMonitor::dispatch($monitor);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Storage added.')]);

        return to_route('storage.show', $monitor);
    }

    public function show(Request $request, StorageMonitor $monitor): Response
    {
        $this->authorize('view', $monitor->team);

        $range = array_key_exists($request->query('range'), self::RANGES) ? $request->query('range') : '24h';
        [$length, $bucket] = self::RANGES[$range];

        $checks = $monitor->checks()
            ->where('checked_at', '>=', now()->subSeconds($length))
            ->orderBy('checked_at')
            ->get(['checked_at', 'ok', 'response_ms', 'blob_count', 'total_bytes']);

        return Inertia::render('storage/show', [
            'monitor' => [
                ...$this->present($monitor),
                'last_ok_at' => $monitor->last_ok_at?->toIso8601String(),
                'token_expires_at' => $monitor->tokenExpiresAt()?->toIso8601String(),
                'created_at' => $monitor->created_at?->toIso8601String(),
            ],
            'canManage' => $request->user()->can('manage', $monitor->team),
            'range' => $range,
            'bucket_seconds' => $bucket,
            'from' => now()->subSeconds($length)->timestamp,
            'to' => now()->timestamp,
            'points' => $this->points($checks, $bucket),
            'availability' => $checks->isEmpty() ? null : round($checks->where('ok', true)->count() / $checks->count() * 100, 2),
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    public function edit(StorageMonitor $monitor): Response
    {
        $this->authorize('manage', $monitor->team);

        return Inertia::render('storage/form', [
            'monitor' => $monitor->only('id', 'name', 'account', 'container', 'check_interval'),
        ]);
    }

    public function update(StorageMonitorRequest $request, StorageMonitor $monitor): RedirectResponse
    {
        $data = $request->validated();

        if (empty($data['sas_token'])) {
            unset($data['sas_token']);
        }

        $monitor->update($data);

        CheckStorageMonitor::dispatch($monitor);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Storage updated.')]);

        return to_route('storage.show', $monitor);
    }

    /**
     * Check now instead of waiting for the next scheduled check.
     */
    public function check(StorageMonitor $monitor): RedirectResponse
    {
        $this->authorize('manage', $monitor->team);

        CheckStorageMonitor::dispatch($monitor);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('The check was started, the result appears in a moment.')]);

        return back();
    }

    public function destroy(StorageMonitor $monitor): RedirectResponse
    {
        $this->authorize('manage', $monitor->team);

        $monitor->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Storage deleted.')]);

        return to_route('storage.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(StorageMonitor $monitor): array
    {
        return [
            'id' => $monitor->id,
            'name' => $monitor->name,
            'account' => $monitor->account,
            'container' => $monitor->container,
            'status' => $monitor->status,
            'last_checked_at' => $monitor->last_checked_at?->toIso8601String(),
            'last_error' => $monitor->last_error,
            'blob_count' => $monitor->blob_count,
            'total_bytes' => $monitor->total_bytes,
            'is_partial' => $monitor->is_partial,
            'response_ms' => $monitor->response_ms,
            'check_interval' => $monitor->check_interval,
        ];
    }

    private function needsTeam(): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'error', 'message' => __('Create a team first, servers belong to a team.')]);

        return to_route('teams.index');
    }

    /**
     * The checks reduced to points of a fixed size, so a month is as light as a day.
     *
     * @param  Collection<int, StorageCheck>  $checks
     * @return array<int, array<string, int|bool|null>>
     */
    private function points(Collection $checks, int $bucket): array
    {
        return $checks
            ->groupBy(fn (StorageCheck $check) => intdiv($check->checked_at->timestamp, $bucket) * $bucket)
            ->map(function (Collection $group, int $time) {
                $good = $group->where('ok', true);

                return [
                    't' => $time,
                    'ok' => $good->count() === $group->count(),
                    'response_ms' => $good->isEmpty() ? null : (int) round($good->avg('response_ms')),
                    'blob_count' => $good->isEmpty() ? null : (int) $good->last()->blob_count,
                    'total_bytes' => $good->isEmpty() ? null : (int) $good->last()->total_bytes,
                ];
            })
            ->values()
            ->all();
    }
}
