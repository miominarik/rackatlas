<?php

namespace App\Http\Controllers\Servers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Servers\StoreSshKeyRequest;
use App\Models\SshKey;
use App\Services\Ssh\SshKeyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use InvalidArgumentException;
use Inertia\Inertia;
use Inertia\Response;

class SshKeyController extends Controller
{
    /**
     * List the SSH keys of the current team.
     */
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        return Inertia::render('servers/ssh-keys', [
            'team' => $team?->only('id', 'name'),
            'canManage' => $team !== null && $request->user()->can('manage', $team),
            'sshKeys' => $team
                ? $team->sshKeys()->withCount('servers')->orderBy('name')->get()
                    ->map(fn (SshKey $key) => [...$this->present($key), 'servers_count' => $key->servers_count])
                : [],
        ]);
    }

    /**
     * Generate a new key pair or import an existing private key.
     */
    public function store(StoreSshKeyRequest $request, SshKeyService $keys): JsonResponse
    {
        $team = $request->user()->currentTeam();
        $data = $request->validated();
        $comment = 'rackatlas-'.Str::slug($data['name']);

        try {
            $details = $data['mode'] === 'generate'
                ? $keys->generate($comment)
                : $keys->import($data['private_key'], $data['passphrase'] ?? null, $comment);
        } catch (InvalidArgumentException $e) {
            throw ValidationException::withMessages(['private_key' => __($e->getMessage())]);
        }

        if ($team->sshKeys()->where('fingerprint', $details['fingerprint'])->exists()) {
            throw ValidationException::withMessages(['private_key' => __('This key has already been added.')]);
        }

        $key = $team->sshKeys()->create([
            ...$details,
            'name' => $data['name'],
            'passphrase' => $data['mode'] === 'import' ? ($data['passphrase'] ?? null) : null,
        ]);

        return response()->json(['key' => $this->present($key)], 201);
    }

    /**
     * Delete a key that no server uses.
     */
    public function destroy(SshKey $sshKey): RedirectResponse
    {
        $this->authorize('manage', $sshKey->team);

        if ($sshKey->servers()->exists()) {
            Inertia::flash('toast', ['type' => 'error', 'message' => __('This key is used by a server. Change the server first.')]);

            return to_route('ssh-keys.index');
        }

        $sshKey->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('SSH key deleted.')]);

        return to_route('ssh-keys.index');
    }

    /**
     * @return array<string, mixed>
     */
    private function present(SshKey $key): array
    {
        return [
            'id' => $key->id,
            'name' => $key->name,
            'algorithm' => $key->algorithm,
            'fingerprint' => $key->fingerprint,
            'public_key' => $key->public_key,
        ];
    }
}
