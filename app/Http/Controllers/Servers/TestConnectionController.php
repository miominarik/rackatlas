<?php

namespace App\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Servers\TestConnectionRequest;
use App\Models\Server;
use App\Models\SshKey;
use App\Services\Ssh\ConnectionTester;
use Illuminate\Http\JsonResponse;

class TestConnectionController extends Controller
{
    /**
     * Check that the entered connection details work, before saving them.
     */
    public function __invoke(TestConnectionRequest $request, ConnectionTester $tester): JsonResponse
    {
        $data = $request->validated();
        $team = $request->team();

        $usesPassword = $data['auth_type'] === ServerAuthType::Password->value;
        $password = $data['password'] ?? null;
        $key = null;

        if ($usesPassword) {
            if (blank($password) && ! empty($data['server_id'])) {
                $password = Server::where('team_id', $team->id)->find($data['server_id'])?->password;
            }

            if (blank($password)) {
                return response()->json(['success' => false, 'message' => __('Enter the password first.')]);
            }
        } else {
            $key = SshKey::where('team_id', $team->id)->find($data['ssh_key_id'] ?? null);

            if ($key === null) {
                return response()->json(['success' => false, 'message' => __('Choose an SSH key first.')]);
            }
        }

        return response()->json($tester->test($data['host'], (int) $data['port'], $data['username'], $password, $key));
    }
}
