import { Head, Link, usePoll } from '@inertiajs/react';
import { Database, Plus } from 'lucide-react';
import ServerController from '@/actions/App/Http/Controllers/Servers/ServerController';
import DatabaseController from '@/actions/App/Http/Controllers/DatabaseController';
import UsageBar from '@/components/dashboard/usage-bar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { formatUptime, timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index as databasesIndex } from '@/routes/databases';
import { index as teamsIndex } from '@/routes/teams';
import type { DatabaseSummary } from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    databases: DatabaseSummary[];
    generated_at: string;
};

const statusDot: Record<string, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    unknown: 'bg-zinc-400',
};

export default function Databases({
    team,
    canManage,
    databases,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();

    usePoll(30000, { only: ['databases', 'generated_at'] });

    if (!team) {
        return (
            <>
                <Head title={t('MySQL')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-xl font-semibold">
                        {t('Create a team first')}
                    </h1>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const statusLabel: Record<string, string> = {
        online: t('Online'),
        offline: t('Offline'),
        unknown: t('Not checked yet'),
    };

    return (
        <>
            <Head title={t('MySQL')} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('MySQL')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('MySQL servers of the team :team', {
                                team: team.name,
                            })}
                        </p>
                    </div>
                    {canManage && (
                        <Button asChild>
                            <Link href={ServerController.create()}>
                                <Plus className="size-4" />
                                {t('Add server')}
                            </Link>
                        </Button>
                    )}
                </div>

                {databases.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <Database className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {t('No MySQL servers yet')}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                'Add a server and choose the type MySQL database.',
                            )}
                        </p>
                    </div>
                ) : (
                    <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                        {databases.map((database) => (
                            <li
                                key={database.id}
                                className="space-y-4 rounded-xl border bg-card p-4"
                            >
                                <div className="flex items-center gap-3">
                                    <span
                                        title={statusLabel[database.status]}
                                        className={cn(
                                            'size-3 shrink-0 rounded-full',
                                            statusDot[database.status],
                                        )}
                                    />
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={DatabaseController.show(
                                                database.id,
                                            )}
                                            className="block truncate font-medium hover:underline"
                                        >
                                            {database.name}
                                        </Link>
                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                            {database.host}:{database.port}
                                            {database.metric?.version &&
                                                ` · ${database.metric.version}`}
                                        </p>
                                    </div>
                                </div>

                                {database.metric ? (
                                    <>
                                        <UsageBar
                                            label={t('Connections')}
                                            value={
                                                database.metric
                                                    .connections_percent
                                            }
                                            level={
                                                database.metric
                                                    .connections_percent >= 90
                                                    ? 'critical'
                                                    : database.metric
                                                            .connections_percent >=
                                                        75
                                                      ? 'warning'
                                                      : 'ok'
                                            }
                                            detail={`${database.metric.threads_connected}/${database.metric.max_connections}`}
                                        />
                                        <dl className="grid grid-cols-3 gap-2 text-sm">
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    {t('Queries/s')}
                                                </dt>
                                                <dd className="font-mono">
                                                    {database.metric
                                                        .queries_per_second ??
                                                        '–'}
                                                </dd>
                                            </div>
                                            <div>
                                                <dt className="text-xs text-muted-foreground">
                                                    {t('Uptime')}
                                                </dt>
                                                <dd className="font-mono">
                                                    {formatUptime(
                                                        database.metric
                                                            .uptime_seconds,
                                                        t,
                                                    )}
                                                </dd>
                                            </div>
                                        </dl>
                                    </>
                                ) : (
                                    <p className="text-sm text-muted-foreground">
                                        {database.last_checked_at
                                            ? t(
                                                  'No data yet. Last check :time.',
                                                  {
                                                      time: timeAgo(
                                                          database.last_checked_at,
                                                          generated_at,
                                                          locale,
                                                      ),
                                                  },
                                              )
                                            : t('Waiting for the first check…')}
                                    </p>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

Databases.layout = {
    breadcrumbs: [{ title: 'MySQL', href: databasesIndex() }],
};
