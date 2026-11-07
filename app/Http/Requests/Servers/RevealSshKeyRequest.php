<?php

namespace App\Http\Requests\Servers;

use Illuminate\Foundation\Http\FormRequest;

class RevealSshKeyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('permit', [$this->route('sshKey')->team, 'ssh_keys.edit']);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'password' => ['required', 'string', 'current_password'],
        ];
    }
}
