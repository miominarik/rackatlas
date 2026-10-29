<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * @property int $id
 * @property int $user_id
 * @property int $team_id
 * @property int|null $device_id
 * @property array<string, mixed> $settings
 */
#[Fillable(['user_id', 'team_id', 'device_id', 'settings'])]
class DashboardPreference extends Model
{
    protected function casts(): array
    {
        return [
            'settings' => 'array',
        ];
    }
}
