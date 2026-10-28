<?php

namespace App\Http\Requests\Servers;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreSshKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->user()->currentTeam();

        return $team !== null && $this->user()->can('manage', $team);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'mode' => ['required', Rule::in(['generate', 'import'])],
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('ssh_keys', 'name')->where('team_id', $this->user()->currentTeam()->id),
            ],
            'private_key' => ['required_if:mode,import', 'nullable', 'string', 'max:20000'],
            'passphrase' => ['nullable', 'string', 'max:1000'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => __('You already have a key with this name.'),
        ];
    }
}
