import { Head, router } from '@inertiajs/react';
import { Search } from 'lucide-react';
import { useState } from 'react';
import ActivityController from '@/actions/App/Http/Controllers/Admin/ActivityController';
import Pagination from '@/components/admin/pagination';
import type { Paginated } from '@/components/admin/pagination';
import { SettingsSection } from '@/components/settings/section';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Activity = {
    id: number;
    log: string | null;
    event: string | null;
    causer: { id: number; name: string; email: string } | null;
    subject_type: string | null;
    subject_id: number | null;
    subject_label: string | null;
    changes: {
        attributes?: Record<string, unknown>;
        old?: Record<string, unknown>;
    } | null;
    properties: Record<string, unknown> | null;
    created_at: string | null;
};

type Props = {
    activities: Paginated<Activity>;
    filters: { log: string | null; search: string };
    logs: string[];
};

const eventLabels: Record<string, string> = {
    created: 'Created',
    updated: 'Updated',
    deleted: 'Deleted',
    login: 'Signed in',
    logout: 'Signed out',
    'login-failed': 'Failed sign-in attempt',
    'password-reset': 'Password reset',
    'signed-out': 'Signed out on all devices',
    'two-factor-reset': 'Two-factor authentication reset',
    'ownership-transferred': 'Ownership transferred',
    'member-added': 'Member added',
    'member-role-changed': 'Member role changed',
    'member-removed': 'Member removed',
};

const logLabels: Record<string, string> = {
    auth: 'Sign-ins',
    admin: 'Administration',
    user: 'Users',
    team: 'Teams',
    server: 'Servers',
    'ssh-key': 'SSH keys',
    category: 'Categories',
};

const show = (value: unknown) =>
    value === null || value === undefined || value === '' ? '—' : String(value);

export default function AdminActivity({ activities, filters, logs }: Props) {
    const { t, locale } = useTranslation();
    const [search, setSearch] = useState(filters.search);

    const visit = (next: Partial<Props['filters']>) =>
        router.get(
            ActivityController.index.url(),
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );

    return (
        <>
            <Head title={t('Activity log')} />

            <SettingsSection
                flush
                title={t('Activity log')}
                description={t(
                    'Who did what and when. Old records are deleted after a year.',
                )}
            >
                <div className="flex flex-wrap items-center gap-3 border-b p-4 sm:px-6">
                    <form
                        className="relative min-w-56 flex-1"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ search });
                        }}
                    >
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('Search by user')}
                            className="pl-9"
                        />
                    </form>
                    <div className="flex flex-wrap gap-1.5">
                        {[null, ...logs].map((log) => (
                            <button
                                key={log ?? 'all'}
                                type="button"
                                onClick={() => visit({ log })}
                                className={cn(
                                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                                    filters.log === log
                                        ? 'bg-primary/10 font-medium text-primary'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {log ? t(logLabels[log] ?? log) : t('All')}
                            </button>
                        ))}
                    </div>
                </div>

                {activities.data.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                        {t('No activity yet')}
                    </p>
                ) : (
                    <ul className="divide-y">
                        {activities.data.map((activity) => {
                            const changes = activity.changes?.attributes ?? {};
                            const old = activity.changes?.old ?? {};
                            const props = activity.properties ?? {};

                            return (
                                <li
                                    key={activity.id}
                                    className="space-y-1 p-4 sm:px-6"
                                >
                                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                        <Badge variant="secondary">
                                            {t(
                                                logLabels[activity.log ?? ''] ??
                                                    activity.log ??
                                                    '',
                                            )}
                                        </Badge>
                                        <span className="font-medium">
                                            {t(
                                                eventLabels[
                                                    activity.event ?? ''
                                                ] ??
                                                    activity.event ??
                                                    '',
                                            )}
                                        </span>
                                        {activity.subject_type &&
                                            activity.log !== 'auth' && (
                                                <span className="text-sm">
                                                    {activity.subject_type}
                                                    {activity.subject_label &&
                                                        ` · ${activity.subject_label}`}
                                                </span>
                                            )}
                                        <time className="ml-auto text-xs text-muted-foreground">
                                            {activity.created_at &&
                                                new Date(
                                                    activity.created_at,
                                                ).toLocaleString(locale)}
                                        </time>
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {activity.causer
                                            ? `${activity.causer.name} (${activity.causer.email})`
                                            : t('System')}
                                        {typeof props.ip === 'string' &&
                                            ` · ${props.ip}`}
                                        {typeof props.email === 'string' &&
                                            ` · ${props.email}`}
                                        {typeof props.member === 'string' &&
                                            ` · ${props.member}`}
                                    </p>
                                    {activity.event === 'updated' &&
                                        Object.keys(changes).length > 0 && (
                                            <ul className="text-xs text-muted-foreground">
                                                {Object.keys(changes).map(
                                                    (key) => (
                                                        <li key={key}>
                                                            <span className="font-mono">
                                                                {key}
                                                            </span>
                                                            : {show(old[key])} →{' '}
                                                            {show(changes[key])}
                                                        </li>
                                                    ),
                                                )}
                                            </ul>
                                        )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                <Pagination page={activities} />
            </SettingsSection>
        </>
    );
}
