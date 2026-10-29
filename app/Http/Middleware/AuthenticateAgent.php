<?php

namespace App\Http\Middleware;

use App\Models\Server;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateAgent
{
    /**
     * The agent proves itself with the token of its server. The server is put on the request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $token = $request->bearerToken();
        $server = $token ? Server::findByAgentToken($token) : null;

        if ($server === null) {
            return response()->json(['message' => 'Unauthorized.'], 401);
        }

        $request->attributes->set('agent_server', $server);

        return $next($request);
    }
}
