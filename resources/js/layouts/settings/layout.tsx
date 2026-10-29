import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bell,
    MonitorSmartphone,
    ShieldCheck,
    User,
    Users,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { cn, toUrl } from '@/lib/utils';
import { index as devicesIndex } from '@/routes/devices';
import { edit as editNotifications } from '@/routes/notifications';
import { edit } from '@/routes/profile';
import { edit as editSecurity } from '@/routes/security';
import { index as teamsIndex } from '@/routes/teams';
import type { NavItem } from '@/types';

type SettingsItem = NavItem & {
    icon: LucideIcon;
    description: string;
};

const groups: { title: string; items: SettingsItem[] }[] = [
    {
        title: 'Account',
        items: [
            {
                title: 'Profile',
                href: edit(),
                icon: User,
                description: 'Your name, email, appearance and language',
            },
            {
                title: 'Security',
                href: editSecurity(),
                icon: ShieldCheck,
                description: 'Password, two-factor authentication and passkeys',
            },
            {
                title: 'Devices',
                href: devicesIndex(),
                icon: MonitorSmartphone,
                description:
                    'Where you are signed in and the layout of each device',
            },
        ],
    },
    {
        title: 'Workspace',
        items: [
            {
                title: 'Teams',
                href: teamsIndex(),
                icon: Users,
                description: 'Your teams, their members and invitations',
            },
            {
                title: 'Notifications',
                href: editNotifications(),
                icon: Bell,
                description:
                    'Get a message when something is wrong on your servers.',
            },
        ],
    },
];

const items = groups.flatMap((group) => group.items);

export default function SettingsLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useTranslation();
    const tabs = useRef<HTMLElement>(null);

    const current =
        items.find((item) => isCurrentOrParentUrl(item.href)) ?? items[0];

    // On a phone the tab bar scrolls sideways, keep the open page in view.
    useEffect(() => {
        const active = tabs.current?.querySelector<HTMLElement>(
            '[aria-current="page"]',
        );

        active?.scrollIntoView({ inline: 'center', block: 'nearest' });
    }, [current.title]);

    return (
        <div className="mx-auto w-full max-w-[100rem] p-4 md:p-6">
            <div className="mb-4 space-y-1 lg:mb-8">
                <h1 className="text-2xl font-semibold">{t('Settings')}</h1>
                <p className="text-sm text-muted-foreground">
                    {t('Manage your profile and account settings')}
                </p>
            </div>

            <div className="grid gap-4 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-10">
                {/* Phones: one row of tabs that stays below the top bar while scrolling. */}
                <nav
                    ref={tabs}
                    aria-label={t('Settings')}
                    className="sticky top-14 z-10 -mx-4 flex [scrollbar-width:none] gap-1.5 overflow-x-auto border-b bg-background/95 px-4 py-2 backdrop-blur md:-mx-6 md:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
                >
                    {items.map((item) => {
                        const active = item === current;

                        return (
                            <Link
                                key={toUrl(item.href)}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    'flex shrink-0 items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-colors',
                                    active
                                        ? 'bg-primary/10 font-medium text-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                                )}
                            >
                                <item.icon className="size-4" />
                                {t(item.title)}
                            </Link>
                        );
                    })}
                </nav>

                {/* Computers: grouped list at the left. */}
                <aside className="hidden lg:block">
                    <nav
                        aria-label={t('Settings')}
                        className="sticky top-24 space-y-6"
                    >
                        {groups.map((group) => (
                            <div key={group.title} className="space-y-1">
                                <p className="px-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                    {t(group.title)}
                                </p>
                                {group.items.map((item) => {
                                    const active = item === current;

                                    return (
                                        <Link
                                            key={toUrl(item.href)}
                                            href={item.href}
                                            aria-current={
                                                active ? 'page' : undefined
                                            }
                                            className={cn(
                                                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                                                active
                                                    ? 'bg-muted font-medium text-foreground'
                                                    : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                            )}
                                        >
                                            <item.icon
                                                className={cn(
                                                    'size-4',
                                                    active && 'text-primary',
                                                )}
                                            />
                                            {t(item.title)}
                                        </Link>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>
                </aside>

                <div className="max-w-4xl min-w-0 space-y-4 lg:space-y-6">
                    <p className="text-sm text-muted-foreground lg:hidden">
                        {t(current.description)}
                    </p>

                    <div className="hidden items-center gap-3 lg:flex">
                        <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                            <current.icon className="size-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">
                                {t(current.title)}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                {t(current.description)}
                            </p>
                        </div>
                    </div>

                    {children}
                </div>
            </div>
        </div>
    );
}
