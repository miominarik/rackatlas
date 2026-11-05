<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MeController extends ApiController
{
    /**
     * Who the key belongs to and what it may do. Handy as a health check of the connection.
     */
    public function __invoke(Request $request): JsonResponse
    {
        $token = $this->token($request);

        return response()->json(['data' => [
            'team' => ['id' => $token->team->id, 'name' => $token->team->name],
            'key' => [
                'name' => $token->name,
                'scopes' => $token->abilities,
                'expires_at' => $token->expires_at?->toIso8601String(),
            ],
        ]]);
    }
}
