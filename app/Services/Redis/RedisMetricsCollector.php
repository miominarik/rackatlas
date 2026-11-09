<?php

namespace App\Services\Redis;

use App\Enums\ServerErrorType;
use App\Enums\ServerStatus;
use App\Models\RedisMetric;
use App\Models\SentinelGroup;
use App\Models\Server;
use App\Services\Ssh\PublicHost;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use InvalidArgumentException;
use Predis\Client;
use Predis\Connection\ConnectionException;
use RuntimeException;
use Throwable;

class RedisMetricsCollector
{
    private const CONNECT_TIMEOUT = 8;

    /**
     * Read the status of one Redis server, and of Redis Sentinel when the server has one, and store it.
     * A failure is written to the server errors and the server is marked offline.
     */
    public function collect(Server $server): ?RedisMetric
    {
        $data = [];

        try {
            // A server that only runs Redis Sentinel has no Redis server to read.
            if (! $server->isSentinel()) {
                $data = $this->read($server);
                $data['commands_per_second'] = $this->commandsPerSecond($server, $data);
            }
        } catch (Throwable $e) {
            $this->recordError($server, $e);

            return null;
        }

        $sentinel = $server->sentinel_port !== null ? $this->readSentinel($server) : null;

        if ($server->isSentinel() && ! ($sentinel['reachable'] ?? false)) {
            $this->recordError($server, new RuntimeException((string) ($sentinel['error'] ?? 'Sentinel does not answer.')));

            return null;
        }

        $metric = $server->redisMetrics()->create([
            ...$data,
            'sentinel' => $sentinel,
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
     * Check that the details log in, without storing anything. With a Sentinel port and master name
     * the Sentinel on the same host is checked too. A server that only runs Sentinel passes no Redis port.
     *
     * @return array{success: bool, message: string}
     */
    public function test(string $host, ?int $port, ?string $username, ?string $password, ?int $sentinelPort = null, ?string $masterName = null): array
    {
        $message = __('Connection successful.');

        if ($port !== null) {
            try {
                $info = $this->parseInfo($this->command($this->connect($host, $port, $username, $password), ['INFO', 'server']));
            } catch (Throwable $e) {
                return ['success' => false, 'message' => $this->describe($e, $host, $port)];
            }

            $message .= ' Redis '.($info['redis_version'] ?? '?');
        }

        if ($sentinelPort !== null && $masterName !== null) {
            try {
                $master = $this->pairs($this->command($this->connect($host, $sentinelPort, $username, $password), ['SENTINEL', 'MASTER', $masterName]));
            } catch (Throwable $e) {
                return ['success' => false, 'message' => $message.' '.__('Redis Sentinel on port :port does not answer for the master ":master": :error', [
                    'port' => $sentinelPort, 'master' => $masterName, 'error' => mb_substr($e->getMessage(), 0, 200),
                ])];
            }

            $message .= ' · '.__('Sentinel sees the master at :address.', ['address' => ($master['ip'] ?? '?').':'.($master['port'] ?? '?')]);
        }

        return ['success' => true, 'message' => $message];
    }

    /**
     * What Redis Sentinel on this server reports about the master it watches, its replicas and the other Sentinels.
     *
     * @return array<string, mixed>
     */
    public function readSentinel(Server $server): array
    {
        $name = (string) $server->sentinelGroup?->master_name;

        try {
            $client = $this->connect($server->host, (int) $server->sentinel_port, $server->username, $server->password);

            $master = $this->pairs($this->command($client, ['SENTINEL', 'MASTER', $name]));
            $replicas = $this->replicas($client, $name);
            $sentinels = $this->command($client, ['SENTINEL', 'SENTINELS', $name]);

            $quorumError = false;
            $quorum = $client->executeRaw(['SENTINEL', 'CKQUORUM', $name], $quorumError);
        } catch (Throwable $e) {
            return [
                'reachable' => false,
                'master_name' => $name,
                'error' => mb_substr($e->getMessage(), 0, 300),
            ];
        }

        $flags = array_values(array_filter(explode(',', (string) ($master['flags'] ?? ''))));

        return [
            'reachable' => true,
            'master_name' => $name,
            'master_ip' => $master['ip'] ?? null,
            'master_port' => isset($master['port']) ? (int) $master['port'] : null,
            'master_flags' => $flags,
            'master_down' => (bool) array_intersect($flags, ['s_down', 'o_down']),
            'failover_in_progress' => in_array('failover_in_progress', $flags, true),
            'quorum' => isset($master['quorum']) ? (int) $master['quorum'] : null,
            'known_sentinels' => count($sentinels) + 1,
            'quorum_ok' => ! $quorumError,
            'quorum_message' => mb_substr((string) $quorum, 0, 300),
            'replicas' => $replicas,
        ];
    }

    /**
     * Start a planned switch of the master to a replica with SENTINEL FAILOVER. Before anything is sent, every
     * Sentinel of the group is asked live, and the switch is refused unless they all answer, agree on the master,
     * see a quorum and see a healthy replica to take over. The old master becomes a replica of the new one.
     *
     * @throws RuntimeException with a message for the user when the switch is not safe or the Sentinel refuses it
     */
    public function switchover(SentinelGroup $group): void
    {
        $members = $group->servers()->redisFamily()->get();

        if ($members->isEmpty()) {
            throw new RuntimeException(__('This Sentinel group has no servers.'));
        }

        $reports = $members->mapWithKeys(fn (Server $member) => [$member->id => $this->readSentinel($member)]);

        foreach ($members as $member) {
            if (! $reports[$member->id]['reachable']) {
                throw new RuntimeException(__('Sentinel on :server does not answer, so the switch was not started.', ['server' => $member->name]));
            }
        }

        $masters = $reports->map(fn (array $report) => $report['master_ip'].':'.$report['master_port'])->unique();

        if ($masters->count() > 1) {
            throw new RuntimeException(__('The Sentinels disagree about which server is the master, so the switch was not started.'));
        }

        foreach ($members as $member) {
            $report = $reports[$member->id];

            if ($report['master_down'] || $report['failover_in_progress']) {
                throw new RuntimeException(__('The master is down or a failover is already running, so the switch was not started.'));
            }

            if (! $report['quorum_ok']) {
                throw new RuntimeException(__('Sentinel on :server cannot reach the quorum, so the switch was not started.', ['server' => $member->name]));
            }
        }

        $healthyReplicas = collect($reports->first()['replicas'])->filter(fn (array $replica) => ! array_intersect($replica['flags'], ['s_down', 'o_down', 'disconnected'])
            && ($replica['link_status'] ?? 'ok') === 'ok');

        if ($healthyReplicas->isEmpty()) {
            throw new RuntimeException(__('There is no healthy replica to take over, so the switch was not started.'));
        }

        $lock = Cache::lock('redis-failover:'.$group->id, 60);

        if (! $lock->get()) {
            throw new RuntimeException(__('A switch of this group was started a moment ago.'));
        }

        // The lock is left to expire on its own, so a second click cannot start another switch right after.
        $first = $members->first();

        try {
            $this->command($this->connect($first->host, (int) $first->sentinel_port, $first->username, $first->password), ['SENTINEL', 'FAILOVER', $group->master_name]);
        } catch (Throwable $e) {
            $lock->release();

            throw new RuntimeException(__('Sentinel refused the switch:').' '.mb_substr($e->getMessage(), 0, 300));
        }

        Log::info('Redis Sentinel failover started', ['group' => $group->id, 'master_name' => $group->master_name, 'master' => $masters->first(), 'via' => $first->id]);
    }

    /**
     * @return array<int, array{ip: string|null, port: int|null, flags: array<int, string>, link_status: string|null, link_down_seconds: int|null}>
     */
    private function replicas(Client $client, string $name): array
    {
        $error = false;
        $rows = $client->executeRaw(['SENTINEL', 'REPLICAS', $name], $error);

        if ($error) {
            // Sentinel before 5.0 only knows the older name.
            $rows = $this->command($client, ['SENTINEL', 'SLAVES', $name]);
        }

        return array_map(function ($row) {
            $replica = $this->pairs($row);

            return [
                'ip' => $replica['ip'] ?? null,
                'port' => isset($replica['port']) ? (int) $replica['port'] : null,
                'flags' => array_values(array_filter(explode(',', (string) ($replica['flags'] ?? '')))),
                'link_status' => $replica['master-link-status'] ?? null,
                'link_down_seconds' => isset($replica['master-link-down-time']) ? (int) ((int) $replica['master-link-down-time'] / 1000) : null,
            ];
        }, is_array($rows) ? $rows : []);
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

        $persistence = array_filter([
            $info['rdb_last_bgsave_status'] ?? null,
            $info['aof_last_write_status'] ?? null,
            $info['aof_last_bgrewrite_status'] ?? null,
        ]);

        return [
            'version' => mb_substr((string) ($info['redis_version'] ?? ''), 0, 50) ?: null,
            'role' => mb_substr((string) ($info['role'] ?? ''), 0, 20) ?: null,
            'uptime_seconds' => (int) ($info['uptime_in_seconds'] ?? 0),
            'connected_clients' => (int) ($info['connected_clients'] ?? 0),
            'blocked_clients' => (int) ($info['blocked_clients'] ?? 0),
            'max_clients' => $maxClients,
            'used_memory' => (int) ($info['used_memory'] ?? 0),
            'max_memory' => (int) ($info['maxmemory'] ?? 0),
            'used_memory_rss' => (int) ($info['used_memory_rss'] ?? 0),
            'commands_total' => (int) ($info['total_commands_processed'] ?? 0),
            'keyspace_hits_total' => (int) ($info['keyspace_hits'] ?? 0),
            'keyspace_misses_total' => (int) ($info['keyspace_misses'] ?? 0),
            'evicted_keys_total' => (int) ($info['evicted_keys'] ?? 0),
            'rejected_connections_total' => (int) ($info['rejected_connections'] ?? 0),
            'keys_count' => $this->keysCount($info),
            'connected_replicas' => (int) ($info['connected_slaves'] ?? 0),
            'master_host' => isset($info['master_host']) ? mb_substr($info['master_host'].':'.($info['master_port'] ?? ''), 0, 255) : null,
            'master_link_status' => isset($info['master_link_status']) ? mb_substr((string) $info['master_link_status'], 0, 20) : null,
            'master_last_io_seconds_ago' => isset($info['master_last_io_seconds_ago']) ? (int) $info['master_last_io_seconds_ago'] : null,
            'persistence_ok' => $persistence === [] ? null : array_unique($persistence) === ['ok'],
        ];
    }

    /**
     * The number of keys in all databases, from the lines "db0:keys=3,expires=0,avg_ttl=0".
     *
     * @param  array<string, string>  $info
     */
    private function keysCount(array $info): int
    {
        $keys = 0;

        foreach ($info as $name => $value) {
            if (preg_match('/^db\d+$/', $name) === 1 && preg_match('/keys=(\d+)/', $value, $match) === 1) {
                $keys += (int) $match[1];
            }
        }

        return $keys;
    }

    /**
     * @return array<string, string>
     */
    private function parseInfo(mixed $raw): array
    {
        $info = [];

        foreach (preg_split('/\r?\n/', (string) $raw) ?: [] as $line) {
            if ($line === '' || $line[0] === '#' || ! str_contains($line, ':')) {
                continue;
            }

            [$key, $value] = explode(':', $line, 2);
            $info[$key] = $value;
        }

        return $info;
    }

    /**
     * A flat list "key, value, key, value" as returned by Sentinel, as an array.
     *
     * @return array<string, string>
     */
    private function pairs(mixed $flat): array
    {
        $pairs = [];

        for ($i = 0; is_array($flat) && $i + 1 < count($flat); $i += 2) {
            $pairs[(string) $flat[$i]] = (string) $flat[$i + 1];
        }

        return $pairs;
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
