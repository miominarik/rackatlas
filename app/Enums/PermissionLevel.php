<?php

namespace App\Enums;

enum PermissionLevel: string
{
    case None = 'none';
    case View = 'view';
    case Edit = 'edit';

    /**
     * Edit includes view, view includes nothing.
     */
    public function rank(): int
    {
        return match ($this) {
            self::None => 0,
            self::View => 1,
            self::Edit => 2,
        };
    }

    public function atLeast(self $required): bool
    {
        return $this->rank() >= $required->rank();
    }
}
