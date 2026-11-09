<?php

namespace App\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Enums\ServerType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Servers\TestConnectionRequest;
use App\Models\Server;
use App\Models\SshKey;
use App\Services\Database\MysqlMetricsCollector;
use App\Services\Redis\RedisMetricsCollector;
use App\Services\Ssh\ConnectionTester;
use Illuminate\Http\JsonResponse;

class TestConnectionController extends Controller
{
    /**
     * Check that the entered connection details work, before saving them.
     */
    public function __invoke(TestConnectionRequest $request, ConnectionTester $tester, MysqlMetricsCollector $mysql, RedisMetricsCollector $redis): JsonResponse
    {
        $data = $request->validated();
        $team = $request->team();

        $isMysql = ($data['type'] ?? null) === ServerType::Mysql->value;
        $isSentinel = ($data['type'] ?? null) === ServerType::Sentinel->value;
        $isRedis = $isSentinel || ($data['type'] ?? null) === ServerType::Redis->value;
        $usesPassword = $isMysql || $isRedis || $data['auth_type'] === ServerAuthType::Password->value;
        $password = $data['password'] ?? null;
        $key = null;
        $stored = ! empty($data['server_id'])
            ? Server::where('team_id', $team->id)->find($data['server_id'])
            : null;

        if ($usesPassword) {
            if (blank($password) && ! empty($data['server_id'])) {
                $password = $stored?->password;
            }

            if (blank($password) && ! $isRedis) {
                return response()->json(['success' => false, 'message' => __('Enter the password first.')]);
            }
        } else {
            $key = SshKey::where('team_id', $team->id)->find($data['ssh_key_id'] ?? null);

            if ($key === null) {
                return response()->json(['success' => false, 'message' => __('Choose an SSH key first.')]);
            }
        }

        if ($isRedis) {
            return response()->json($redis->test(
                $data['host'],
                $isSentinel ? null : (int) $data['port'],
                $data['username'] ?? null,
                $password,
                $isSentinel ? (int) $data['port'] : (filled($data['sentinel_port'] ?? null) ? (int) $data['sentinel_port'] : null),
                $data['sentinel_master_name'] ?? null,
            ));
        }

        if ($isMysql) {
            return response()->json($mysql->test($data['host'], (int) $data['port'], $data['username'], (string) $password));
        }

        $pinned = $stored !== null && $stored->host === $data['host'] && (int) $stored->port === (int) $data['port']
            ? $stored->ssh_host_fingerprint
            : null;

        return response()->json($tester->test($data['host'], (int) $data['port'], $data['username'], $password, $key, $pinned));
    }
}
