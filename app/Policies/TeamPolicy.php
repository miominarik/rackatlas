<?php

namespace App\Policies;

use App\Models\Team;
use App\Models\User;

class TeamPolicy
{
    public function view(User $user, Team $team): bool
    {
        return $team->roleOf($user) !== null;
    }

    public function manage(User $user, Team $team): bool
    {
        return $team->roleOf($user)?->canManage() ?? false;
    }

    public function delete(User $user, Team $team): bool
    {
        return $team->owner_id === $user->id;
    }
}
