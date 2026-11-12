<?php

namespace App\Services\Docker;

use App\Exceptions\MetricsCollectionException;
use App\Models\DockerContainer;
use App\Models\Server;
use App\Services\Ssh\MetricsParser;
use App\Services\Ssh\ServerMetricsCollector;
use InvalidArgumentException;
use Throwable;

/**
 * Docker on a server the app logs into over SSH: reads the containers, carries out start, stop and restart,
 * and fetches the logs, all at once. The login user must be allowed to use docker.
 */
class DockerSsh
{
    private const READ_SCRIPT = <<<'SH'
if ! command -v docker >/dev/null 2>&1; then
  echo '###DOCKER_ERROR'; echo 'Docker is not installed on this server.'; exit 0
fi
out="$(docker ps -a --format '{{.ID}}|{{.Names}}|{{.Image}}|{{.State}}|{{.Status}}|{{.Ports}}' 2>&1)" || {
  echo '###DOCKER_ERROR'; printf '%s\n' "$out" | head -n 3; exit 0
}
echo '###DOCKER'; printf '%s\n' "$out"
echo '###DOCKER_STATS'
docker stats --no-stream --format '{{.ID}}|{{.CPUPerc}}|{{.MemUsage}}' 2>/dev/null
SH;

    public function __construct(
        private readonly ServerMetricsCollector $ssh,
        private readonly MetricsParser $parser,
        private readonly DockerSync $sync,
    ) {}

    /**
     * Read the containers and store them. A failure is kept on the server so the page can show it.
     */
    public function collect(Server $server): void
    {
        try {
            $output = $this->exec($server, 'sh -c '.escapeshellarg(self::READ_SCRIPT));
        } catch (Throwable $e) {
            $server->forceFill(['docker_error' => mb_substr($e->getMessage(), 0, 500), 'docker_checked_at' => now()])->save();

            return;
        }

        $this->sync->sync($server, $this->parser->sections($output));
    }

    /**
     * Start, stop or restart one container. Returns the error text, or null when it worked.
     */
    public function act(DockerContainer $container, string $action): ?string
    {
        $command = match ($action) {
            'start' => 'docker start',
            'stop' => 'docker stop -t 8',
            'restart' => 'docker restart -t 8',
            default => throw new InvalidArgumentException('Unknown action.'),
        };

        try {
            $output = $this->exec($container->server, $command.' '.escapeshellarg($container->container_id).' 2>&1; echo "###EXIT $?"');
        } catch (Throwable $e) {
            return mb_substr($e->getMessage(), 0, 500);
        }

        if (preg_match('/###EXIT (\d+)\s*$/', $output, $match) === 1 && $match[1] === '0') {
            return null;
        }

        return mb_substr(trim(preg_replace('/###EXIT \d+\s*$/', '', $output) ?? ''), 0, 500) ?: 'The command failed.';
    }

    /**
     * The end of the log of one container.
     *
     * @throws MetricsCollectionException
     */
    public function logs(DockerContainer $container): string
    {
        $output = $this->exec(
            $container->server,
            'docker logs --tail 500 --timestamps '.escapeshellarg($container->container_id).' 2>&1 | tail -c 400000',
        );

        return mb_convert_encoding($output, 'UTF-8', 'UTF-8');
    }

    /**
     * @throws MetricsCollectionException
     */
    private function exec(Server $server, string $command): string
    {
        $ssh = $this->ssh->connect($server);

        try {
            $output = $ssh->exec($command);
        } finally {
            $ssh->disconnect();
        }

        return is_string($output) ? $output : '';
    }
}
