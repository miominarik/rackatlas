<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ApiToken;
use App\Models\Server;
use App\Models\Team;
use Illuminate\Http\Request;

abstract class ApiController extends Controller
{
    protected function token(Request $request): ApiToken
    {
        return $request->attributes->get('api_token');
    }

    protected function team(Request $request): Team
    {
        return $this->token($request)->team;
    }

    /**
     * A server of the team of the key. Another team's server is a plain 404.
     */
    protected function server(Request $request, int|string $id): Server
    {
        return $this->team($request)->servers()->findOrFail($id);
    }
}
