<?php

namespace App\Enums;

/**
 * What a team member may do in one part of the app. Owners and admins may do everything,
 * a member gets the level that is set for the member, otherwise the default of the permission.
 */
enum TeamPermission: string
{
    case Servers = 'servers';
    case Terminal = 'terminal';
    case Applications = 'applications';
    case Docker = 'docker';
    case Metrics = 'metrics';
    case Logs = 'logs';
    case Backups = 'backups';
    case SshKeys = 'ssh_keys';
    case Databases = 'databases';
    case DatabaseKill = 'database_kill';
    case Redis = 'redis';
    case Docs = 'docs';

    /**
     * The levels that make sense for the permission. Some are a switch: allowed or not.
     *
     * @return array<int, PermissionLevel>
     */
    public function levels(): array
    {
        return match ($this) {
            self::Terminal, self::DatabaseKill => [PermissionLevel::None, PermissionLevel::Edit],
            default => [PermissionLevel::None, PermissionLevel::View, PermissionLevel::Edit],
        };
    }

    /**
     * What a member can do when nothing is set: look at everything, change and run nothing.
     */
    public function defaultLevel(): PermissionLevel
    {
        return match ($this) {
            self::Terminal, self::DatabaseKill => PermissionLevel::None,
            default => PermissionLevel::View,
        };
    }

    /**
     * @return array<string, PermissionLevel>
     */
    public static function defaults(): array
    {
        $defaults = [];

        foreach (self::cases() as $permission) {
            $defaults[$permission->value] = $permission->defaultLevel();
        }

        return $defaults;
    }

    /**
     * Keep only known permissions with a level that is allowed for them.
     *
     * @param  array<string, mixed>|null  $input
     * @return array<string, string>
     */
    public static function sanitize(?array $input): array
    {
        $clean = [];

        foreach (self::cases() as $permission) {
            $level = PermissionLevel::tryFrom((string) ($input[$permission->value] ?? ''));

            if ($level !== null && in_array($level, $permission->levels(), true)) {
                $clean[$permission->value] = $level->value;
            }
        }

        return $clean;
    }
}
