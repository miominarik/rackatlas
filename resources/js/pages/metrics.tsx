import { Head, Link, router, usePoll } from '@inertiajs/react';
import { Activity } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import LineChart from '@/components/metrics/line-chart';
import ProcessesPanel from '@/components/metrics/processes-panel';
import type { ChartSeries } from '@/components/metrics/line-chart';
import UsageBar from '@/components/dashboard/usage-bar';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import {
    formatBytes,
    formatUptime,
    percent,
    timeAgo,
    usageLevel,
} from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index } from '@/routes/metrics';
import { index as serversIndex } from '@/routes/servers';
import { index as teamsIndex } from '@/routes/teams';
import type {
    DashboardThresholds,
    MetricsCurrent,
    MetricsIncident,
    MetricsRange,
    MetricsReport,
    MetricsServer,
} from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    servers?: { id: number; name: string }[];
    server?: MetricsServer | null;
    range?: MetricsRange;
    ranges?: MetricsRange[];
    thresholds?: DashboardThresholds;
    current?: MetricsCurrent | null;
    report?: MetricsReport | null;
};

const RANGE_SECONDS: Record<MetricsRange, number> = {
    '1h': 3600,
    '6h': 21600,
    '24h': 86400,
    '7d': 604800,
    '30d': 2592000,
};

const COLOR = {
    blue: '#3b82f6',
    amber: '#f59e0b',
    emerald: '#10b981',
    violet: '#8b5cf6',
    rose: '#f43f5e',
    cyan: '#06b6d4',
    slate: '#64748b',
};

const DISK_COLORS = [
    COLOR.blue,
    COLOR.emerald,
    COLOR.violet,
    COLOR.rose,
    COLOR.cyan,
    COLOR.amber,
];

const levelText = {
    ok: '',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
} as const;

