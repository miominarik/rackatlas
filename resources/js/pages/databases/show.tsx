import { Head, Link, router } from '@inertiajs/react';
import { Pencil } from 'lucide-react';
import type { ReactNode } from 'react';
import DatabaseController from '@/actions/App/Http/Controllers/DatabaseController';
import RunningQueries from '@/components/databases/running-queries';
import LineChart from '@/components/metrics/line-chart';
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
    bytes_received_per_second: number | null;
    bytes_sent_per_second: number | null;
    selects_per_second: number | null;
    inserts_per_second: number | null;
    updates_per_second: number | null;
    deletes_per_second: number | null;
    replica_lag_seconds: number | null;
};

type Props = {
    database: DatabaseSummary & {
        username: string;
        last_seen_at: string | null;
    };
    canManage: boolean;
    canKill: boolean;
    range: string;
    ranges: string[];
    range_seconds: number;
    history: HistoryPoint[];
    errors: {
        id: number;
        type: string;
        message: string;
        occurred_at: string;
    }[];
    generated_at: string;
};

const COLOR = {
    blue: '#3b82f6',
    amber: '#f59e0b',
    emerald: '#10b981',
    violet: '#8b5cf6',
    rose: '#f43f5e',
};

function ChartCard({
    title,
    summary,
    legend,
    children,
}: {
    title: string;
    summary?: string;
    legend: { label: string; color: string }[];
    children: ReactNode;
}) {
    return (
        <section className="min-w-0 space-y-3 rounded-xl border bg-card p-3 sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-sm font-medium">{title}</h2>
                {summary && (
                    <p className="text-xs text-muted-foreground">{summary}</p>
                )}
            </div>
            {children}
            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                {legend.map((item) => (
                    <li key={item.label} className="flex items-center gap-1.5">
                        <span
                            className="inline-block h-0.5 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                        />
                        {item.label}
                    </li>
                ))}
            </ul>
        </section>
    );
}

