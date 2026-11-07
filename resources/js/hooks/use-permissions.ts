import { usePage } from '@inertiajs/react';
import type { PermissionLevel } from '@/types';

const rank: Record<PermissionLevel, number> = { none: 0, view: 1, edit: 2 };

/**
 * What the signed-in user may do in the current team, asked as "servers.view" or "logs.edit".
 * Without a team there is nothing to hide.
 */
export function usePermissions() {
    const { permissions } = usePage<{
        permissions: Record<string, PermissionLevel> | null;
    }>().props;

    const can = (ability: string): boolean => {
        if (!permissions) {
            return true;
        }

        const [key, level = 'view'] = ability.split('.');

        return (
            rank[permissions[key] ?? 'none'] >= rank[level as PermissionLevel]
        );
    };

    return { can };
}
