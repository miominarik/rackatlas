<?php

namespace App\Services\Ssh;

use App\Models\Server;

/**
 * Keeps the list of systemd services of a server in step with the SERVICES section of the agent report:
 * one service per line, `unit|active|sub|unit file state|description`.
 */
class ServiceSync
{
    private const MAX_SERVICES = 400;

    private const UNIT_PATTERN = '/^[A-Za-z0-9][A-Za-z0-9:_.@\\\\-]*\.service$/';

    /**
     * @return array<string, array<string, string|null>> keyed by unit
     */
    public function parseServices(string $section): array
    {
        $services = [];

        foreach (preg_split('/\r\n|\n|\r/', $section) as $line) {
            $parts = explode('|', trim($line), 5);

            if (count($parts) < 4 || preg_match(self::UNIT_PATTERN, $parts[0]) !== 1) {
                continue;
            }

            $services[$parts[0]] = [
                'unit' => mb_substr($parts[0], 0, 150),
                'active_state' => mb_substr($parts[1], 0, 20),
                'sub_state' => mb_substr($parts[2], 0, 30) ?: null,
                'unit_file_state' => mb_substr($parts[3], 0, 30) ?: null,
                'description' => isset($parts[4]) && trim($parts[4]) !== '' ? mb_substr(trim($parts[4]), 0, 255) : null,
            ];

            if (count($services) >= self::MAX_SERVICES) {
                break;
            }
        }

        return $services;
    }

    /**
     * The list is replaced by what the agent saw now. A journal the agent sent earlier stays with its service.
     */
    public function sync(Server $server, string $servicesSection): void
    {
        $services = $this->parseServices($servicesSection);

        // An empty list means systemctl failed, not that the server has no services.
        if ($services === []) {
            return;
        }

        $known = $server->services()
            ->get(['id', 'unit', 'description', 'active_state', 'sub_state', 'unit_file_state'])
            ->keyBy('unit');

        $server->services()->whereNotIn('unit', array_keys($services))->delete();

        foreach ($services as $unit => $attributes) {
            $existing = $known->get($unit);

            if ($existing === null) {
                $server->services()->create($attributes);
            } elseif ($existing->fill($attributes)->isDirty()) {
                $existing->save();
            }
        }
    }
}
