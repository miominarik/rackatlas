<?php

namespace Database\Factories;

use App\Models\ApiToken;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApiToken>
 */
class ApiTokenFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name' => fake()->words(2, true),
            'token_hash' => hash('sha256', fake()->unique()->sha256()),
            'abilities' => ApiToken::SCOPES,
            'expires_at' => null,
        ];
    }
}
