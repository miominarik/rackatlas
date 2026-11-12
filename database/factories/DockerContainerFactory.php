<?php

namespace Database\Factories;

use App\Models\DockerContainer;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DockerContainer>
 */
class DockerContainerFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'container_id' => fake()->unique()->regexify('[a-f0-9]{12}'),
            'name' => fake()->unique()->word(),
            'image' => 'nginx:latest',
            'state' => 'running',
            'status' => 'Up 2 hours',
            'ports' => '0.0.0.0:80->80/tcp',
            'cpu_percent' => 1.5,
            'memory_bytes' => 52428800,
            'memory_limit_bytes' => 2147483648,
        ];
    }

    public function exited(): static
    {
        return $this->state([
            'state' => 'exited',
            'status' => 'Exited (0) 3 hours ago',
            'cpu_percent' => null,
            'memory_bytes' => null,
        ]);
    }
}
