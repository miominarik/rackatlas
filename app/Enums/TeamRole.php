<?php

namespace App\Enums;

enum TeamRole: string
{
    case Owner = 'owner';
    case Admin = 'admin';
    case Member = 'member';

    /**
     * Roles that can be handed out through an invitation or a role change.
     *
     * @return array<int, self>
     */
    public static function assignable(): array
    {
        return [self::Admin, self::Member];
    }

    public function canManage(): bool
    {
        return $this === self::Owner || $this === self::Admin;
    }
}
