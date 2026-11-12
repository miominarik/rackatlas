<?php

namespace App\Services\Docker;

use App\Models\DockerContainer;
use App\Models\Server;

/**
 * Keeps the containers of a server in step with the Docker sections of a report. The agent and the SSH
 * collector produce the same sections:
 *
 * - DOCKER: one container per line, `id|name|image|state|status|ports` (docker ps -a). Present only when docker answered.
 * - DOCKER_STATS: `id|cpu%|used / limit` of the running containers (docker stats --no-stream).
 * - DOCKER_ERROR: why docker could not be read.
 * - DOCKER_RESULT: `id|action|ok or fail|message` of the actions the agent carried out since the last report.
 */
class DockerSync
{
    private const MAX_CONTAINERS = 300;

    private const ID_PATTERN = '/^[a-f0-9]{12,64}$/';

    private const STATES = ['created', 'running', 'paused', 'restarting', 'removing', 'exited', 'dead'];

    /**
     * @param  array<string, string>  $sections
     */
    public function sync(Server $server, array $sections): void
    {
        if (isset($sections['DOCKER_ERROR'])) {
            $server->forceFill([
                'docker_error' => mb_substr(trim($sections['DOCKER_ERROR']), 0, 500) ?: 'Docker could not be read.',
                'docker_checked_at' => now(),
            ])->save();

            return;
        }

        if (! isset($sections['DOCKER'])) {
            return;
        }

        $containers = $this->parseContainers($sections['DOCKER']);
        $stats = $this->parseStats($sections['DOCKER_STATS'] ?? '');

        foreach ($containers as $id => $container) {
            $containers[$id] = [...$container, ...($stats[$id] ?? ['cpu_percent' => null, 'memory_bytes' => null, 'memory_limit_bytes' => null])];
        }

        $known = $server->dockerContainers()->get()->keyBy('container_id');

        foreach ($containers as $id => $data) {
            $container = $known->get($id) ?? new DockerContainer(['server_id' => $server->id, 'container_id' => $id]);
            $container->fill($data);

            // The report came after the agent was told to act, so the answer is in it.
            if ($container->pending_action !== null && $container->action_sent_at !== null) {
                $container->fill(['pending_action' => null, 'action_requested_at' => null, 'action_sent_at' => null]);
            }

            $container->save();
        }

        $server->dockerContainers()->whereNotIn('container_id', array_keys($containers))->delete();

        $this->applyResults($server, $sections['DOCKER_RESULT'] ?? '');

        $server->forceFill(['docker_error' => null, 'docker_checked_at' => now()])->save();
    }

    /**
     * @return array<string, array<string, mixed>> keyed by container id
     */
    public function parseContainers(string $section): array
    {
        $containers = [];

        foreach (preg_split('/\r\n|\n|\r/', $section) as $line) {
            $parts = explode('|', trim($line), 6);

            if (count($parts) < 5 || preg_match(self::ID_PATTERN, $parts[0]) !== 1) {
                continue;
            }

            $containers[$parts[0]] = [
                'name' => mb_substr($parts[1], 0, 255),
                'image' => mb_substr($parts[2], 0, 500),
                'state' => in_array($parts[3], self::STATES, true) ? $parts[3] : 'dead',
                'status' => mb_substr($parts[4], 0, 255) ?: null,
                'ports' => isset($parts[5]) && trim($parts[5]) !== '' ? mb_substr(trim($parts[5]), 0, 1000) : null,
            ];

            if (count($containers) >= self::MAX_CONTAINERS) {
                break;
            }
        }

        return $containers;
    }

    /**
     * @return array<string, array{cpu_percent: float|null, memory_bytes: int|null, memory_limit_bytes: int|null}>
     */
    public function parseStats(string $section): array
    {
        $stats = [];

        foreach (preg_split('/\r\n|\n|\r/', $section) as $line) {
            $parts = explode('|', trim($line), 3);

            if (count($parts) < 3 || preg_match(self::ID_PATTERN, $parts[0]) !== 1) {
                continue;
            }

            [$used, $limit] = array_pad(explode('/', $parts[2], 2), 2, '');

            $stats[$parts[0]] = [
                'cpu_percent' => is_numeric(rtrim($parts[1], '%')) ? (float) rtrim($parts[1], '%') : null,
                'memory_bytes' => $this->bytes($used),
                'memory_limit_bytes' => $this->bytes($limit),
            ];
        }

        return $stats;
    }

    /**
     * "12.5MiB" or "1.943GiB" as bytes, null when Docker printed something else.
     */
    public function bytes(string $value): ?int
    {
        if (preg_match('/^\s*([0-9.]+)\s*([KMGT]?i?B)\s*$/i', $value, $match) !== 1) {
            return null;
        }

        $power = ['B' => 0, 'K' => 1, 'M' => 2, 'G' => 3, 'T' => 4][strtoupper($match[2][0])];
        $base = str_contains(strtolower($match[2]), 'i') ? 1024 : 1000;

        return (int) round((float) $match[1] * ($base ** $power));
    }

    /**
     * The answer of the agent to the actions it carried out: stored when one failed, so the page can tell.
     */
    private function applyResults(Server $server, string $section): void
    {
        foreach (preg_split('/\r\n|\n|\r/', $section) as $line) {
            $parts = explode('|', trim($line), 4);

            if (count($parts) < 3 || preg_match(self::ID_PATTERN, $parts[0]) !== 1) {
                continue;
            }

            $server->dockerContainers()->where('container_id', $parts[0])->update([
                'action_result' => $parts[2] === 'ok' ? null : mb_substr(($parts[1] ?? '').': '.($parts[3] ?? 'failed'), 0, 500),
            ]);
        }
    }
}
