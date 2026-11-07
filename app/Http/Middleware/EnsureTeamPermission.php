<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Closes a page of the app for members whose permission in the current team is too low,
 * as "permission:servers.view". Without a team there is nothing to protect.
 */
class EnsureTeamPermission
{
    public function handle(Request $request, Closure $next, string $ability): Response
    {
        $team = $request->user()?->currentTeam();

        abort_if($team !== null && ! $request->user()->can('permit', [$team, $ability]), 403, __('You do not have access to this part of the team.'));

        return $next($request);
    }
}
