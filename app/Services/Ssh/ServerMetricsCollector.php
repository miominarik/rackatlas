<?php

namespace App\Services\Ssh;

use App\Enums\ServerAuthType;
use App\Enums\ServerErrorType;
use App\Enums\ServerStatus;
use App\Exceptions\MetricsCollectionException;
use App\Models\Server;
use App\Models\ServerMetric;
use Illuminate\Support\Facades\DB;
use phpseclib4\Crypt\PublicKeyLoader;
use phpseclib4\Net\SSH2;
use Throwable;

class ServerMetricsCollector
{
    private const CONNECT_TIMEOUT = 10;

    private const COMMAND_TIMEOUT = 20;

    public function __construct(private readonly MetricsParser $parser) {}

    /**
     * Collect and store the metrics of one server. Every failure is written to the
     * server_errors table and the server is marked offline.
     */
    public function collect(Server $server): ?ServerMetric
    {
        try {
            $data = $this->parser->parse($this->run($server));

            $metric = $this->store($server, $data);

            $server->forceFill([
                'status' => ServerStatus::Online,
                'last_checked_at' => now(),
                'last_seen_at' => now(),
            ])->save();

            return $metric;
        } catch (MetricsCollectionException $e) {
            $this->recordError($server, $e->type, $e->getMessage());
        } catch (Throwable $e) {
            $this->recordError($server, ServerErrorType::Unknown, $e->getMessage(), [
                'exception' => $e::class,
            ]);
        }

        return null;
    }

    public function recordError(Server $server, ServerErrorType $type, string $message, array $context = []): void
    {
        $server->errors()->create([
            'type' => $type,
            'message' => mb_substr($message, 0, 2000),
            'context' => $context ?: null,
            'occurred_at' => now(),
        ]);

        $server->forceFill([
            'status' => ServerStatus::Offline,
            'last_checked_at' => now(),
        ])->save();
    }

    /**
     * @throws MetricsCollectionException
     */
    private function run(Server $server): string
    {
        $credential = $this->credential($server);

        try {
            $ssh = new SSH2($server->host, $server->port, self::CONNECT_TIMEOUT);
            $ssh->setTimeout(self::COMMAND_TIMEOUT);

            $loggedIn = $ssh->login($server->username, $credential);
        } catch (Throwable $e) {
            throw new MetricsCollectionException(
                ServerErrorType::Connection,
                __('Could not connect to :host on port :port.', ['host' => $server->host, 'port' => $server->port], 'en').' '.$e->getMessage(),
            );
        }

        if (! $loggedIn) {
            throw new MetricsCollectionException(
                ServerErrorType::Authentication,
                $server->auth_type === ServerAuthType::Key
                    ? __('The server rejected the SSH key.', [], 'en')
                    : __('Authentication failed. Check the username and password.', [], 'en'),
            );
        }

        try {
            $output = $ssh->exec('sh -c '.escapeshellarg(MetricsParser::SCRIPT));
        } catch (Throwable $e) {
            throw new MetricsCollectionException(ServerErrorType::Command, 'The command failed: '.$e->getMessage());
        } finally {
            $ssh->disconnect();
        }

        if (! is_string($output) || trim($output) === '') {
            throw new MetricsCollectionException(ServerErrorType::Command, 'The server returned no output (timeout?).');
        }

        return $output;
    }

    /**
     * @throws MetricsCollectionException
     */
    private function credential(Server $server): mixed
    {
        if ($server->auth_type === ServerAuthType::Password) {
            return (string) $server->password;
        }

        $key = $server->sshKey;

        try {
            return PublicKeyLoader::load($key->private_key, $key->passphrase ?: false);
        } catch (Throwable) {
            throw new MetricsCollectionException(ServerErrorType::Key, __('The SSH key could not be used.', [], 'en'));
        }
    }

    /**
     * @param  array<string, mixed>  $data
     */
    public function store(Server $server, array $data): ServerMetric
    {
        $disks = $data['disks'];
        unset($data['disks']);

        return DB::transaction(function () use ($server, $data, $disks) {
            $metric = $server->metrics()->create([...$data, 'collected_at' => now()]);

            if ($disks !== []) {
                $metric->disks()->createMany($disks);
            }

            return $metric;
        });
    }
}
