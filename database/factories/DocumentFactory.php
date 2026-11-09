<?php

namespace Database\Factories;

use App\Enums\DocumentStatus;
use App\Models\Document;
use App\Models\Team;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Document>
 */
class DocumentFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'team_id' => Team::factory(),
            'template' => 'blank',
            'title' => fake()->sentence(3),
            'status' => DocumentStatus::Draft,
            'fields' => [],
            'sections' => [['title' => 'Notes', 'body' => fake()->paragraph()]],
        ];
    }

    public function current(): static
    {
        return $this->state(fn () => ['status' => DocumentStatus::Current, 'reviewed_at' => now()->toDateString()]);
    }
}
