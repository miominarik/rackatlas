<?php

namespace Database\Factories;

use App\Models\Backup;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Backup>
 */
class BackupFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'name' => fake()->words(2, true),
            'notes' => null,
            'is_active' => true,
            'expected_interval_hours' => 24,
        ];
    }
}