function average(values: number[]): number {
    return values.length
        ? values.reduce((sum, value) => sum + value, 0) / values.length
        : 0;
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
    canKill,
    range,
    ranges,
    range_seconds,
    history,
    errors,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();
    const metric = database.metric;

    const to = Math.floor(new Date(generated_at).getTime() / 1000);
    const from = to - range_seconds;
    const times = history.map((p) =>
        Math.floor(new Date(p.at).getTime() / 1000),
    );
    const deltas = times
        .slice(1)
        .map((time, i) => time - times[i])
        .sort((a, b) => a - b);
    const gap = Math.max(
        300,
        (deltas[Math.floor(deltas.length / 2)] ?? 60) * 4,
    );
    const chartBase = { times, from, to, gap, locale };
    const rate = history.map((p) => p.queries_per_second);
    const number = (value: number) =>
        value >= 100
            ? String(Math.round(value))
            : value.toFixed(1).replace(/\.0$/, '');

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

                        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3">
                            <Stat
                                label={t('Queries/s')}
                                value={String(metric.queries_per_second ?? '–')}
                            />
                            <Stat
                                label={t('Running threads')}
                                value={String(metric.threads_running)}
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

                        <div
                            className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1 sm:w-fit"
                            role="group"
                            aria-label={t('Time range')}
                        >
                            {ranges.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    aria-pressed={item === range}
                                    onClick={() =>
                                        router.get(
                                            DatabaseController.show.url(
                                                database.id,
                                            ),
                                            { range: item },
                                            {
                                                only: [
                                                    'history',
                                                    'range',
                                                    'range_seconds',
                                                    'generated_at',
                                                ],
                                                preserveScroll: true,
                                                preserveState: true,
                                                replace: true,
                                            },
                                        )
                                    }
                                    className={cn(
                                        'flex-1 rounded-md px-3 py-1 text-sm whitespace-nowrap transition-colors',
                                        item === range
                                            ? 'bg-background font-medium shadow-sm'
                                            : 'text-muted-foreground hover:text-foreground',
                                    )}
                                >
                                    {item}
                                </button>
                            ))}
                        </div>

                        <div className="grid gap-3 lg:grid-cols-2">
                            <ChartCard
                                title={t('Queries/s')}
                                summary={t('Average :avg · peak :peak', {
                                    avg: number(
                                        average(
                                            rate.filter(
                                                (v): v is number => v !== null,
                                            ),
                                        ),
                                    ),
                                    peak: number(
                                        Math.max(0, ...rate.map((v) => v ?? 0)),
                                    ),
                                })}
                                legend={[
                                    {
                                        label: t('Queries/s'),
                                        color: COLOR.blue,
                                    },
                                ]}
                            >
                                <LineChart
                                    {...chartBase}
                                    label={t('Queries/s')}
                                    formatValue={number}
                                    series={[
                                        {
                                            key: 'qps',
                                            label: t('Queries/s'),
                                            color: COLOR.blue,
                                            area: true,
                                            values: rate,
                                        },
                                    ]}
                                />
                            </ChartCard>
                            <ChartCard
                                title={t('Connections')}
                                summary={t('Average :avg · peak :peak', {
                                    avg: number(
                                        average(
                                            history.map(
                                                (p) => p.threads_connected,
                                            ),
                                        ),
                                    ),
                                    peak: number(
                                        Math.max(
                                            0,
                                            ...history.map(
                                                (p) => p.threads_connected,
                                            ),
                                        ),
                                    ),
                                })}
                                legend={[
                                    {
                                        label: t('Connections'),
                                        color: COLOR.emerald,
                                    },
                                    {
                                        label: t('Running threads'),
                                        color: COLOR.amber,
                                    },
                                ]}
                            >
                                <LineChart
                                    {...chartBase}
                                    label={t('Connections')}
                                    formatValue={number}
                                    series={[
                                        {
                                            key: 'connected',
                                            label: t('Connections'),
                                            color: COLOR.emerald,
                                            area: true,
                                            values: history.map(
                                                (p) => p.threads_connected,
                                            ),
                                        },
                                        {
                                            key: 'running',
                                            label: t('Running threads'),
                                            color: COLOR.amber,
                                            values: history.map(
                                                (p) => p.threads_running,
                                            ),
                                        },
                                    ]}
                                />
                            </ChartCard>
                        </div>
                        <div className="grid gap-3 lg:grid-cols-2">
                            <ChartCard
                                title={t('Network traffic')}
                                legend={[
                                    {
                                        label: t('Received'),
                                        color: COLOR.blue,
                                    },
                                    { label: t('Sent'), color: COLOR.violet },
                                ]}
                            >
                                <LineChart
                                    {...chartBase}
                                    label={t('Network traffic')}
                                    formatValue={(value) =>
                                        `${formatBytes(value)}/s`
                                    }
                                    series={[
                                        {
                                            key: 'received',
                                            label: t('Received'),
                                            color: COLOR.blue,
                                            area: true,
                                            values: history.map(
                                                (p) =>
                                                    p.bytes_received_per_second,
                                            ),
                                        },
                                        {
                                            key: 'sent',
                                            label: t('Sent'),
                                            color: COLOR.violet,
                                            values: history.map(
                                                (p) => p.bytes_sent_per_second,
                                            ),
                                        },
                                    ]}
                                />
                            </ChartCard>
                            <ChartCard
                                title={t('Queries by type')}
                                legend={[
                                    { label: 'SELECT', color: COLOR.blue },
                                    { label: 'INSERT', color: COLOR.emerald },
                                    { label: 'UPDATE', color: COLOR.amber },
                                    { label: 'DELETE', color: COLOR.rose },
                                ]}
                            >
                                <LineChart
                                    {...chartBase}
                                    label={t('Queries by type')}
                                    formatValue={number}
                                    series={[
                                        {
                                            key: 'select',
                                            label: 'SELECT',
                                            color: COLOR.blue,
                                            values: history.map(
                                                (p) => p.selects_per_second,
                                            ),
                                        },
                                        {
                                            key: 'insert',
                                            label: 'INSERT',
                                            color: COLOR.emerald,
                                            values: history.map(
                                                (p) => p.inserts_per_second,
                                            ),
                                        },
                                        {
                                            key: 'update',
                                            label: 'UPDATE',
                                            color: COLOR.amber,
                                            values: history.map(
                                                (p) => p.updates_per_second,
                                            ),
                                        },
                                        {
                                            key: 'delete',
                                            label: 'DELETE',
                                            color: COLOR.rose,
                                            values: history.map(
                                                (p) => p.deletes_per_second,
                                            ),
                                        },
                                    ]}
                                />
                            </ChartCard>
                        </div>

                        {metric.replication && (
                            <ChartCard
                                title={t('Replication')}
                                summary={
                                    metric.replication.source
                                        ? t('Source :source', {
                                              source: metric.replication.source,
                                          })
                                        : undefined
                                }
                                legend={[
                                    {
                                        label: t('Replication lag (s)'),
                                        color: COLOR.amber,
                                    },
                                ]}
                            >
                                <div className="flex flex-wrap gap-2 text-sm">
                                    {[
                                        {
                                            label: t('IO thread'),
                                            ok: metric.replication.io_running,
                                        },
                                        {
                                            label: t('SQL thread'),
                                            ok: metric.replication.sql_running,
                                        },
                                    ].map((thread) => (
                                        <span
                                            key={thread.label}
                                            className={cn(
                                                'rounded-full px-3 py-1',
                                                thread.ok
                                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'bg-red-500/10 text-red-700 dark:text-red-300',
                                            )}
                                        >
                                            {thread.label}:{' '}
                                            {thread.ok
                                                ? t('running')
                                                : t('stopped')}
                                        </span>
                                    ))}
                                    <span className="rounded-full bg-muted px-3 py-1">
                                        {t('Lag')}:{' '}
                                        {metric.replication.lag_seconds === null
                                            ? '–'
                                            : t(':seconds s', {
                                                  seconds:
                                                      metric.replication
                                                          .lag_seconds,
                                              })}
                                    </span>
                                </div>
                                {metric.replication.error && (
                                    <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm break-words text-red-700 dark:text-red-300">
                                        {metric.replication.error}
                                    </p>
                                )}
                                <LineChart
                                    {...chartBase}
                                    label={t('Replication lag (s)')}
                                    formatValue={number}
                                    series={[
                                        {
                                            key: 'lag',
                                            label: t('Replication lag (s)'),
                                            color: COLOR.amber,
                                            area: true,
                                            values: history.map(
                                                (p) => p.replica_lag_seconds,
                                            ),
                                        },
                                    ]}
                                />
                            </ChartCard>
                        )}
                    </>
                ) : (
                    <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                        {t('Waiting for the first check…')}
                    </p>
                )}

                {database.status !== 'unknown' && (
                    <RunningQueries
                        serverId={database.id}
                        canKill={canKill}
                    />
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
