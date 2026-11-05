<?php

namespace Database\Factories;

use App\Models\ServerService;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ServerService>
 */
class ServerServiceFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'unit' => fake()->unique()->word().'.service',
            'description' => fake()->sentence(3),
            'active_state' => 'active',
            'sub_state' => 'running',
            'unit_file_state' => 'enabled',
        ];
    }
}