function Tile({
    title,
    value,
    detail,
    level = 'ok',
}: {
    title: string;
    value: ReactNode;
    detail?: ReactNode;
    level?: 'ok' | 'warning' | 'critical';
}) {
    return (
        <div className="min-w-0 rounded-xl border bg-card p-3 sm:p-4">
            <p className="truncate text-xs text-muted-foreground">{title}</p>
            <p
                className={cn(
                    'mt-1 text-xl font-semibold tracking-tight sm:text-2xl',
                    levelText[level],
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

function ChartCard({
    title,
    summary,
    legend,
    children,
    className,
}: {
    title: string;
    summary?: ReactNode;
    legend?: { label: string; color: string }[];
    children: ReactNode;
    className?: string;
}) {
    return (
        <section
            className={cn(
                'min-w-0 space-y-3 rounded-xl border bg-card p-3 sm:p-4',
                className,
            )}
        >
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h2 className="text-sm font-medium">{title}</h2>
                {summary && (
                    <p className="text-xs text-muted-foreground">{summary}</p>
                )}
            </div>
            {children}
            {legend && (
                <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {legend.map((item) => (
                        <li
                            key={item.label}
                            className="flex items-center gap-1.5"
                        >
                            <span
                                className="inline-block h-0.5 w-3 rounded-full"
                                style={{ backgroundColor: item.color }}
                            />
                            {item.label}
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

const number = (value: number | null, digits = 0) =>
    value === null ? '–' : value.toFixed(digits);

function average(values: (number | null)[]): number | null {
    const present = values.filter((value): value is number => value !== null);

    return present.length
        ? present.reduce((sum, value) => sum + value, 0) / present.length
        : null;
}

function peak(values: (number | null)[]): number | null {
    const present = values.filter((value): value is number => value !== null);

    return present.length ? Math.max(...present) : null;
}

export default function Metrics({
    team,
    servers = [],
    server = null,
    range = '24h',
    ranges = [],
    thresholds,
    current = null,
    report = null,
}: Props) {
    const { t, locale } = useTranslation();

    usePoll(60000, { only: ['current', 'report', 'server'] });

    // The point of the charts the viewer picked to see which programs were running then.
    const [selected, setSelected] = useState<number | null>(null);

    useEffect(() => setSelected(null), [server?.id, range]);

    if (!team) {
        return (
            <>
                <Head title={t('Metrics')} />
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

    if (!server || !report || !thresholds) {
        return (
            <>
                <Head title={t('Metrics')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
                        <Activity className="size-7 text-muted-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold">
                        {t('No servers yet')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'Add a server and its metrics appear here within a minute.',
                        )}
                    </p>
                    <Button asChild>
                        <Link href={serversIndex()}>{t('Servers')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const go = (next: { server?: number; range?: MetricsRange }) =>
        router.get(
            index(),
            {
                server: next.server ?? server.id,
                range: next.range ?? range,
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
                only: ['server', 'range', 'current', 'report'],
            },
        );

    const points = report.points;
    const times = points.map((point) => point.t);
    const to = Math.floor(new Date(report.generated_at).getTime() / 1000);
    const from = to - RANGE_SECONDS[range];
    const gap = report.bucket_seconds * 2.5;
    const pct = (value: number) => `${Math.round(value * 10) / 10}%`;
    const chartBase = { times, from, to, gap, locale };

    const limits = (key: 'cpu' | 'ram' | 'disk') => [
        {
            value: thresholds[key].warn,
            color: COLOR.amber,
            label: t('Warning'),
        },
        {
            value: thresholds[key].critical,
            color: '#ef4444',
            label: t('Critical'),
        },
    ];

    const restartMarkers = report.restarts.map((time) => ({
        t: time,
        label: `${t('Restart')} ${new Date(time * 1000).toLocaleString(locale)}`,
    }));

    const cpu = current ? current.cpu_percent : null;
    const ram = current
        ? percent(current.memory_used, current.memory_total)
        : null;
    const swap =
        current && current.swap_total > 0
            ? percent(current.swap_used, current.swap_total)
            : null;
    const worstDisk = current?.disks.length
        ? current.disks.reduce((worst, disk) =>
              percent(disk.used_bytes, disk.total_bytes) >
              percent(worst.used_bytes, worst.total_bytes)
                  ? disk
                  : worst,
          )
        : null;
    const worstDiskPct = worstDisk
        ? percent(worstDisk.used_bytes, worstDisk.total_bytes)
        : null;
    const cores =
        current?.cpu_cores ??
        Math.max(1, ...points.map((point) => point.cores));

    const diskSeries: ChartSeries[] = Object.entries(report.disks).map(
        ([mount, series], i) => {
            const byTime = new Map(series.map((point) => [point.t, point.pct]));

            return {
                key: mount,
                label: mount,
                color: DISK_COLORS[i % DISK_COLORS.length],
                values: times.map((time) => byTime.get(time) ?? null),
            };
        },
    );

    const incidentLabel = (incident: MetricsIncident): string => {
        if (incident.type === 'offline') {
            return t('Server was offline');
        }

        if (incident.key === 'cpu') {
            return t('High CPU usage');
        }

        if (incident.key === 'ram') {
            return t('High memory usage');
        }

        if (incident.key.startsWith('disk:')) {
            return t('Disk :mount almost full', {
                mount: incident.key.slice(5),
            });
        }

        if (incident.key.startsWith('unit:')) {
            return t('Service :unit has failed', {
                unit: incident.key.slice(5),
            });
        }

        return incident.key;
    };

    const durationOf = (incident: MetricsIncident): string => {
        const end = incident.resolved_at
            ? new Date(incident.resolved_at).getTime()
            : new Date(report.generated_at).getTime();

        return formatUptime(
            Math.max(60, (end - new Date(incident.opened_at).getTime()) / 1000),
            t,
        );
    };

    const noData = points.length === 0;
    const peakPoint = points.reduce<(typeof points)[number] | null>(
        (best, point) =>
            point.cpu_max !== null &&
            (best === null || point.cpu_max > (best.cpu_max ?? -1))
                ? point
                : best,
        null,
    );
    const shownPoint =
        selected !== null && times.includes(selected)
            ? selected
            : (peakPoint?.t ?? null);

    return (
        <>
            <Head title={t('Metrics')} />

            <div className="mx-auto w-full max-w-[100rem] min-w-0 space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Metrics')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Detailed history of one server of the team :team',
                                { team: team.name },
                            )}
                        </p>
                    </div>

                    <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                        <Select
                            value={String(server.id)}
                            onValueChange={(value) =>
                                go({ server: Number(value) })
                            }
                        >
                            <SelectTrigger
                                className="w-full sm:w-56"
                                aria-label={t('Server')}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {servers.map((item) => (
                                    <SelectItem
                                        key={item.id}
                                        value={String(item.id)}
                                    >
                                        {item.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <div
                            className="flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
                            role="group"
                            aria-label={t('Time range')}
                        >
                            {ranges.map((item) => (
                                <button
                                    key={item}
                                    type="button"
                                    onClick={() => go({ range: item })}
                                    aria-pressed={item === range}
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
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4">
                    <Tile
                        title={t('Status')}
                        value={
                            <span
                                className={
                                    server.status === 'online'
                                        ? 'text-emerald-600 dark:text-emerald-400'
                                        : server.status === 'offline'
                                          ? 'text-red-600 dark:text-red-400'
                                          : ''
                                }
                            >
                                {server.status === 'online'
                                    ? t('Online')
                                    : server.status === 'offline'
                                      ? t('Offline')
                                      : t('Unknown')}
                            </span>
                        }
                        detail={
                            server.last_seen_at
                                ? t('Last data :time', {
                                      time: timeAgo(
                                          server.last_seen_at,
                                          report.generated_at,
                                          locale,
                                      ),
                                  })
                                : t('No data yet')
                        }
                    />
                    <Tile
                        title={t('CPU')}
                        value={cpu === null ? '–' : pct(cpu)}
                        detail={t(':count cores', { count: cores })}
                        level={
                            cpu === null
                                ? 'ok'
                                : usageLevel(cpu, thresholds.cpu)
                        }
                    />
                    <Tile
                        title={t('Memory')}
                        value={ram === null ? '–' : pct(ram)}
                        detail={
                            current
                                ? `${formatBytes(current.memory_used)} / ${formatBytes(current.memory_total)}`
                                : undefined
                        }
                        level={
                            ram === null
                                ? 'ok'
                                : usageLevel(ram, thresholds.ram)
                        }
                    />
                    <Tile
                        title={t('Fullest disk')}
                        value={worstDiskPct === null ? '–' : pct(worstDiskPct)}
                        detail={worstDisk?.mount}
                        level={
                            worstDiskPct === null
                                ? 'ok'
                                : usageLevel(worstDiskPct, thresholds.disk)
                        }
                    />
                    <Tile
                        title={t('Load average')}
                        value={current ? current.load_1.toFixed(2) : '–'}
                        detail={
                            current
                                ? t('5 min :five · 15 min :fifteen', {
                                      five: current.load_5.toFixed(2),
                                      fifteen: current.load_15.toFixed(2),
                                  })
                                : undefined
                        }
                        level={
                            current && current.load_1 / cores >= 1.5
                                ? 'critical'
                                : current && current.load_1 / cores >= 1
                                  ? 'warning'
                                  : 'ok'
                        }
                    />
                    <Tile
                        title={t('Swap')}
                        value={swap === null ? t('None') : pct(swap)}
                        detail={
                            current && current.swap_total > 0
                                ? `${formatBytes(current.swap_used)} / ${formatBytes(current.swap_total)}`
                                : undefined
                        }
                        level={
                            swap !== null && swap >= 50
                                ? swap >= 80
                                    ? 'critical'
                                    : 'warning'
                                : 'ok'
                        }
                    />
                    <Tile
                        title={t('Uptime')}
                        value={
                            current
                                ? formatUptime(current.uptime_seconds, t)
                                : '–'
                        }
                        detail={
                            report.restarts.length > 0
                                ? t(':count restarts in this period', {
                                      count: report.restarts.length,
                                  })
                                : t('No restart in this period')
                        }
                    />
                    <Tile
                        title={t('Availability')}
                        value={
                            report.availability === null
                                ? '–'
                                : `${report.availability}%`
                        }
                        detail={t('Share of expected reports received')}
                        level={
                            report.availability !== null &&
                            report.availability < 95
                                ? report.availability < 80
                                    ? 'critical'
                                    : 'warning'
                                : 'ok'
                        }
                    />
                </div>

                {noData ? (
                    <div className="rounded-xl border border-dashed p-10 text-center text-sm text-muted-foreground">
                        {t('No data for this period yet.')}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                        <ChartCard
                            title={t('CPU usage')}
                            summary={t('Average :avg · peak :peak', {
                                avg: `${number(average(points.map((p) => p.cpu_avg)))}%`,
                                peak: `${number(peak(points.map((p) => p.cpu_max)))}%`,
                            })}
                            legend={[
                                { label: t('Average'), color: COLOR.blue },
                                { label: t('Peak'), color: COLOR.amber },
                            ]}
                        >
                            <LineChart
                                {...chartBase}
                                label={t('CPU usage')}
                                selected={shownPoint}
                                onSelect={setSelected}
                                max={100}
                                formatValue={pct}
                                thresholds={limits('cpu')}
                                markers={restartMarkers}
                                series={[
                                    {
                                        key: 'cpu_avg',
                                        label: t('Average'),
                                        color: COLOR.blue,
                                        area: true,
                                        values: points.map((p) => p.cpu_avg),
                                    },
                                    {
                                        key: 'cpu_max',
                                        label: t('Peak'),
                                        color: COLOR.amber,
                                        values: points.map((p) => p.cpu_max),
                                    },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard
                            title={t('Memory usage')}
                            summary={t('Average :avg · peak :peak', {
                                avg: `${number(average(points.map((p) => p.ram_avg)))}%`,
                                peak: `${number(peak(points.map((p) => p.ram_max)))}%`,
                            })}
                            legend={[
                                { label: t('Memory'), color: COLOR.emerald },
                                { label: t('Swap'), color: COLOR.violet },
                            ]}
                        >
                            <LineChart
                                {...chartBase}
                                label={t('Memory usage')}
                                selected={shownPoint}
                                onSelect={setSelected}
                                max={100}
                                formatValue={pct}
                                thresholds={limits('ram')}
                                markers={restartMarkers}
                                series={[
                                    {
                                        key: 'ram',
                                        label: t('Memory'),
                                        color: COLOR.emerald,
                                        area: true,
                                        values: points.map((p) => p.ram_avg),
                                    },
                                    {
                                        key: 'swap',
                                        label: t('Swap'),
                                        color: COLOR.violet,
                                        values: points.map((p) => p.swap),
                                    },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard
                            title={t('Load average')}
                            summary={t(
                                'Above :cores means the CPU cannot keep up',
                                { cores },
                            )}
                            legend={[
                                { label: t('1 min'), color: COLOR.blue },
                                { label: t('5 min'), color: COLOR.emerald },
                                { label: t('15 min'), color: COLOR.violet },
                                { label: t('CPU cores'), color: COLOR.slate },
                            ]}
                        >
                            <LineChart
                                {...chartBase}
                                label={t('Load average')}
                                formatValue={(value) => value.toFixed(2)}
                                markers={restartMarkers}
                                series={[
                                    {
                                        key: 'l1',
                                        label: t('1 min'),
                                        color: COLOR.blue,
                                        values: points.map((p) => p.load_1),
                                    },
                                    {
                                        key: 'l5',
                                        label: t('5 min'),
                                        color: COLOR.emerald,
                                        values: points.map((p) => p.load_5),
                                    },
                                    {
                                        key: 'l15',
                                        label: t('15 min'),
                                        color: COLOR.violet,
                                        values: points.map((p) => p.load_15),
                                    },
                                    {
                                        key: 'cores',
                                        label: t('CPU cores'),
                                        color: COLOR.slate,
                                        dashed: true,
                                        values: points.map(() => cores),
                                    },
                                ]}
                            />
                        </ChartCard>

                        <ChartCard
                            title={t('Disk usage')}
                            summary={t('Worst disk :value', {
                                value:
                                    worstDiskPct === null
                                        ? '–'
                                        : pct(worstDiskPct),
                            })}
                            legend={diskSeries.map((s) => ({
                                label: s.label,
                                color: s.color,
                            }))}
                        >
                            <LineChart
                                {...chartBase}
                                label={t('Disk usage')}
                                max={100}
                                formatValue={pct}
                                thresholds={limits('disk')}
                                series={diskSeries}
                            />
                        </ChartCard>

                        {current && current.disks.length > 0 && (
                            <ChartCard
                                title={t('Disks now')}
                                className="lg:col-span-2"
                            >
                                <ul className="divide-y">
                                    {current.disks.map((disk) => {
                                        const used = percent(
                                            disk.used_bytes,
                                            disk.total_bytes,
                                        );
                                        const forecast =
                                            report.forecast[disk.mount];

                                        return (
                                            <li
                                                key={disk.mount}
                                                className="grid gap-2 py-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,2fr)_minmax(0,1.2fr)] sm:items-center sm:gap-4"
                                            >
                                                <div className="min-w-0">
                                                    <p className="truncate font-mono text-sm">
                                                        {disk.mount}
                                                    </p>
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {disk.device} ·{' '}
                                                        {disk.filesystem}
                                                    </p>
                                                </div>
                                                <UsageBar
                                                    label={`${formatBytes(disk.used_bytes)} / ${formatBytes(disk.total_bytes)}`}
                                                    value={used}
                                                    level={usageLevel(
                                                        used,
                                                        thresholds.disk,
                                                    )}
                                                    detail={t(':free free', {
                                                        free: formatBytes(
                                                            Math.max(
                                                                0,
                                                                disk.total_bytes -
                                                                    disk.used_bytes,
                                                            ),
                                                        ),
                                                    })}
                                                />
                                                <p className="text-xs text-muted-foreground sm:text-right">
                                                    {forecast
                                                        ? forecast.days !==
                                                              null &&
                                                          forecast.days < 365
                                                            ? t(
                                                                  'Grows :size/day, full in about :days days',
                                                                  {
                                                                      size: formatBytes(
                                                                          Math.max(
                                                                              0,
                                                                              forecast.per_day,
                                                                          ),
                                                                      ),
                                                                      days: Math.round(
                                                                          forecast.days,
                                                                      ),
                                                                  },
                                                              )
                                                            : t(
                                                                  'Not growing noticeably',
                                                              )
                                                        : t(
                                                              'Forecast needs at least a day of data',
                                                          )}
                                                </p>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </ChartCard>
                        )}
                    </div>
                )}

                {!noData && (
                    <ProcessesPanel
                        serverId={server.id}
                        from={shownPoint}
                        seconds={report.bucket_seconds}
                        agentVersion={server.agent_version}
                        isPeak={shownPoint === (peakPoint?.t ?? null)}
                        onShowPeak={() => setSelected(null)}
                    />
                )}

                <section className="space-y-3 rounded-xl border bg-card p-4">
                    <h2 className="text-sm font-medium">
                        {t('Incidents and restarts')}
                    </h2>

                    {report.incidents.length === 0 &&
                    report.restarts.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            {t('No incident in this period.')}
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {report.incidents.map((incident) => (
                                <li
                                    key={incident.id}
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm"
                                >
                                    <span
                                        className={cn(
                                            'size-2 shrink-0 rounded-full',
                                            incident.resolved_at
                                                ? 'bg-emerald-500'
                                                : 'bg-red-500',
                                        )}
                                    />
                                    <span className="font-medium">
                                        {incidentLabel(incident)}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(
                                            incident.opened_at,
                                        ).toLocaleString(locale)}{' '}
                                        ·{' '}
                                        {incident.resolved_at
                                            ? t('lasted :time', {
                                                  time: durationOf(incident),
                                              })
                                            : t('still open')}
                                    </span>
                                </li>
                            ))}
                            {report.restarts.map((time) => (
                                <li
                                    key={time}
                                    className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 text-sm"
                                >
                                    <span className="size-2 shrink-0 rounded-full bg-zinc-400" />
                                    <span className="font-medium">
                                        {t('Server restarted')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(time * 1000).toLocaleString(
                                            locale,
                                        )}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}

Metrics.layout = {
    breadcrumbs: [{ title: 'Metrics', href: index() }],
};
