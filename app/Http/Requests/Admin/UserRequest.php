<?php

namespace App\Http\Requests\Admin;

use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rules\Password;

class UserRequest extends FormRequest
{
    use ProfileValidationRules;

    public function authorize(): bool
    {
        return $this->user()->can('access-admin');
    }

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        /** @var User|null $target */
        $target = $this->route('user');

        return [
            ...$this->profileRules($target?->id),
            'password' => [$target ? 'nullable' : 'required', 'string', Password::default()],
            'is_admin' => ['required', 'boolean'],
            'email_verified' => ['required', 'boolean'],
        ];
    }
}
