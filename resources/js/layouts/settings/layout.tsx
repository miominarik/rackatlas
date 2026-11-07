import { Link } from '@inertiajs/react';
import type { LucideIcon } from 'lucide-react';
import {
    Bell,
    ChevronsUpDown,
    MonitorSmartphone,
    ShieldCheck,
    User,
    Users,
} from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useState } from 'react';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetTitle,
} from '@/components/ui/sheet';
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
    const [picking, setPicking] = useState(false);

    const current =
        items.find((item) => isCurrentOrParentUrl(item.href)) ?? items[0];

    return (
        <div className="mx-auto w-full max-w-[100rem] p-4 md:p-6">
            <div className="mb-4 space-y-1 lg:mb-8">
                <h1 className="text-2xl font-semibold">{t('Settings')}</h1>
                <p className="text-sm text-muted-foreground">
                    {t('Manage your profile and account settings')}
                </p>
            </div>

            <div className="grid gap-4 lg:gap-6">
                {/* Phones: the open section as a button that lists all the sections in a sheet. */}
                <div className="lg:hidden">
                    <button
                        type="button"
                        onClick={() => setPicking(true)}
                        aria-haspopup="dialog"
                        data-test="settings-section-picker"
                        className="flex w-full items-center gap-3 rounded-xl border bg-card p-3 text-left active:bg-muted"
                    >
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <current.icon className="size-5" />
                        </span>
                        <span className="min-w-0 flex-1">
                            <span className="block font-medium">
                                {t(current.title)}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                                {t(current.description)}
                            </span>
                        </span>
                        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                    </button>

                    <Sheet open={picking} onOpenChange={setPicking}>
                        <SheetContent
                            side="bottom"
                            className="max-h-[80svh] gap-0 overflow-y-auto rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
                        >
                            <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-muted" />
                            <SheetTitle className="px-5 pt-3 pb-1 text-base">
                                {t('Settings')}
                            </SheetTitle>
                            <SheetDescription className="sr-only">
                                {t('Manage your profile and account settings')}
                            </SheetDescription>
                            <nav
                                aria-label={t('Settings')}
                                className="space-y-4 p-4"
                            >
                                {groups.map((group) => (
                                    <div
                                        key={group.title}
                                        className="space-y-1"
                                    >
                                        <p className="px-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                                            {t(group.title)}
                                        </p>
                                        {group.items.map((item) => {
                                            const active = item === current;

                                            return (
                                                <Link
                                                    key={toUrl(item.href)}
                                                    href={item.href}
                                                    onClick={() =>
                                                        setPicking(false)
                                                    }
                                                    aria-current={
                                                        active
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={cn(
                                                        'flex items-center gap-3 rounded-xl p-2.5 active:bg-muted',
                                                        active && 'bg-muted',
                                                    )}
                                                >
                                                    <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                                        <item.icon className="size-5" />
                                                    </span>
                                                    <span className="min-w-0">
                                                        <span className="block text-sm font-medium">
                                                            {t(item.title)}
                                                        </span>
                                                        <span className="block text-xs text-muted-foreground">
                                                            {t(
                                                                item.description,
                                                            )}
                                                        </span>
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Computers: tabs under the heading. */}
                <nav
                    aria-label={t('Settings')}
                    className="hidden gap-1 border-b lg:flex"
                >
                    {items.map((item) => {
                        const active = item === current;

                        return (
                            <Link
                                key={toUrl(item.href)}
                                href={item.href}
                                aria-current={active ? 'page' : undefined}
                                className={cn(
                                    '-mb-px flex items-center gap-2 border-b-2 px-4 py-2.5 text-sm transition-colors',
                                    active
                                        ? 'border-primary font-medium text-foreground'
                                        : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground',
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
                </nav>

                <div className="min-w-0 space-y-4 lg:space-y-0 lg:divide-y">
                    {children}
                </div>
            </div>
        </div>
    );
}
