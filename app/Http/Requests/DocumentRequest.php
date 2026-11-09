<?php

namespace App\Http\Requests;

use App\Enums\DocumentStatus;
use App\Support\DocumentTemplates;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class DocumentRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('document')?->team ?? $this->user()->currentTeam();

        return $team !== null && $this->user()->can('permit', [$team, 'docs.edit']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $teamId = $this->route('document')?->team_id ?? $this->user()->currentTeam()->id;
        $noPrivateKey = function (string $attribute, mixed $value, Closure $fail): void {
            if (is_string($value) && preg_match(DocumentTemplates::SECRET_PATTERN, $value)) {
                $fail(__('Do not store private keys here. Put them into a password manager and write only where they are.'));
            }
        };

        return [
            'template' => [$this->route('document') ? 'nullable' : 'required', Rule::in(DocumentTemplates::keys())],
            'title' => ['required', 'string', 'max:150'],
            'subject' => ['nullable', 'string', 'max:100'],
            'status' => ['required', Rule::enum(DocumentStatus::class)],
            'server_id' => ['nullable', 'integer', Rule::exists('servers', 'id')->where('team_id', $teamId)],
            'reviewed_at' => ['nullable', 'date'],
            'fields' => ['nullable', 'array'],
            'fields.*' => ['nullable', 'string', 'max:2000', $noPrivateKey],
            'sections' => ['nullable', 'array', 'max:30'],
            'sections.*.title' => ['required', 'string', 'max:120'],
            'sections.*.body' => ['nullable', 'string', 'max:20000', $noPrivateKey],
        ];
    }
}
