<?php

namespace App\Http\Controllers\Servers;

use App\Enums\ServerAuthType;
use App\Http\Controllers\Controller;
use App\Models\Server;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ServerAgentController extends Controller
{
    /**
     * Install instructions of a server with the agent. The token is only known right after it was created.
     */
    public function show(Request $request, Server $server): Response
    {
        $this->authorizeAgentServer($server);

        $token = $request->session()->get('agent_token');
        $base = $request->getSchemeAndHttpHost();

        return Inertia::render('servers/agent', [
            'server' => [
                'id' => $server->id,
                'name' => $server->name,
                'status' => $server->status->value,
                'last_seen_at' => $server->last_seen_at?->toIso8601String(),
                'agent_version' => $server->agent_version,
            ],
            'install_command' => $token
                ? "curl -fsSL {$base}/agent/install.sh | sudo bash -s -- --url {$base} --token {$token}"
                : null,
            'manual_command' => $token ? $this->manualCommand($base, $token) : null,
            'update_command' => 'sudo apt update && sudo apt install --only-upgrade rackatlas-agent',
            'base_url' => $base,
            'generated_at' => now()->toIso8601String(),
        ]);
    }

    /**
     * Replace the token, for example when it leaked. The old one stops working at once.
     */
    public function rotate(Server $server): RedirectResponse
    {
        $this->authorizeAgentServer($server);

        session()->flash('agent_token', $server->issueAgentToken());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('A new token was created. The old one no longer works.')]);

        return to_route('servers.agent.show', $server);
    }

    /**
     * The same installation as the installer script, step by step with apt. The token goes
     * through standard input, so it does not show up in the list of processes.
     */
    private function manualCommand(string $base, string $token): string
    {
        return <<<SH
        sudo mkdir -p /etc/apt/keyrings
        sudo curl -fsSL {$base}/apt/rackatlas.gpg -o /etc/apt/keyrings/rackatlas.gpg
        echo "deb [signed-by=/etc/apt/keyrings/rackatlas.gpg] {$base}/apt stable main" | sudo tee /etc/apt/sources.list.d/rackatlas.list
        sudo apt update && sudo apt install -y rackatlas-agent
        sudo tee /etc/rackatlas-agent/agent.conf >/dev/null <<'EOF'
        URL={$base}
        TOKEN={$token}
        EOF
        sudo systemctl enable --now rackatlas-agent.timer && sudo systemctl start rackatlas-agent.service
        SH;
    }

    private function authorizeAgentServer(Server $server): void
    {
        $this->authorize('manage', $server->team);

        abort_unless($server->auth_type === ServerAuthType::Agent, 404);
    }
}
