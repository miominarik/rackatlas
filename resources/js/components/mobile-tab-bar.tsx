import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    ChevronUp,
    Database,
    DatabaseBackup,
    KeyRound,
    Layers,
    LayoutGrid,
    LogOut,
    Map as MapIcon,
    ScrollText,
    Server,
    Settings,
    Shield,
    SquareTerminal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { dashboard, logout, map as mapRoute, terminal } from '@/routes';
import { index as adminIndex } from '@/routes/admin';
import { index as applicationsIndex } from '@/routes/applications';
import { index as backupsIndex } from '@/routes/backups';
import { index as databasesIndex } from '@/routes/databases';
import { index as documentsIndex } from '@/routes/documents';
import { index as logsIndex } from '@/routes/logs';
import { index as metricsIndex } from '@/routes/metrics';
import { edit as editProfile } from '@/routes/profile';
import { index as serversIndex } from '@/routes/servers';
import { index as sshKeysIndex } from '@/routes/ssh-keys';
import type { Auth, NavItem } from '@/types';

type Tab = NavItem & { icon: LucideIcon; exact?: boolean };

const tabs: Tab[] = [
    { title: 'Dashboard', href: dashboard(), icon: LayoutGrid, exact: true },
    { title: 'Servers', href: serversIndex(), icon: Server },
    { title: 'Metrics', href: metricsIndex(), icon: Activity },
    { title: 'Logs', href: logsIndex(), icon: ScrollText },
];

/** Everything else the sidebar offers, shown in the sheet behind the "More" tab. */
const moreItems: Tab[] = [
    { title: 'Map', permission: 'map.view', href: mapRoute(), icon: MapIcon },
    {
        title: 'Terminal',
        permission: 'terminal.edit',
        href: terminal(),
        icon: SquareTerminal,
    },
    {
        title: 'Applications',
        permission: 'applications.view',
        href: applicationsIndex(),
        icon: Layers,
    },
    {
        title: 'Backups',
        permission: 'backups.view',
        href: backupsIndex(),
        icon: DatabaseBackup,
    },
    {
        title: 'MySQL',
        permission: 'databases.view',
        href: databasesIndex(),
        icon: Database,
    },
    {
        title: 'SSH keys',
        permission: 'ssh_keys.view',
        href: sshKeysIndex(),
        icon: KeyRound,
    },
    {
        title: 'Documentation',
        permission: 'docs.view',
        href: documentsIndex(),
        icon: BookOpen,
    },
    { title: 'Settings', href: editProfile(), icon: Settings },
];

const tabClass =
    'flex min-h-14 w-full flex-col items-center justify-center gap-1 px-1 text-[11px] font-medium transition-colors';

/**
 * Thumb-reach navigation for phones. Hidden from the `md` breakpoint up, where the sidebar takes over.
 */
export function MobileTabBar() {
    const { t } = useTranslation();
    const { url, props } = usePage<{ auth: Auth }>();
    const { currentUrl, isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const { can } = usePermissions();
    const [open, setOpen] = useState(false);

    const isActive = (tab: Tab): boolean =>
        tab.exact ? isCurrentUrl(tab.href) : isCurrentOrParentUrl(tab.href);

    const items: Tab[] = [
        ...moreItems.filter((item) => !item.permission || can(item.permission)),
        ...(props.auth.user.is_admin
            ? [{ title: 'Administration', href: adminIndex(), icon: Shield }]
            : []),
    ];
    const moreActive = items.some((item) =>
        item.title === 'Settings'
            ? currentUrl.startsWith('/app/settings')
            : isCurrentOrParentUrl(item.href),
    );

    return (
        <>
            <nav
                aria-label={t('Platform')}
                className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden"
            >
                <ul className="grid grid-cols-5">
                    {tabs.map((tab) => {
                        const active = isActive(tab);

                        return (
                            <li key={tab.title}>
                                <Link
                                    href={tab.href}
                                    prefetch
                                    aria-current={active ? 'page' : undefined}
                                    className={cn(
                                        tabClass,
                                        active
                                            ? 'text-primary'
                                            : 'text-muted-foreground active:text-foreground',
                                    )}
                                >
                                    <tab.icon className="size-5" />
                                    <span className="max-w-full truncate">
                                        {t(tab.title)}
                                    </span>
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <button
                            type="button"
                            onClick={() => setOpen(true)}
                            aria-haspopup="dialog"
                            aria-expanded={open}
                            data-test="mobile-more-button"
                            className={cn(
                                tabClass,
                                moreActive
                                    ? 'text-primary'
                                    : 'text-muted-foreground active:text-foreground',
                            )}
                        >
                            <ChevronUp className="size-5" />
                            <span className="max-w-full truncate">
                                {t('More')}
                            </span>
                        </button>
                    </li>
                </ul>
            </nav>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className="max-h-[60svh] gap-0 overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)] md:hidden"
                >
                    <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
                    <SheetTitle className="px-5 pt-3 pb-1 text-base">
                        {t('More')}
                    </SheetTitle>
                    <SheetDescription className="sr-only">
                        {t('Other sections of the app')}
                    </SheetDescription>

                    <ul className="grid grid-cols-3 gap-2 p-4">
                        {items.map((item) => (
                            <li key={item.title}>
                                <Link
                                    href={item.href}
                                    prefetch
                                    onClick={() => setOpen(false)}
                                    className={cn(
                                        'flex h-full flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-xs font-medium active:bg-muted',
                                        url.startsWith(
                                            typeof item.href === 'string'
                                                ? item.href
                                                : item.href.url,
                                        ) && 'border-primary/50 text-primary',
                                    )}
                                >
                                    <item.icon className="size-6" />
                                    {t(item.title)}
                                </Link>
                            </li>
                        ))}
                        <li>
                            <Link
                                href={logout()}
                                as="button"
                                onClick={() => {
                                    setOpen(false);
                                    router.flushAll();
                                }}
                                className="flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center text-xs font-medium active:bg-muted"
                            >
                                <LogOut className="size-6" />
                                {t('Log out')}
                            </Link>
                        </li>
                    </ul>
                </SheetContent>
            </Sheet>
        </>
    );
}
