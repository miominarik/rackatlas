<?php

namespace App\Http\Middleware;

use App\Models\ApiToken;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureApiScope
{
    /**
     * Let the request through only when the key has every scope the route asks for.
     */
    public function handle(Request $request, Closure $next, string ...$scopes): Response
    {
        /** @var ApiToken $token */
        $token = $request->attributes->get('api_token');

        foreach ($scopes as $scope) {
            if (! $token->can($scope)) {
                return response()->json(['message' => 'This key lacks the scope '.$scope.'.'], 403);
            }
        }

        return $next($request);
    }
}
