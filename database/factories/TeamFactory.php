<?php

namespace Database\Factories;

use App\Enums\TeamRole;
use App\Models\Team;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Team>
 */
class TeamFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => fake()->company(),
            'owner_id' => User::factory(),
        ];
    }

    /**
     * Attach the owner as a member with the owner role.
     */
    public function configure(): static
    {
        return $this->afterCreating(function (Team $team) {
            $team->members()->syncWithoutDetaching([
                $team->owner_id => ['role' => TeamRole::Owner->value],
            ]);
        });
    }
}
