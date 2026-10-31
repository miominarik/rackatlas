import { Link, router } from '@inertiajs/react';
import { Download, LogOut, Settings, Shield } from 'lucide-react';
import {
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { UserInfo } from '@/components/user-info';
import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { useMobileNavigation } from '@/hooks/use-mobile-navigation';
import { logout } from '@/routes';
import { index as adminUsers } from '@/routes/admin/users';
import { edit } from '@/routes/profile';
import type { User } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    user: User;
};

export function UserMenuContent({ user }: Props) {
    const cleanup = useMobileNavigation();
    const { t } = useTranslation();
    const { canInstall, install } = useInstallPrompt();

    const handleLogout = () => {
        cleanup();
        router.flushAll();
    };

    return (
        <>
            <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <UserInfo user={user} showEmail={true} />
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                    <Link
                        className="block w-full cursor-pointer"
                        href={edit()}
                        prefetch
                        onClick={cleanup}
                    >
                        <Settings className="mr-2" />
                        {t('Settings')}
                    </Link>
                </DropdownMenuItem>
                {user.is_admin && (
                    <DropdownMenuItem asChild>
                        <Link
                            className="block w-full cursor-pointer"
                            href={adminUsers()}
                            onClick={cleanup}
                            data-test="admin-link"
                        >
                            <Shield className="mr-2" />
                            {t('Administration')}
                        </Link>
                    </DropdownMenuItem>
                )}
                {canInstall && (
                    <DropdownMenuItem
                        className="cursor-pointer"
                        onSelect={() => void install()}
                        data-test="install-app-button"
                    >
                        <Download className="mr-2" />
                        {t('Install app')}
                    </DropdownMenuItem>
                )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link
                    className="block w-full cursor-pointer"
                    href={logout()}
                    as="button"
                    onClick={handleLogout}
                    data-test="logout-button"
                >
                    <LogOut className="mr-2" />
                    {t('Log out')}
                </Link>
            </DropdownMenuItem>
        </>
    );
}
