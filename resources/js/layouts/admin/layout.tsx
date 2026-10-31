import { Link } from '@inertiajs/react';
import { Gauge, History, Shield, Users, UsersRound } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as activityIndex } from '@/routes/admin/activity';
import { index as teamsIndex } from '@/routes/admin/teams';
import { index as usersIndex } from '@/routes/admin/users';

const tabs = [
    { title: 'Users', href: usersIndex(), icon: Users },
    { title: 'Teams', href: teamsIndex(), icon: UsersRound },
    { title: 'Activity log', href: activityIndex(), icon: History },
];

export default function AdminLayout({ children }: PropsWithChildren) {
    const { isCurrentOrParentUrl } = useCurrentUrl();
    const { t } = useTranslation();

    return (
        <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Shield className="size-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">
                        {t('Administration')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('Manage all users and teams of the application')}
                    </p>
                </div>
            </div>

            <nav
                aria-label={t('Administration')}
                className="flex gap-1.5 border-b pb-2"
            >
                {tabs.map((tab) => {
                    const active = isCurrentOrParentUrl(tab.href);

                    return (
                        <Link
                            key={tab.title}
                            href={tab.href}
                            aria-current={active ? 'page' : undefined}
                            className={cn(
                                'flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm transition-colors',
                                active
                                    ? 'bg-primary/10 font-medium text-primary'
                                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                            )}
                        >
                            <tab.icon className="size-4" />
                            {t(tab.title)}
                        </Link>
                    );
                })}
                {/* Pulse is a separate Livewire page, so it is a plain link, not an Inertia visit. */}
                <a
                    href="/app/admin/pulse"
                    className="flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                    <Gauge className="size-4" />
                    {t('Application monitoring')}
                </a>
            </nav>

            {children}
        </div>
    );
}
