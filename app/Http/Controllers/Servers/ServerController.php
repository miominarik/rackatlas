<?php

namespace App\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Servers\ServerRequest;
use App\Models\Server;
use App\Models\ServerCategory;
use App\Models\ServerMetric;
use App\Models\ServerMetricDisk;
use App\Models\Team;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServerController extends Controller
{
    /**
     * List the servers of the current team, grouped by category on the page.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        return Inertia::render('servers/index', [
            'team' => $team?->only('id', 'name'),
            'canManage' => $team !== null && $request->user()->can('manage', $team),
            'categories' => $team
                ? $team->serverCategories()->withCount('servers')->orderBy('name')->get()
                    ->map(fn (ServerCategory $category) => [
                        'id' => $category->id,
                        'name' => $category->name,
                        'color' => $category->color,
                        'servers_count' => $category->servers_count,
                    ])
                : [],
            'colors' => ServerCategory::COLORS,
            'servers' => $team
                ? $team->servers()->with(['category', 'sshKey', 'latestMetric.disks'])->orderBy('name')->get()
                    ->map(fn (Server $server) => [
                        'id' => $server->id,
                        'name' => $server->name,
                        'host' => $server->host,
                        'port' => $server->port,
                        'username' => $server->username,
                        'auth_type' => $server->auth_type->value,
                        'ssh_key_name' => $server->sshKey?->name,
                        'agent_version' => $server->agent_version,
                        'server_category_id' => $server->server_category_id,
                        'status' => $server->status->value,
                        'last_checked' => $server->last_checked_at?->diffForHumans(),
                        'metrics' => $this->presentMetric($server->latestMetric),
                    ])
                : [],
        ]);
    }

    /**
     * Show the "add server" wizard.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $team = $request->user()->currentTeam();

        if ($team === null) {
            return $this->needsTeam();
        }

        $this->authorize('manage', $team);

        return Inertia::render('servers/wizard', $this->wizardProps($team));
    }

    /**
     * Save a new server.
     */
    public function store(ServerRequest $request): RedirectResponse
    {
        $team = $request->team();

        $server = $team->servers()->create($this->attributes($request, $team));

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Server added.')]);

        return $this->afterSave($server);
    }

    /**
     * Show the wizard filled with an existing server.
     */
    public function edit(Server $server): Response
    {
        $this->authorize('manage', $server->team);

        return Inertia::render('servers/wizard', [
            ...$this->wizardProps($server->team),
            'server' => [
                'id' => $server->id,
                'name' => $server->name,
                'host' => $server->host,
                'port' => $server->port,
                'username' => $server->username,
                'auth_type' => $server->auth_type->value,
                'ssh_key_id' => $server->ssh_key_id,
                'server_category_id' => $server->server_category_id,
            ],
        ]);
    }

    /**
     * Update a server. An empty password keeps the stored one.
     */
    public function update(ServerRequest $request, Server $server): RedirectResponse
    {
        $attributes = $this->attributes($request, $server->team);

        if ($attributes['auth_type'] === ServerAuthType::Password->value && empty($attributes['password'])) {
            unset($attributes['password']);
        }

        $server->update($attributes);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Server updated.')]);

        return $this->afterSave($server);
    }

    /**
     * Delete a server.
     */
    public function destroy(Server $server): RedirectResponse
    {
        $this->authorize('manage', $server->team);

        $server->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Server deleted.')]);

        return to_route('servers.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function wizardProps(Team $team): array
    {
        return [
            'team' => $team->only('id', 'name'),
            'server' => null,
            'categories' => $team->serverCategories()->orderBy('name')->get(['id', 'name', 'color']),
            'sshKeys' => $team->sshKeys()->orderBy('name')->get(['id', 'name', 'algorithm', 'fingerprint', 'public_key']),
        ];
    }

    /**
     * Build the model attributes from the validated request.
     *
     * @return array<string, mixed>
     */
    private function attributes(ServerRequest $request, Team $team): array
    {
        $data = $request->validated();

        $categoryId = $data['server_category_id'] ?? null;

        if (filled($data['new_category'] ?? null)) {
            $categoryId = $team->serverCategories()
                ->firstOrCreate(['name' => trim($data['new_category'])])->id;
        }

        $usesPassword = $data['auth_type'] === ServerAuthType::Password->value;
        $usesKey = $data['auth_type'] === ServerAuthType::Key->value;

        return [
            'name' => $data['name'],
            'host' => $data['host'] ?? null,
            'port' => $data['port'] ?? 22,
            'username' => $data['username'] ?? null,
            'server_category_id' => $categoryId,
            'auth_type' => $data['auth_type'],
            'password' => $usesPassword ? ($data['password'] ?? null) : null,
            'ssh_key_id' => $usesKey ? $data['ssh_key_id'] : null,
        ];
    }

    /**
     * @return array<string, mixed>|null
     */
    private function presentMetric(?ServerMetric $metric): ?array
    {
        if ($metric === null) {
            return null;
        }

        return [
            'cpu_percent' => (float) $metric->cpu_percent,
            'memory_percent' => $metric->memory_total > 0
                ? round($metric->memory_used / $metric->memory_total * 100, 1)
                : 0,
            'disk_percent' => $metric->disks->max(fn (ServerMetricDisk $disk) => $disk->usedPercent()) ?? 0,
            'collected' => $metric->collected_at->diffForHumans(),
        ];
    }

    /**
     * A server with the agent needs its token, which is shown once on the install page.
     */
    private function afterSave(Server $server): RedirectResponse
    {
        if ($server->auth_type !== ServerAuthType::Agent) {
            $server->forceFill(['agent_token_hash' => null])->save();

            return to_route('servers.index');
        }

        if ($server->agent_token_hash === null) {
            session()->flash('agent_token', $server->issueAgentToken());
        }

        return to_route('servers.agent.show', $server);
    }

    private function needsTeam(): RedirectResponse
    {
        Inertia::flash('toast', ['type' => 'error', 'message' => __('Create a team first, servers belong to a team.')]);

        return to_route('teams.index');
    }
}
