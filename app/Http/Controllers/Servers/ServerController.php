<?php

namespace App\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Http\Requests\Servers\ServerRequest;
use App\Models\Server;
use App\Models\ServerAlert;
use App\Models\ServerCategory;
use App\Models\ServerError;
use App\Models\ServerLog;
use App\Models\ServerMetric;
use App\Models\ServerMetricDisk;
use App\Models\Team;
use App\Support\DashboardSettings;
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
                        'provider' => $server->provider,
                        'country' => $server->country,
                        'host' => $server->host,
                        'port' => $server->port,
                        'username' => $server->username,
                        'auth_type' => $server->auth_type->value,
                        'uses_agent' => $server->collectsViaAgent(),
                        'agent_terminal' => $server->opensTerminalViaAgent(),
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
     * Everything the app knows about one server: its settings, current state, open problems and latest log entries.
     */
    public function show(Server $server): Response
    {
        $this->authorize('view', $server->team);

        $server->load(['category', 'sshKey', 'latestMetric.disks']);
        $metric = $server->latestMetric;

        return Inertia::render('servers/show', [
            'server' => [
                'id' => $server->id,
                'name' => $server->name,
                'provider' => $server->provider,
                'country' => $server->country,
                'host' => $server->host,
                'port' => $server->port,
                'username' => $server->username,
                'auth_type' => $server->auth_type->value,
                'uses_agent' => $server->collectsViaAgent(),
                'ssh_key_name' => $server->sshKey?->name,
                'ssh_host_fingerprint' => $server->ssh_host_fingerprint,
                'agent_version' => $server->agent_version,
                'status' => $server->status->value,
                'category' => $server->category?->only('id', 'name', 'color'),
                'failed_units' => $server->failed_units ?? [],
                'ignored_alerts' => $server->ignored_alerts ?? [],
                'system_info' => $server->system_info,
                'created_at' => $server->created_at?->toIso8601String(),
                'last_checked_at' => $server->last_checked_at?->toIso8601String(),
                'last_seen_at' => $server->last_seen_at?->toIso8601String(),
                'metrics' => $metric ? [
                    'collected_at' => $metric->collected_at->toIso8601String(),
                    'cpu_percent' => (float) $metric->cpu_percent,
                    'cpu_cores' => $metric->cpu_cores,
                    'load_1' => (float) $metric->load_1,
                    'load_5' => (float) $metric->load_5,
                    'load_15' => (float) $metric->load_15,
                    'memory_total' => $metric->memory_total,
                    'memory_used' => $metric->memory_used,
                    'swap_total' => $metric->swap_total,
                    'swap_used' => $metric->swap_used,
                    'uptime_seconds' => $metric->uptime_seconds,
                    'net_rx_bps' => $metric->net_rx_bps,
                    'net_tx_bps' => $metric->net_tx_bps,
                    'disks' => $metric->disks->map(fn (ServerMetricDisk $disk) => [
                        'mount' => $disk->mount,
                        'filesystem' => $disk->filesystem,
                        'total_bytes' => $disk->total_bytes,
                        'used_bytes' => $disk->used_bytes,
                    ])->values(),
                ] : null,
            ],
            'canManage' => request()->user()->can('manage', $server->team),
            'thresholds' => DashboardSettings::defaults()['thresholds'],
            'alerts' => $server->alerts()->latest('opened_at')->limit(10)->get()
                ->map(fn (ServerAlert $alert) => [
                    'id' => $alert->id,
                    'type' => $alert->type->value,
                    'key' => $alert->key,
                    'context' => $alert->context,
                    'opened_at' => $alert->opened_at->toIso8601String(),
                    'resolved_at' => $alert->resolved_at?->toIso8601String(),
                ]),
            'logs' => $server->logs()->open()->where('occurred_at', '>=', now()->subDays(7))->orderByDesc('occurred_at')->limit(10)->get()
                ->map(fn (ServerLog $log) => [
                    'id' => $log->id,
                    'server_id' => $log->server_id,
                    'server_name' => $server->name,
                    'level' => $log->level,
                    'source' => $log->source,
                    'message' => $log->message,
                    'count' => $log->count,
                    'occurred_at' => $log->occurred_at->toIso8601String(),
                ]),
            'errors' => $server->errors()->where('occurred_at', '>=', now()->subDays(7))->latest('occurred_at')->limit(10)->get()
                ->map(fn (ServerError $error) => [
                    'id' => $error->id,
                    'server_id' => $error->server_id,
                    'server_name' => $server->name,
                    'type' => $error->type->value,
                    'message' => $error->message,
                    'occurred_at' => $error->occurred_at->toIso8601String(),
                ]),
            'generated_at' => now()->toIso8601String(),
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
                'provider' => $server->provider,
                'country' => $server->country,
                'host' => $server->host,
                'port' => $server->port,
                'username' => $server->username,
                'auth_type' => $server->auth_type->value,
                'uses_agent' => $server->uses_agent,
                'agent_terminal' => $server->agent_terminal,
                'ssh_key_id' => $server->ssh_key_id,
                'server_category_id' => $server->server_category_id,
                'ssh_host_fingerprint' => $server->ssh_host_fingerprint,
                'ignored_alerts' => $server->ignored_alerts ?? [],
            ],
        ]);
    }

    /**
     * Forget the pinned host key, after the server was reinstalled. The next connection pins the new one.
     */
    public function forgetHostKey(Server $server): RedirectResponse
    {
        $this->authorize('manage', $server->team);

        $server->forceFill(['ssh_host_fingerprint' => null])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('The stored host key was reset.')]);

        return back();
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

        if ($server->host !== $attributes['host'] || (int) $server->port !== (int) $attributes['port']) {
            $server->ssh_host_fingerprint = null;
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

        $usesAgent = $data['auth_type'] === ServerAuthType::Agent->value || ($data['uses_agent'] ?? false);
        $usesPassword = $data['auth_type'] === ServerAuthType::Password->value;
        $usesKey = $data['auth_type'] === ServerAuthType::Key->value;

        return [
            'name' => $data['name'],
            'provider' => filled($data['provider'] ?? null) ? trim($data['provider']) : null,
            'country' => $data['country'] ?? null,
            'host' => $data['host'] ?? null,
            'port' => $data['port'] ?? 22,
            'username' => $data['username'] ?? null,
            'server_category_id' => $categoryId,
            'auth_type' => $data['auth_type'],
            'uses_agent' => $data['auth_type'] !== ServerAuthType::Agent->value && ($data['uses_agent'] ?? false),
            'agent_terminal' => $usesAgent && ($data['agent_terminal'] ?? false),
            'password' => $usesPassword ? ($data['password'] ?? null) : null,
            'ssh_key_id' => $usesKey ? $data['ssh_key_id'] : null,
            'ignored_alerts' => array_values(array_unique($data['ignored_alerts'] ?? [])) ?: null,
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
     * A server that sends its data through the agent needs its token, which is shown once on the install page.
     */
    private function afterSave(Server $server): RedirectResponse
    {
        if (! $server->collectsViaAgent()) {
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
