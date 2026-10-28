<?php

namespace App\Http\Requests\Servers;

use App\Models\ServerCategory;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ServerCategoryRequest extends FormRequest
{
    public function authorize(): bool
    {
        $team = $this->route('serverCategory')?->team ?? $this->user()->currentTeam();

        return $team !== null && $this->user()->can('manage', $team);
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        $category = $this->route('serverCategory');
        $teamId = $category?->team_id ?? $this->user()->currentTeam()->id;

        return [
            'name' => [
                'required',
                'string',
                'max:100',
                Rule::unique('server_categories', 'name')->where('team_id', $teamId)->ignore($category),
            ],
            'color' => ['required', Rule::in(ServerCategory::COLORS)],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'name.unique' => __('A category with this name already exists.'),
        ];
    }
}
