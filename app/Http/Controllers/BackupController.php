<?php

namespace App\Http\Controllers;

use App\Http\Requests\BackupRequest;
use App\Models\Backup;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class BackupController extends Controller
{
    public function index(Request $request): Response
    {
        $team = $request->user()->currentTeam();

        return Inertia::render('backups/index', [
            'team' => $team?->only('id', 'name'),
            'canManage' => $team !== null && $request->user()->can('permit', [$team, 'backups.edit']),
            'servers' => $team ? $team->servers()->orderBy('name')->get(['id', 'name']) : [],
            'backups' => $team
                ? $team->backups()->with('server:id,name')->orderBy('name')->get()
                    ->map(fn (Backup $backup) => $this->present($backup))
                : [],
        ]);
    }

    public function store(BackupRequest $request): RedirectResponse
    {
        $request->user()->currentTeam()->backups()->create($request->validated());

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Backup created.')]);

        return back();
    }

    public function update(BackupRequest $request, Backup $backup): RedirectResponse
    {
        $backup->fill($request->validated());

        if ($backup->isDirty('is_active')) {
            $backup->alerted_at = null;
            $backup->resumed_at = $backup->is_active ? now() : $backup->resumed_at;
        }

        $backup->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Backup updated.')]);

        return back();
    }

    public function regenerate(Backup $backup): RedirectResponse
    {
        $this->authorize('permit', [$backup->team, 'backups.edit']);

        $backup->forceFill(['token' => Backup::newToken()])->save();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Webhook URL regenerated.')]);

        return back();
    }

    public function destroy(Backup $backup): RedirectResponse
    {
        $this->authorize('permit', [$backup->team, 'backups.edit']);

        $backup->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Backup deleted.')]);

        return back();
    }

    /**
     * @return array<string, mixed>
     */
    private function present(Backup $backup): array
    {
        return [
            'id' => $backup->id,
            'name' => $backup->name,
            'notes' => $backup->notes,
            'is_active' => $backup->is_active,
            'server_id' => $backup->server_id,
            'server_name' => $backup->server?->name,
            'expected_interval_hours' => $backup->expected_interval_hours,
            'webhook_url' => route('webhooks.backups', $backup->token),
            'last_run_at' => $backup->last_run_at?->toIso8601String(),
            'last_status' => $backup->last_status,
            'last_message' => $backup->last_message,
            'last_size_bytes' => $backup->last_size_bytes,
            'overdue' => $backup->isOverdue(),
        ];
    }
}
