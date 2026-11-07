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

    /**
     * A part of the app, as "servers.view" or "backups.edit". Members only get what was granted.
     */
    public function permit(User $user, Team $team, string $ability): bool
    {
        return $team->permits($user, $ability);
    }

    public function delete(User $user, Team $team): bool
    {
        return $team->owner_id === $user->id;
    }
}
