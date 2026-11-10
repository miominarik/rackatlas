<?php

namespace App\Services\Redis;

use App\Enums\ServerErrorType;
use App\Enums\ServerStatus;
use App\Models\RedisMetric;
use App\Models\Server;
use App\Services\Ssh\PublicHost;
use InvalidArgumentException;
use Predis\Client;
use Predis\Connection\ConnectionException;
use RuntimeException;
use Throwable;

class RedisMetricsCollector
{
    private const CONNECT_TIMEOUT = 8;

    public function __construct(private RedisParser $parser = new RedisParser) {}

    /**
     * Read the status of one Redis server (and its cluster, when it is a cluster node) and store it.
     * A failure is written to the server errors and the server is marked offline.
     */
    public function collect(Server $server): ?RedisMetric
    {
        try {
            $data = $this->read($server);
        } catch (Throwable $e) {
            $this->recordError($server, $e);

            return null;
        }

        $metric = $server->redisMetrics()->create([
            ...$data,
            'commands_per_second' => $this->commandsPerSecond($server, $data),
            'collected_at' => now(),
        ]);

        $server->forceFill([
            'status' => ServerStatus::Online,
            'last_checked_at' => now(),
            'last_seen_at' => now(),
        ])->save();

        return $metric;
    }

    /**
     * Check that the details log in, without storing anything.
     *
     * @return array{success: bool, message: string}
     */
    public function test(string $host, int $port, ?string $username, ?string $password): array
    {
        try {
            $info = $this->parseInfo($this->command($this->connect($host, $port, $username, $password), ['INFO', 'server']));
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $this->describe($e, $host, $port)];
        }

        return ['success' => true, 'message' => __('Connection successful.').' Redis '.($info['redis_version'] ?? '?')];
    }

    /**
     * @return array<string, mixed>
     */
    private function read(Server $server): array
    {
        $client = $this->connect($server->host, $server->port, $server->username, $server->password);

        $info = $this->parseInfo($this->command($client, ['INFO', 'everything']));

        $maxClients = (int) ($info['maxclients'] ?? 0);

        if ($maxClients === 0) {
            $error = false;
            $config = $client->executeRaw(['CONFIG', 'GET', 'maxclients'], $error);
            $maxClients = ! $error && is_array($config) ? (int) ($config[1] ?? 0) : 0;
        }

        $data = $this->parser->metric($info, $maxClients);

        if (($info['cluster_enabled'] ?? '0') === '1') {
            $data['cluster'] = $this->parser->cluster(
                (string) $this->command($client, ['CLUSTER', 'INFO']),
                (string) $this->command($client, ['CLUSTER', 'NODES']),
            );
        }

        return $data;
    }

    /**
     * @return array<string, string>
     */
    private function parseInfo(mixed $raw): array
    {
        return $this->parser->keyValues((string) $raw);
    }

    /**
     * Run a command and turn an error answer of the server into an exception.
     *
     * @param  array<int, string>  $arguments
     */
    private function command(Client $client, array $arguments): mixed
    {
        $error = false;
        $response = $client->executeRaw($arguments, $error);

        if ($error) {
            throw new RuntimeException((string) $response);
        }

        return $response;
    }

    private function connect(string $host, int $port, ?string $username, ?string $password): Client
    {
        $parameters = [
            'scheme' => 'tcp',
            'host' => trim(PublicHost::resolve($host), '[]'),
            'port' => $port,
            'timeout' => self::CONNECT_TIMEOUT,
            'read_write_timeout' => self::CONNECT_TIMEOUT,
        ];

        if (filled($password)) {
            $parameters['password'] = $password;

            if (filled($username)) {
                $parameters['username'] = $username;
            }
        }

        $client = new Client($parameters);
        // Connecting here throws on a wrong address or password, so the callers get the error at once.
        $client->connect();

        return $client;
    }

    /**
     * Commands per second since the previous reading. A restart resets the counter, so there is no value then.
     *
     * @param  array<string, mixed>  $data
     */
    private function commandsPerSecond(Server $server, array $data): ?float
    {
        $previous = $server->redisMetrics()->latest('collected_at')->first();

        if ($previous === null || $data['commands_total'] < $previous->commands_total) {
            return null;
        }

        $seconds = $previous->collected_at->diffInSeconds(now(), true);

        return $seconds > 0 ? round(($data['commands_total'] - $previous->commands_total) / $seconds, 2) : null;
    }

    private function recordError(Server $server, Throwable $e): void
    {
        $server->errors()->create([
            'type' => $this->errorType($e),
            'message' => mb_substr($this->describe($e, $server->host, $server->port, 'en'), 0, 2000),
            'context' => ['exception' => $e::class],
            'occurred_at' => now(),
        ]);

        $server->forceFill(['status' => ServerStatus::Offline, 'last_checked_at' => now()])->save();
    }

    private function errorType(Throwable $e): ServerErrorType
    {
        return match (true) {
            $this->isAuthenticationError($e) => ServerErrorType::Authentication,
            $e instanceof InvalidArgumentException => ServerErrorType::Connection,
            $e instanceof ConnectionException => ServerErrorType::Connection,
            default => ServerErrorType::Unknown,
        };
    }

    private function isAuthenticationError(Throwable $e): bool
    {
        return preg_match('/WRONGPASS|NOAUTH|invalid password|invalid username-password/i', $e->getMessage()) === 1;
    }

    public function describe(Throwable $e, string $host, int $port, ?string $locale = null): string
    {
        if ($this->isAuthenticationError($e)) {
            return __('Authentication failed. Check the username and password.', [], $locale);
        }

        return __('Could not connect to :host on port :port.', ['host' => $host, 'port' => $port], $locale).' '.mb_substr($e->getMessage(), 0, 300);
    }
}
