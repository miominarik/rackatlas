<?php

namespace App\Support;

/**
 * The layout and thresholds of a user's dashboard. Saved settings are always merged
 * into the defaults, so a new option never breaks an old saved layout.
 */
class DashboardSettings
{
    public const WIDGETS = ['summary', 'problems', 'servers', 'top', 'errors'];

    public const SORTS = ['name', 'status', 'cpu', 'ram', 'disk'];

    public const DENSITIES = ['comfortable', 'compact'];

    public const METRICS = ['cpu', 'ram', 'disk', 'load', 'uptime'];

    public const REFRESH_SECONDS = [0, 15, 30, 60];

    /**
     * @return array<string, mixed>
     */
    public static function defaults(): array
    {
        return [
            'widgets' => array_map(fn (string $id) => ['id' => $id, 'visible' => true], self::WIDGETS),
            'servers' => [
                'sort' => 'status',
                'density' => 'comfortable',
                'group_by_category' => false,
                'metrics' => self::METRICS,
                'show_history' => true,
            ],
            'thresholds' => [
                'cpu' => ['warn' => 80, 'critical' => 95],
                'ram' => ['warn' => 85, 'critical' => 95],
                'disk' => ['warn' => 85, 'critical' => 95],
            ],
            'refresh_seconds' => 30,
        ];
    }

    /**
     * Merge saved settings into the defaults and drop anything that is not valid.
     *
     * @param  array<string, mixed>|null  $saved
     * @return array<string, mixed>
     */
    public static function resolve(?array $saved): array
    {
        $defaults = self::defaults();
        $saved ??= [];

        $widgets = [];
        foreach ($saved['widgets'] ?? [] as $widget) {
            $id = $widget['id'] ?? null;

            if (in_array($id, self::WIDGETS, true) && ! isset($widgets[$id])) {
                $widgets[$id] = ['id' => $id, 'visible' => (bool) ($widget['visible'] ?? true)];
            }
        }
        foreach (self::WIDGETS as $id) {
            $widgets[$id] ??= ['id' => $id, 'visible' => true];
        }

        $servers = array_replace($defaults['servers'], array_intersect_key($saved['servers'] ?? [], $defaults['servers']));
        $servers['metrics'] = array_values(array_intersect(self::METRICS, (array) $servers['metrics']));

        $thresholds = $defaults['thresholds'];
        foreach ($thresholds as $key => $pair) {
            foreach (['warn', 'critical'] as $level) {
                $value = $saved['thresholds'][$key][$level] ?? null;

                if (is_numeric($value)) {
                    $thresholds[$key][$level] = (int) $value;
                }
            }
        }

        return [
            'widgets' => array_values($widgets),
            'servers' => $servers,
            'thresholds' => $thresholds,
            'refresh_seconds' => in_array($saved['refresh_seconds'] ?? null, self::REFRESH_SECONDS, true)
                ? $saved['refresh_seconds']
                : $defaults['refresh_seconds'],
        ];
    }
}
