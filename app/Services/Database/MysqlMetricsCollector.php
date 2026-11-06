<?php

namespace App\Services\Database;

use App\Enums\ServerErrorType;
use App\Enums\ServerStatus;
use App\Models\DatabaseMetric;
use App\Models\Server;
use App\Services\Ssh\PublicHost;
use PDO;
use Throwable;

class MysqlMetricsCollector
{
    private const CONNECT_TIMEOUT = 8;

    /** Schemas that belong to MySQL itself and say nothing about the data of the user. */
    private const SYSTEM_SCHEMAS = ['information_schema', 'performance_schema', 'mysql', 'sys'];

    /**
     * Read the status of one MySQL server and store it. A failure is written to the server errors
     * and the server is marked offline.
     */
    public function collect(Server $server): ?DatabaseMetric
    {
        try {
            $data = $this->read($server);
        } catch (Throwable $e) {
            $this->recordError($server, $e);

            return null;
        }

        $metric = $server->databaseMetrics()->create([
            ...$data,
            'queries_per_second' => $this->queriesPerSecond($server, $data),
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
    public function test(string $host, int $port, string $username, string $password): array
    {
        try {
            $pdo = $this->connect($host, $port, $username, $password);
            $version = (string) $pdo->query('SELECT VERSION()')->fetchColumn();
        } catch (Throwable $e) {
            return ['success' => false, 'message' => $this->describe($e, $host, $port)];
        }

        return ['success' => true, 'message' => __('Connection successful.').' MySQL '.$version];
    }

    /**
     * @return array<string, mixed>
     */
    private function read(Server $server): array
    {
        $pdo = $this->connect($server->host, $server->port, $server->username, (string) $server->password);

        $status = $pdo->query('SHOW GLOBAL STATUS')->fetchAll(PDO::FETCH_KEY_PAIR);
        $variables = $pdo->query("SHOW GLOBAL VARIABLES WHERE Variable_name IN ('version', 'max_connections', 'innodb_buffer_pool_size')")
            ->fetchAll(PDO::FETCH_KEY_PAIR);

        $schemas = $pdo->query(
            'SELECT COUNT(DISTINCT table_schema) AS schema_count, COALESCE(SUM(data_length + index_length), 0) AS data_total '
            .'FROM information_schema.tables WHERE table_schema NOT IN ('.implode(',', array_map(fn ($s) => $pdo->quote($s), self::SYSTEM_SCHEMAS)).')'
        )->fetch(PDO::FETCH_ASSOC);

        return [
            'version' => mb_substr((string) ($variables['version'] ?? ''), 0, 100) ?: null,
            'uptime_seconds' => (int) ($status['Uptime'] ?? 0),
            'threads_connected' => (int) ($status['Threads_connected'] ?? 0),
            'threads_running' => (int) ($status['Threads_running'] ?? 0),
            'max_connections' => (int) ($variables['max_connections'] ?? 0),
            'questions_total' => (int) ($status['Questions'] ?? 0),
            'slow_queries_total' => (int) ($status['Slow_queries'] ?? 0),
            'aborted_connects_total' => (int) ($status['Aborted_connects'] ?? 0),
            'buffer_pool_size' => isset($variables['innodb_buffer_pool_size']) ? (int) $variables['innodb_buffer_pool_size'] : null,
            'data_bytes' => (int) ($schemas['data_total'] ?? 0),
            'databases_count' => (int) ($schemas['schema_count'] ?? 0),
        ];
    }

    private function connect(string $host, int $port, string $username, string $password): PDO
    {
        $address = trim(PublicHost::resolve($host), '[]');

        return new PDO(
            'mysql:host='.$address.';port='.$port,
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_TIMEOUT => self::CONNECT_TIMEOUT,
                PDO::ATTR_EMULATE_PREPARES => true,
            ],
        );
    }

    /**
     * Queries per second since the previous reading. A restart resets the counter, so there is no value then.
     *
     * @param  array<string, mixed>  $data
     */
    private function queriesPerSecond(Server $server, array $data): ?float
    {
        $previous = $server->databaseMetrics()->latest('collected_at')->first();

        if ($previous === null || $data['questions_total'] < $previous->questions_total) {
            return null;
        }

        $seconds = $previous->collected_at->diffInSeconds(now(), true);

        return $seconds > 0 ? round(($data['questions_total'] - $previous->questions_total) / $seconds, 2) : null;
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
            $e->getCode() === 1045 => ServerErrorType::Authentication,
            $e instanceof \PDOException => ServerErrorType::Connection,
            $e instanceof \InvalidArgumentException => ServerErrorType::Connection,
            default => ServerErrorType::Unknown,
        };
    }

    private function describe(Throwable $e, string $host, int $port, ?string $locale = null): string
    {
        if ($e->getCode() === 1045) {
            return __('Authentication failed. Check the username and password.', [], $locale);
        }

        return __('Could not connect to :host on port :port.', ['host' => $host, 'port' => $port], $locale).' '.mb_substr($e->getMessage(), 0, 300);
    }
}
