import { Head, Link } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import UsageBar from '@/components/dashboard/usage-bar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, formatUptime, timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index as databasesIndex } from '@/routes/databases';
import { edit } from '@/routes/servers';
import type { DatabaseSummary } from '@/types';

type HistoryPoint = {
    at: string;
    queries_per_second: number | null;
    threads_connected: number;
    threads_running: number;
};

type Props = {
    database: DatabaseSummary & {
        username: string;
        last_seen_at: string | null;
    };
    canManage: boolean;
    history: HistoryPoint[];
    errors: { id: number; type: string; message: string; occurred_at: string }[];
    generated_at: string;
};

function Sparkline({ values, label }: { values: number[]; label: string }) {
    if (values.length < 2) {
        return null;
    }

    const max = Math.max(...values, 1);
    const points = values
        .map(
            (value, i) =>
                `${(i / (values.length - 1)) * 100},${30 - (value / max) * 28}`,
        )
        .join(' ');

    return (
        <svg
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            role="img"
            aria-label={label}
            className="h-16 w-full text-primary"
        >
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
            />
        </svg>
    );
}

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-card p-3">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-1 font-mono text-lg">{value}</dd>
        </div>
    );
}

export default function DatabaseShow({
    database,
    canManage,
    history,
    errors,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();
    const metric = database.metric;

    const statusLabel = {
        online: t('Online'),
        offline: t('Offline'),
        unknown: t('Not checked yet'),
    }[database.status];

    return (
        <>
            <Head title={database.name} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {database.name}
                        </h1>
                        <p className="font-mono text-sm text-muted-foreground">
                            {database.username}@{database.host}:{database.port}
                            {metric?.version && ` · MySQL ${metric.version}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <span
                            className={cn(
                                'rounded-full px-3 py-1 text-sm',
                                database.status === 'online'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                    : database.status === 'offline'
                                      ? 'bg-red-500/10 text-red-700 dark:text-red-300'
                                      : 'bg-muted text-muted-foreground',
                            )}
                        >
                            {statusLabel}
                        </span>
                        {canManage && (
                            <Button variant="outline" asChild>
                                <Link href={edit(database.id)}>
                                    <Pencil className="size-4" />
                                    {t('Edit')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {metric ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            {t('Last reading :time', {
                                time: timeAgo(
                                    metric.collected_at,
                                    generated_at,
                                    locale,
                                ),
                            })}
                        </p>

                        <dl className="grid grid-cols-2 gap-3 md:grid-cols-4">
                            <Stat
                                label={t('Queries/s')}
                                value={String(metric.queries_per_second ?? '–')}
                            />
                            <Stat
                                label={t('Running threads')}
                                value={String(metric.threads_running)}
                            />
                            <Stat
                                label={t('Data size')}
                                value={formatBytes(metric.data_bytes)}
                            />
                            <Stat
                                label={t('Databases')}
                                value={String(metric.databases_count)}
                            />
                            <Stat
                                label={t('Uptime')}
                                value={formatUptime(metric.uptime_seconds, t)}
                            />
                            <Stat
                                label={t('Slow queries')}
                                value={String(metric.slow_queries_total)}
                            />
                            <Stat
                                label={t('Failed connection attempts')}
                                value={String(metric.aborted_connects_total)}
                            />
                            <Stat
                                label={t('InnoDB buffer pool')}
                                value={
                                    metric.buffer_pool_size
                                        ? formatBytes(metric.buffer_pool_size)
                                        : '–'
                                }
                            />
                        </dl>

                        <div className="rounded-lg border bg-card p-4">
                            <UsageBar
                                label={t('Connections')}
                                value={metric.connections_percent}
                                level={
                                    metric.connections_percent >= 90
                                        ? 'critical'
                                        : metric.connections_percent >= 75
                                          ? 'warning'
                                          : 'ok'
                                }
                                detail={`${metric.threads_connected}/${metric.max_connections}`}
                            />
                        </div>

                        <div className="grid gap-3 md:grid-cols-2">
                            <section className="space-y-2 rounded-lg border bg-card p-4">
                                <h2 className="text-sm font-medium">
                                    {t('Queries/s')} · {t('last 24 hours')}
                                </h2>
                                <Sparkline
                                    label={t('Queries/s')}
                                    values={history.map(
                                        (p) => p.queries_per_second ?? 0,
                                    )}
                                />
                            </section>
                            <section className="space-y-2 rounded-lg border bg-card p-4">
                                <h2 className="text-sm font-medium">
                                    {t('Connections')} · {t('last 24 hours')}
                                </h2>
                                <Sparkline
                                    label={t('Connections')}
                                    values={history.map(
                                        (p) => p.threads_connected,
                                    )}
                                />
                            </section>
                        </div>
                    </>
                ) : (
                    <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                        {t('Waiting for the first check…')}
                    </p>
                )}

                {errors.length > 0 && (
                    <section className="space-y-2">
                        <h2 className="text-sm font-medium">
                            {t('Recent errors')}
                        </h2>
                        <ul className="divide-y rounded-lg border bg-card text-sm">
                            {errors.map((error) => (
                                <li
                                    key={error.id}
                                    className="flex flex-wrap justify-between gap-2 px-4 py-2.5"
                                >
                                    <span className="min-w-0 break-words">
                                        {error.message}
                                    </span>
                                    <span className="shrink-0 text-xs text-muted-foreground">
                                        {timeAgo(
                                            error.occurred_at,
                                            generated_at,
                                            locale,
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </section>
                )}
            </div>
        </>
    );
}

DatabaseShow.layout = (props: { database: { name: string } }) => ({
    breadcrumbs: [
        { title: 'MySQL', href: databasesIndex() },
        { title: props.database.name, href: databasesIndex() },
    ],
});
