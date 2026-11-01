<?php

namespace App\Http\Requests\Storage;

use App\Models\StorageMonitor;
use App\Models\Team;
use Illuminate\Foundation\Http\FormRequest;

class StorageMonitorRequest extends FormRequest
{
    public function team(): ?Team
    {
        return $this->route('monitor')?->team ?? $this->user()->currentTeam();
    }

    public function authorize(): bool
    {
        $team = $this->team();

        return $team !== null && $this->user()->can('manage', $team);
    }

    /**
     * People paste the whole URL of the container or the token with a leading "?", both are fine.
     */
    protected function prepareForValidation(): void
    {
        $token = trim((string) $this->input('sas_token'));

        if (str_contains($token, '?')) {
            $token = substr($token, strpos($token, '?') + 1);
        }

        $this->merge([
            'account' => strtolower(trim((string) $this->input('account'))),
            'container' => strtolower(trim((string) $this->input('container'))),
            'sas_token' => $token === '' ? null : $token,
        ]);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $existing = $this->route('monitor') instanceof StorageMonitor;

        return [
            'name' => ['required', 'string', 'max:255'],
            'account' => ['required', 'string', 'regex:/^[a-z0-9]{3,24}$/'],
            'container' => ['required', 'string', 'regex:/^[a-z0-9](?:[a-z0-9]|-(?=[a-z0-9])){1,61}[a-z0-9]$/'],
            'check_interval' => ['required', 'integer', 'between:'.StorageMonitor::MIN_INTERVAL_MINUTES.','.StorageMonitor::MAX_INTERVAL_MINUTES],
            // An empty token keeps the stored one.
            'sas_token' => [$existing ? 'nullable' : 'required', 'string', 'max:2000', 'regex:/(^|&)sig=/'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'account.regex' => __('The name of a storage account has 3 to 24 lowercase letters and digits.'),
            'container.regex' => __('Enter the name of a container: 3 to 63 lowercase letters, digits and hyphens.'),
            'sas_token.regex' => __('This is not a SAS token. It looks like sv=2024-11-04&ss=b&sig=…'),
        ];
    }
}
