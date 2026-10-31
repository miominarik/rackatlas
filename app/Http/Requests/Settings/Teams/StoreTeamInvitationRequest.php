<?php

namespace App\Http\Requests\Settings\Teams;

use App\Enums\TeamRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTeamInvitationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->can('manage', $this->route('team'));
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $team = $this->route('team');

        return [
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('team_invitations', 'email')->where('team_id', $team->id),
                function (string $attribute, mixed $value, \Closure $fail) use ($team) {
                    if ($team->members()->where('email', $value)->exists()) {
                        $fail(__('This person is already a member of the team.'));
                    }
                },
            ],
            'role' => ['required', Rule::enum(TeamRole::class)->only(TeamRole::assignable())],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'email.unique' => __('This email has already been invited.'),
        ];
    }
}
