<?php

namespace App\Http\Requests\Settings\Teams;

use App\Models\ApiToken;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreApiTokenRequest extends FormRequest
{
    /** The lifetimes a key can be given, in days. Empty means it never expires. */
    public const EXPIRY_DAYS = [30, 90, 365];

    /**
     * @return array<string, array<int, mixed>>
     */
    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'scopes' => ['required', 'array', 'min:1'],
            'scopes.*' => ['string', Rule::in(ApiToken::SCOPES)],
            'expires_in_days' => ['nullable', 'integer', Rule::in(self::EXPIRY_DAYS)],
        ];
    }
}
