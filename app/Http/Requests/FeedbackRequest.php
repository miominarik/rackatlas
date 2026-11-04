<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class FeedbackRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, array<int, string>>
     */
    public function rules(): array
    {
        return [
            'name' => ['nullable', 'string', 'max:80'],
            'email' => ['nullable', 'email', 'max:190'],
            'message' => ['required', 'string', 'min:10', 'max:2000'],
            // A honeypot: people never see this field, bots fill it in.
            'website' => ['nullable', 'max:0'],
        ];
    }
}
