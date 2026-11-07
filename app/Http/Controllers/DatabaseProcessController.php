<?php

namespace App\Http\Controllers;

use App\Models\Server;
use App\Services\Database\MysqlMetricsCollector;
use Illuminate\Http\JsonResponse;
use Throwable;

class DatabaseProcessController extends Controller
{
    /**
     * The statements running on the MySQL server right now, read live.
     */
    public function index(Server $server, MysqlMetricsCollector $mysql): JsonResponse
    {
        abort_unless($server->isMysql(), 404);
        $this->authorize('view', $server->team);

        try {
            return response()->json(['success' => true, 'queries' => $mysql->runningQueries($server)]);
        } catch (Throwable $e) {
            return response()->json(['success' => false, 'queries' => [], 'message' => $mysql->describe($e, $server->host, $server->port)]);
        }
    }

    /**
     * Stop one running statement.
     */
    public function kill(Server $server, int $process, MysqlMetricsCollector $mysql): JsonResponse
    {
        abort_unless($server->isMysql(), 404);
        $this->authorize('manage', $server->team);

        try {
            $mysql->killQuery($server, $process);
        } catch (Throwable $e) {
            $message = str_contains($e->getMessage(), '1095')
                ? __('The MySQL user :user may not kill this query. It needs CONNECTION_ADMIN, and for queries of administrator accounts such as root also SYSTEM_USER.', ['user' => $server->username])
                : __('Could not kill the query.').' '.mb_substr($e->getMessage(), 0, 300);

            return response()->json(['success' => false, 'message' => $message]);
        }

        return response()->json(['success' => true]);
    }
}
