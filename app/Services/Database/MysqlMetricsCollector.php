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
     * The statements that are running right now, longest first. Idle connections and the
     * connection of this check itself are left out.
     *
     * @return array<int, array{id: int, user: string, host: string, db: string|null, time: int, state: string|null, query: string}>
     */
    public function runningQueries(Server $server): array
    {
        $pdo = $this->connect($server->host, $server->port, $server->username, (string) $server->password);

        $statement = $pdo->prepare(
            "SELECT ID, USER, HOST, DB, TIME, STATE, INFO FROM information_schema.PROCESSLIST WHERE COMMAND = 'Query' AND INFO IS NOT NULL AND ID <> CONNECTION_ID() ORDER BY TIME DESC LIMIT 100"
        );
        $statement->execute();

        return array_map(fn (array $row) => [
            'id' => (int) $row['ID'],
            'user' => (string) $row['USER'],
            'host' => (string) $row['HOST'],
            'db' => $row['DB'] !== null ? (string) $row['DB'] : null,
            'time' => (int) $row['TIME'],
            'state' => $row['STATE'] !== null && $row['STATE'] !== '' ? (string) $row['STATE'] : null,
            'query' => mb_substr((string) $row['INFO'], 0, 2000),
        ], $statement->fetchAll(PDO::FETCH_ASSOC));
    }

    /**
     * Stop the running statement of a connection. The connection itself stays open.
     */
    public function killQuery(Server $server, int $processId): void
    {
        $pdo = $this->connect($server->host, $server->port, $server->username, (string) $server->password);

        $pdo->exec('KILL QUERY '.$processId);
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
            'bytes_received_total' => (int) ($status['Bytes_received'] ?? 0),
            'bytes_sent_total' => (int) ($status['Bytes_sent'] ?? 0),
            'com_select_total' => (int) ($status['Com_select'] ?? 0),
            'com_insert_total' => (int) ($status['Com_insert'] ?? 0),
            'com_update_total' => (int) ($status['Com_update'] ?? 0),
            'com_delete_total' => (int) ($status['Com_delete'] ?? 0),
            ...$this->replication($pdo),
        ];
    }

    /**
     * The state of the replication when the server is a replica. A server that is not one, or a
     * user without the REPLICATION CLIENT privilege, gives no values. MySQL before 8.0.22
     * and MariaDB only know the older SLAVE name.
     *
     * @return array{replica_io_running: bool|null, replica_sql_running: bool|null, replica_lag_seconds: int|null, replica_source: string|null, replica_error: string|null}
     */
    private function replication(PDO $pdo): array
    {
        $none = [
            'replica_io_running' => null, 'replica_sql_running' => null, 'replica_lag_seconds' => null,
            'replica_source' => null, 'replica_error' => null,
        ];

        try {
            $rows = $pdo->query('SHOW REPLICA STATUS')->fetchAll(PDO::FETCH_ASSOC);
        } catch (Throwable) {
            try {
                $rows = $pdo->query('SHOW SLAVE STATUS')->fetchAll(PDO::FETCH_ASSOC);
            } catch (Throwable) {
                return $none;
            }
        }

        if ($rows === []) {
            return $none;
        }

        $pick = fn (array $row, string ...$names) => array_values(array_filter(
            array_map(fn ($name) => $row[$name] ?? null, $names),
            fn ($value) => $value !== null,
        ))[0] ?? null;

        $io = true;
        $sql = true;
        $lag = null;
        $error = null;
        $sources = [];

        foreach ($rows as $row) {
            $io = $io && $pick($row, 'Replica_IO_Running', 'Slave_IO_Running') === 'Yes';
            $sql = $sql && $pick($row, 'Replica_SQL_Running', 'Slave_SQL_Running') === 'Yes';

            $rowLag = $pick($row, 'Seconds_Behind_Source', 'Seconds_Behind_Master');
            $lag = $rowLag === null ? $lag : max((int) $lag, (int) $rowLag);

            $error ??= array_values(array_filter([
                (string) $pick($row, 'Last_IO_Error'), (string) $pick($row, 'Last_SQL_Error'), (string) $pick($row, 'Last_Error'),
            ]))[0] ?? null;

            $host = $pick($row, 'Source_Host', 'Master_Host');
            $sources[] = $host !== null ? $host.':'.$pick($row, 'Source_Port', 'Master_Port') : null;
        }

        return [
            'replica_io_running' => $io,
            'replica_sql_running' => $sql,
            'replica_lag_seconds' => $lag,
            'replica_source' => mb_substr(implode(', ', array_filter($sources)), 0, 255) ?: null,
            'replica_error' => $error !== null ? mb_substr($error, 0, 500) : null,
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

    public function describe(Throwable $e, string $host, int $port, ?string $locale = null): string
    {
        if ($e->getCode() === 1045) {
            return __('Authentication failed. Check the username and password.', [], $locale);
        }

        return __('Could not connect to :host on port :port.', ['host' => $host, 'port' => $port], $locale).' '.mb_substr($e->getMessage(), 0, 300);
    }
}
