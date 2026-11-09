<?php

namespace App\Http\Controllers;

use App\Jobs\CollectRedisMetrics;
use App\Models\SentinelGroup;
use App\Services\Redis\RedisMetricsCollector;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use RuntimeException;

class RedisSwitchoverController extends Controller
{
    /**
     * Switch the master of a Sentinel group to a replica. The checks that make it safe are in the collector.
     */
    public function __invoke(SentinelGroup $group, RedisMetricsCollector $redis): RedirectResponse
    {
        $this->authorize('permit', [$group->team, 'redis.edit']);

        try {
            $redis->switchover($group);
        } catch (RuntimeException $e) {
            Inertia::flash('toast', ['type' => 'error', 'message' => $e->getMessage()]);

            return back();
        }

        // The switch takes a few seconds, so the state is read again a little later.
        foreach ($group->servers()->redisFamily()->get() as $server) {
            CollectRedisMetrics::dispatch($server)->delay(now()->addSeconds(10));
        }

        Inertia::flash('toast', ['type' => 'success', 'message' => __('The switch was started. The new master shows up in a few seconds.')]);

        return back();
    }
}
