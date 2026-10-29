import { Link } from '@inertiajs/react';
import { LayoutGrid, ScrollText, Server, Settings } from 'lucide-react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as logsIndex } from '@/routes/logs';
import { edit as editProfile } from '@/routes/profile';
import { index as serversIndex } from '@/routes/servers';
import type { NavItem } from '@/types';

const tabs: (NavItem & { exact?: boolean })[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, exact: true },
    { title: 'Servers', href: serversIndex(), icon: Server },
    { title: 'Logs', href: logsIndex(), icon: ScrollText },
    { title: 'Settings', href: editProfile(), icon: Settings },
];

/**
 * Thumb-reach navigation for phones. Hidden from the `md` breakpoint up, where the sidebar takes over.
 */
export function MobileTabBar() {
    const { t } = useTranslation();
    const { currentUrl, isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const isActive = (tab: NavItem & { exact?: boolean }): boolean => {
        if (tab.title === 'Settings') {
            return currentUrl.startsWith('/app/settings');
        }

        return tab.exact
            ? isCurrentUrl(tab.href)
            : isCurrentOrParentUrl(tab.href);
    };

    return (
        <nav
            aria-label={t('Platform')}
            className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
        >
            <ul className="grid grid-cols-4">
                {tabs.map((tab) => {
                    const active = isActive(tab);

                    return (
                        <li key={tab.title}>
                            <Link
                                href={tab.href}
                                prefetch
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex min-h-14 flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors',
                                    active
                                        ? 'text-primary'
                                        : 'text-muted-foreground active:text-foreground',
                                )}
                            >
                                {tab.icon && <tab.icon className="size-5" />}
                                <span className="max-w-full truncate">
                                    {t(tab.title)}
                                </span>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </nav>
    );
}
