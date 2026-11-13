<?php

namespace Database\Factories;

use App\Models\FcmToken;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<FcmToken>
 */
class FcmTokenFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $token = fake()->unique()->sha256().':'.fake()->sha256();

        return [
            'user_id' => User::factory(),
            'token_hash' => FcmToken::hashToken($token),
            'token' => $token,
            'name' => 'RackAtlas app · Android',
        ];
    }
}
