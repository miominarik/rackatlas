<?php

namespace App\Http\Requests\Settings\Teams;

use App\Enums\PermissionLevel;
use App\Enums\TeamRole;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTeamMemberRequest extends FormRequest
{
    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'role' => ['sometimes', 'required', Rule::enum(TeamRole::class)->only(TeamRole::assignable())],
            'permissions' => ['sometimes', 'array'],
            'permissions.*' => ['string', Rule::enum(PermissionLevel::class)],
        ];
    }
}
