import { Head, Link, router, usePoll } from '@inertiajs/react';
import { Pencil, RefreshCw, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import LineChart from '@/components/metrics/line-chart';
import StatusDot from '@/components/storage/status-dot';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { check, destroy, edit, index, show } from '@/routes/storage';
import type { StorageMonitor, StoragePoint } from '@/types/storage';

type Props = {
    monitor: StorageMonitor & {
        last_ok_at: string | null;
        token_expires_at: string | null;
        created_at: string | null;
    };
    canManage: boolean;
    range: '24h' | '7d' | '30d';
    bucket_seconds: number;
    from: number;
    to: number;
    points: StoragePoint[];
    availability: number | null;
    generated_at: string;
};

function signedBytes(bytes: number): string {
    if (bytes === 0) {
        return formatBytes(0);
    }

    return `${bytes > 0 ? '+' : '−'}${formatBytes(Math.abs(bytes))}`;
}

const RANGES: ('24h' | '7d' | '30d')[] = ['24h', '7d', '30d'];

function Tile({
    title,
    value,
    detail,
    bad = false,
}: {
    title: string;
    value: ReactNode;
    detail?: ReactNode;
    bad?: boolean;
}) {
    return (
        <div className="min-w-0 rounded-xl border bg-card p-3 sm:p-4">
            <p className="truncate text-xs text-muted-foreground">{title}</p>
            <p
                className={cn(
                    'mt-1 text-xl font-semibold tracking-tight sm:text-2xl',
                    bad && 'text-red-600 dark:text-red-400',
                )}
            >
                {value}
            </p>
            {detail && (
                <p className="mt-0.5 line-clamp-2 text-xs break-words text-muted-foreground">
                    {detail}
                </p>
            )}
        </div>
    );
}

export default function StorageShow({
    monitor,
    canManage,
    range,
    bucket_seconds,
    from,
    to,
    points,
    availability,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();

    usePoll(10000, { only: ['monitor', 'points', 'availability'] });

    const statusText = {
        online: t('Available'),
        offline: t('Not available'),
        unknown: t('Not checked yet'),
    };

    const approx = monitor.is_partial ? '≥ ' : '';
    const times = points.map((point) => point.t);
    const chartBase = {
        times,
        from,
        to,
        gap: bucket_seconds * 2.5,
        locale,
    };

    const sizes = points
        .map((point) => point.total_bytes)
        .filter((value): value is number => value !== null);
    const change = sizes.length > 1 ? sizes[sizes.length - 1] - sizes[0] : null;

    const expires = monitor.token_expires_at
        ? new Date(monitor.token_expires_at)
        : null;
    const daysLeft = expires
        ? Math.floor((expires.getTime() - Date.now()) / 86400000)
        : null;

    return (
        <>
            <Head title={monitor.name} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h1 className="flex items-center gap-2 text-2xl font-semibold">
                            <StatusDot status={monitor.status} />
                            <span className="truncate">{monitor.name}</span>
                        </h1>
                        <p className="truncate font-mono text-sm text-muted-foreground">
                            {monitor.account}.blob.core.windows.net/
                            {monitor.container}
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex flex-wrap gap-2">
                            <Button
                                variant="outline"
                                onClick={() =>
                                    router.post(
                                        check.url(monitor.id),
                                        {},
                                        { preserveScroll: true },
                                    )
                                }
                            >
                                <RefreshCw className="size-4" />
                                {t('Check now')}
                            </Button>
                            <Button variant="outline" asChild>
                                <Link href={edit(monitor.id)}>
                                    <Pencil className="size-4" />
                                    {t('Edit')}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    if (
                                        window.confirm(
                                            t('Delete the storage :name?', {
                                                name: monitor.name,
                                            }),
                                        )
                                    ) {
                                        router.delete(destroy.url(monitor.id));
                                    }
                                }}
                            >
                                <Trash2 className="size-4" />
                                {t('Delete')}
                            </Button>
                        </div>
                    )}
                </div>

                {monitor.status === 'offline' && monitor.last_error && (
                    <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
                        {t(monitor.last_error)}
                    </div>
                )}

                {daysLeft !== null && daysLeft <= 14 && (
                    <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-300">
                        {daysLeft < 0
                            ? t(
                                  'The SAS token has expired. Create a new one and save it in Edit.',
                              )
                            : t(
                                  'The SAS token expires in :days days. Create a new one and save it in Edit.',
                                  {
                                      days: daysLeft,
                                  },
                              )}
                    </div>
                )}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 xl:grid-cols-6">
                    <Tile
                        title={t('Status')}
                        value={statusText[monitor.status]}
                        bad={monitor.status === 'offline'}
                        detail={
                            monitor.last_checked_at
                                ? `${t('Checked :time', {
                                      time: timeAgo(
                                          monitor.last_checked_at,
                                          generated_at,
                                          locale,
                                      ),
                                  })} · ${t('every :minutes min', { minutes: monitor.check_interval })}`
                                : undefined
                        }
                    />
                    <Tile
                        title={t('Size')}
                        value={
                            monitor.total_bytes === null
                                ? '–'
                                : `${approx}${formatBytes(monitor.total_bytes)}`
                        }
                        detail={
                            monitor.is_partial
                                ? t('Only the first 100,000 blobs are counted.')
                                : undefined
                        }
                    />
                    <Tile
                        title={t('Blobs')}
                        value={
                            monitor.blob_count === null
                                ? '–'
                                : `${approx}${monitor.blob_count.toLocaleString(locale)}`
                        }
                    />
                    <Tile
                        title={t('Change')}
                        value={change === null ? '–' : signedBytes(change)}
                        detail={t('In the selected period')}
                    />
                    <Tile
                        title={t('Response')}
                        value={
                            monitor.response_ms === null
                                ? '–'
                                : `${monitor.response_ms} ms`
                        }
                    />
                    <Tile
                        title={t('Availability')}
                        value={
                            availability === null ? '–' : `${availability} %`
                        }
                        detail={t('In the selected period')}
                    />
                </div>

                <div className="flex gap-2">
                    {RANGES.map((value) => (
                        <Button
                            key={value}
                            size="sm"
                            variant={value === range ? 'default' : 'outline'}
                            onClick={() =>
                                router.get(
                                    show.url(monitor.id, {
                                        query: { range: value },
                                    }),
                                    {},
                                    {
                                        preserveScroll: true,
                                        preserveState: true,
                                    },
                                )
                            }
                        >
                            {value}
                        </Button>
                    ))}
                </div>

                {points.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t('No data yet')}
                    </p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        <section className="min-w-0 space-y-3 rounded-xl border bg-card p-3 sm:p-4">
                            <h2 className="text-sm font-medium">{t('Size')}</h2>
                            <LineChart
                                {...chartBase}
                                label={t('Size')}
                                min={0}
                                formatValue={formatBytes}
                                series={[
                                    {
                                        key: 'bytes',
                                        label: t('Size'),
                                        color: '#3b82f6',
                                        area: true,
                                        values: points.map(
                                            (point) => point.total_bytes,
                                        ),
                                    },
                                ]}
                            />
                        </section>
                        <section className="min-w-0 space-y-3 rounded-xl border bg-card p-3 sm:p-4">
                            <h2 className="text-sm font-medium">
                                {t('Blobs')}
                            </h2>
                            <LineChart
                                {...chartBase}
                                label={t('Blobs')}
                                min={0}
                                formatValue={(value) =>
                                    Math.round(value).toLocaleString(locale)
                                }
                                series={[
                                    {
                                        key: 'count',
                                        label: t('Blobs'),
                                        color: '#10b981',
                                        area: true,
                                        values: points.map(
                                            (point) => point.blob_count,
                                        ),
                                    },
                                ]}
                            />
                        </section>
                        <section className="min-w-0 space-y-3 rounded-xl border bg-card p-3 sm:p-4 lg:col-span-2">
                            <h2 className="text-sm font-medium">
                                {t('Response time')}
                            </h2>
                            <LineChart
                                {...chartBase}
                                label={t('Response time')}
                                min={0}
                                formatValue={(value) =>
                                    `${Math.round(value)} ms`
                                }
                                series={[
                                    {
                                        key: 'ms',
                                        label: t('Response'),
                                        color: '#f59e0b',
                                        values: points.map(
                                            (point) => point.response_ms,
                                        ),
                                    },
                                ]}
                            />
                        </section>
                    </div>
                )}
            </div>
        </>
    );
}

StorageShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Storage', href: index() },
    ],
};
