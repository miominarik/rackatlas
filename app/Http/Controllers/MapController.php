<?php

namespace App\Http\Controllers;

use App\Models\Server;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MapController extends Controller
{
    /**
     * Servers of the current team placed on the map of Europe by their country.
     */
    public function __invoke(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        return Inertia::render('map', [
            'team' => $team?->only('id', 'name'),
            'servers' => $team
                ? $team->servers()->with('category')->orderBy('name')->get()
                    ->map(fn (Server $server) => [
                        'id' => $server->id,
                        'name' => $server->name,
                        'provider' => $server->provider,
                        'country' => $server->country,
                        'status' => $server->status->value,
                        'category' => $server->category?->only('name', 'color'),
                    ])
                : [],
        ]);
    }
}
