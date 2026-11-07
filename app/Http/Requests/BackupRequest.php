<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class BackupRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('backup')?->team ?? $this->user()->currentTeam();

        return $team !== null && $this->user()->can('permit', [$team, 'backups.edit']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $teamId = $this->route('backup')?->team_id ?? $this->user()->currentTeam()->id;

        return [
            'name' => ['required', 'string', 'max:100'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'is_active' => ['sometimes', 'boolean'],
            'server_id' => ['nullable', 'integer', Rule::exists('servers', 'id')->where('team_id', $teamId)],
            'expected_interval_hours' => ['nullable', 'integer', 'min:1', 'max:8760'],
        ];
    }
}
