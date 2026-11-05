<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\Teams\StoreApiTokenRequest;
use App\Models\ApiToken;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;

class ApiTokenController extends Controller
{
    /**
     * Create a key for the external API. The plain value is shown once, right after this request.
     */
    public function store(StoreApiTokenRequest $request, Team $team): RedirectResponse
    {
        $this->authorize('manage', $team);

        $days = $request->validated('expires_in_days');

        [$token, $plain] = ApiToken::issue(
            $team,
            $request->user(),
            $request->validated('name'),
            $request->validated('scopes'),
            $days ? now()->addDays((int) $days) : null,
        );

        Inertia::flash('api_token', ['id' => $token->id, 'name' => $token->name, 'token' => $plain]);
        Inertia::flash('toast', ['type' => 'success', 'message' => __('API key created.')]);

        return to_route('teams.show', $team);
    }

    /**
     * Revoke a key.
     */
    public function destroy(Team $team, ApiToken $apiToken): RedirectResponse
    {
        $this->authorize('manage', $team);

        $apiToken->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('API key revoked.')]);

        return to_route('teams.show', $team);
    }
}
