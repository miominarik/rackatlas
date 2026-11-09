import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Sparkline from '@/components/dashboard/sparkline';
import LineChart from '@/components/metrics/line-chart';
import type { ChartSeries } from '@/components/metrics/line-chart';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, percent, timeAgo, usageLevel } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import type {
    DashboardThresholds,
    FleetReport,
    FleetServer,
    MetricsRange,
} from '@/types';

const RANGE_SECONDS: Record<MetricsRange, number> = {
    '1h': 3600,
    '6h': 21600,
    '24h': 86400,
    '7d': 604800,
    '30d': 2592000,
};

const PALETTE = [
    '#3b82f6',
    '#f59e0b',
    '#10b981',
    '#8b5cf6',
    '#f43f5e',
    '#06b6d4',
    '#84cc16',
    '#ec4899',
    '#f97316',
    '#14b8a6',
    '#6366f1',
    '#a16207',
];

type Level = 'ok' | 'warning' | 'critical';

const levelText: Record<Level, string> = {
    ok: '',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
};

const levelRank: Record<Level, number> = { ok: 0, warning: 1, critical: 2 };

type SortKey = 'attention' | 'name' | 'cpu' | 'ram' | 'disk' | 'load';

type Row = {
    server: FleetServer;
    color: string;
    cpu: number | null;
    ram: number | null;
    disk: number | null;
    diskMount: string | null;
    load: number | null;
    cores: number;
    level: Level;
    offline: boolean;
};

function average(values: (number | null)[]): number | null {
    const present = values.filter((value): value is number => value !== null);

    return present.length
        ? present.reduce((sum, value) => sum + value, 0) / present.length
        : null;
}

function Tile({
    title,
    value,
    detail,
    level = 'ok',
}: {
    title: string;
    value: ReactNode;
    detail?: ReactNode;
    level?: Level;
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
                <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                    {detail}
                </p>
            )}
        </div>
    );
}

function Value({ value, level }: { value: number | null; level: Level }) {
    return (
        <span className={cn('font-medium tabular-nums', levelText[level])}>
            {value === null ? '–' : `${Math.round(value)}%`}
        </span>
    );
}

export default function FleetView({
    fleet,
    thresholds,
    onOpen,
}: {
    fleet: FleetReport;
    thresholds: DashboardThresholds;
    onOpen: (serverId: number) => void;
}) {
    const { t, locale } = useTranslation();
    const [sort, setSort] = useState<{ key: SortKey; desc: boolean }>({
        key: 'attention',
        desc: true,
    });

    const rows = useMemo<Row[]>(() => {
        const built = fleet.servers.map((server, i): Row => {
            const current = server.current;
            const cpu = current ? current.cpu_percent : null;
            const ram = current
                ? percent(current.memory_used, current.memory_total)
                : null;
            const worst = current?.disks.length
                ? current.disks.reduce((a, b) =>
                      percent(b.used_bytes, b.total_bytes) >
                      percent(a.used_bytes, a.total_bytes)
                          ? b
                          : a,
                  )
                : null;
            const disk = worst
                ? percent(worst.used_bytes, worst.total_bytes)
                : null;
            const cores = Math.max(1, current?.cpu_cores ?? 1);
            const load = current ? current.load_1 / cores : null;
            const offline = server.status === 'offline';

            const levels: Level[] = [
                cpu === null ? 'ok' : usageLevel(cpu, thresholds.cpu),
                ram === null ? 'ok' : usageLevel(ram, thresholds.ram),
                disk === null ? 'ok' : usageLevel(disk, thresholds.disk),
                load !== null && load >= 1.5
                    ? 'critical'
                    : load !== null && load >= 1
                      ? 'warning'
                      : 'ok',
            ];

            return {
                server,
                color: PALETTE[i % PALETTE.length],
                cpu,
                ram,
                disk,
                diskMount: worst?.mount ?? null,
                load,
                cores,
                offline,
                level: offline
                    ? 'critical'
                    : levels.reduce<Level>(
                          (top, level) =>
                              levelRank[level] > levelRank[top] ? level : top,
                          'ok',
                      ),
            };
        });

        const pick = (row: Row): number | string => {
            switch (sort.key) {
                case 'name':
                    return row.server.name.toLowerCase();
                case 'cpu':
                    return row.cpu ?? -1;
                case 'ram':
                    return row.ram ?? -1;
                case 'disk':
                    return row.disk ?? -1;
                case 'load':
                    return row.load ?? -1;
                default:
                    return (
                        (row.offline ? 10 : levelRank[row.level] * 2) +
                        Math.min(1, row.server.open_alerts / 10)
                    );
            }
        };

        return [...built].sort((a, b) => {
            const x = pick(a);
            const y = pick(b);
            const order = x < y ? -1 : x > y ? 1 : 0;

            return (
                (sort.desc ? -order : order) ||
                a.server.name.localeCompare(b.server.name)
            );
        });
    }, [fleet.servers, thresholds, sort]);

    const online = rows.filter((row) => row.server.status === 'online').length;
    const offline = rows.filter((row) => row.offline).length;
    const problems = rows.filter((row) => row.level !== 'ok').length;
    const alerts = rows.reduce((sum, row) => sum + row.server.open_alerts, 0);
    const avgCpu = average(rows.map((row) => row.cpu));
    const avgRam = average(rows.map((row) => row.ram));
    const rx = rows.reduce(
        (sum, row) => sum + (row.server.current?.net_rx_bps ?? 0),
        0,
    );
    const tx = rows.reduce(
        (sum, row) => sum + (row.server.current?.net_tx_bps ?? 0),
        0,
    );

    const to = Math.floor(new Date(fleet.generated_at).getTime() / 1000);
    const from = to - RANGE_SECONDS[fleet.range];
    const times = useMemo(
        () =>
            [
                ...new Set(
                    fleet.servers.flatMap((server) =>
                        server.points.map((point) => point.t),
                    ),
                ),
            ].sort((a, b) => a - b),
        [fleet.servers],
    );

    const series = (key: 'cpu' | 'ram'): ChartSeries[] =>
        rows.map((row) => {
            const byTime = new Map(
                row.server.points.map((point) => [point.t, point[key]]),
            );

            return {
                key: String(row.server.id),
                label: row.server.name,
                color: row.color,
                values: times.map((time) => byTime.get(time) ?? null),
            };
        });

    const chartBase = {
        times,
        from,
        to,
        gap: fleet.bucket_seconds * 2.5,
        locale,
        min: 0,
        max: 100,
        formatValue: (value: number) => `${Math.round(value * 10) / 10}%`,
    };

    const toggle = (key: SortKey) =>
        setSort((previous) =>
            previous.key === key
                ? { key, desc: !previous.desc }
                : { key, desc: key !== 'name' },
        );

    const header = (key: SortKey, label: string, className?: string) => (
        <th className={cn('px-3 py-2 font-medium', className)}>
            <button
                type="button"
                onClick={() => toggle(key)}
                className="inline-flex items-center gap-1 hover:text-foreground"
            >
                {label}
                {sort.key === key ? (
                    sort.desc ? (
                        <ArrowDown className="size-3" />
                    ) : (
                        <ArrowUp className="size-3" />
                    )
                ) : (
                    <ArrowUpDown className="size-3 opacity-40" />
                )}
            </button>
        </th>
    );

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-5">
                <Tile
                    title={t('Servers online')}
                    value={`${online} / ${rows.length}`}
                    detail={
                        offline > 0
                            ? t(':count offline', { count: offline })
                            : undefined
                    }
                    level={offline > 0 ? 'critical' : 'ok'}
                />
                <Tile
                    title={t('Need attention')}
                    value={problems}
                    detail={t('Open incidents: :count', { count: alerts })}
                    level={problems > 0 ? 'warning' : 'ok'}
                />
                <Tile
                    title={t('Average CPU')}
                    value={avgCpu === null ? '–' : `${Math.round(avgCpu)}%`}
                    level={
                        avgCpu === null
                            ? 'ok'
                            : usageLevel(avgCpu, thresholds.cpu)
                    }
                />
                <Tile
                    title={t('Average memory')}
                    value={avgRam === null ? '–' : `${Math.round(avgRam)}%`}
                    level={
                        avgRam === null
                            ? 'ok'
                            : usageLevel(avgRam, thresholds.ram)
                    }
                />
                <Tile
                    title={t('Network')}
                    value={`↓ ${formatBytes(rx)}/s`}
                    detail={`↑ ${formatBytes(tx)}/s`}
                />
            </div>

            <section className="overflow-hidden rounded-xl border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[56rem] text-sm">
                        <thead className="border-b bg-muted/40 text-left text-xs text-muted-foreground">
                            <tr>
                                {header('name', t('Server'))}
                                {header('cpu', t('CPU'))}
                                {header('ram', t('Memory'))}
                                {header('disk', t('Fullest disk'))}
                                {header('load', t('Load'))}
                                <th className="px-3 py-2 font-medium">
                                    {t('Network')}
                                </th>
                                <th className="px-3 py-2 font-medium">
                                    {t('Availability')}
                                </th>
                                {header('attention', t('Incidents'))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {rows.map((row) => {
                                const { server } = row;
                                const current = server.current;

                                return (
                                    <tr
                                        key={server.id}
                                        onClick={() => onOpen(server.id)}
                                        className="cursor-pointer hover:bg-muted/40"
                                    >
                                        <td className="px-3 py-2">
                                            <button
                                                type="button"
                                                className="flex items-center gap-2 text-left font-medium"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    onOpen(server.id);
                                                }}
                                            >
                                                <span
                                                    className={cn(
                                                        'size-2 shrink-0 rounded-full',
                                                        row.offline
                                                            ? 'bg-red-500'
                                                            : server.status ===
                                                                'online'
                                                              ? 'bg-emerald-500'
                                                              : 'bg-muted-foreground/40',
                                                    )}
                                                    title={
                                                        row.offline
                                                            ? t('Offline')
                                                            : server.status ===
                                                                'online'
                                                              ? t('Online')
                                                              : t('Unknown')
                                                    }
                                                />
                                                <span
                                                    className="size-2 shrink-0 rounded-sm"
                                                    style={{
                                                        backgroundColor:
                                                            row.color,
                                                    }}
                                                />
                                                <span className="truncate">
                                                    {server.name}
                                                </span>
                                            </button>
                                            {server.last_seen_at && (
                                                <p className="pl-8 text-xs text-muted-foreground">
                                                    {timeAgo(
                                                        server.last_seen_at,
                                                        fleet.generated_at,
                                                        locale,
                                                    )}
                                                </p>
                                            )}
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-10">
                                                    <Value
                                                        value={row.cpu}
                                                        level={
                                                            row.cpu === null
                                                                ? 'ok'
                                                                : usageLevel(
                                                                      row.cpu,
                                                                      thresholds.cpu,
                                                                  )
                                                        }
                                                    />
                                                </span>
                                                <Sparkline
                                                    className="w-20"
                                                    label={`${t('CPU')} ${server.name}`}
                                                    values={server.points
                                                        .map((p) => p.cpu)
                                                        .filter(
                                                            (v): v is number =>
                                                                v !== null,
                                                        )}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <div className="flex items-center gap-2">
                                                <span className="w-10">
                                                    <Value
                                                        value={row.ram}
                                                        level={
                                                            row.ram === null
                                                                ? 'ok'
                                                                : usageLevel(
                                                                      row.ram,
                                                                      thresholds.ram,
                                                                  )
                                                        }
                                                    />
                                                </span>
                                                <Sparkline
                                                    className="w-20"
                                                    label={`${t('Memory')} ${server.name}`}
                                                    values={server.points
                                                        .map((p) => p.ram)
                                                        .filter(
                                                            (v): v is number =>
                                                                v !== null,
                                                        )}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-3 py-2">
                                            <Value
                                                value={row.disk}
                                                level={
                                                    row.disk === null
                                                        ? 'ok'
                                                        : usageLevel(
                                                              row.disk,
                                                              thresholds.disk,
                                                          )
                                                }
                                            />
                                            {row.diskMount && (
                                                <span className="ml-1.5 text-xs text-muted-foreground">
                                                    {row.diskMount}
                                                </span>
                                            )}
                                        </td>
                                        <td
                                            className={cn(
                                                'px-3 py-2 tabular-nums',
                                                row.load !== null &&
                                                    row.load >= 1.5
                                                    ? levelText.critical
                                                    : row.load !== null &&
                                                        row.load >= 1
                                                      ? levelText.warning
                                                      : '',
                                            )}
                                        >
                                            {current
                                                ? current.load_1.toFixed(2)
                                                : '–'}
                                        </td>
                                        <td className="px-3 py-2 text-xs whitespace-nowrap text-muted-foreground tabular-nums">
                                            {current &&
                                            current.net_rx_bps !== null ? (
                                                <>
                                                    ↓{' '}
                                                    {formatBytes(
                                                        current.net_rx_bps,
                                                    )}
                                                    /s
                                                    <br />↑{' '}
                                                    {formatBytes(
                                                        current.net_tx_bps ?? 0,
                                                    )}
                                                    /s
                                                </>
                                            ) : (
                                                '–'
                                            )}
                                        </td>
                                        <td className="px-3 py-2 tabular-nums">
                                            {server.availability === null
                                                ? '–'
                                                : `${server.availability}%`}
                                        </td>
                                        <td className="px-3 py-2">
                                            {server.open_alerts > 0 ? (
                                                <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                                                    {server.open_alerts}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">
                                                    –
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </section>

            {times.length > 0 && (
                <div className="grid gap-3 lg:grid-cols-2">
                    {(['cpu', 'ram'] as const).map((key) => (
                        <section
                            key={key}
                            className="min-w-0 space-y-3 rounded-xl border bg-card p-3 sm:p-4"
                        >
                            <h2 className="text-sm font-medium">
                                {key === 'cpu' ? t('CPU') : t('Memory')}
                            </h2>
                            <LineChart
                                {...chartBase}
                                label={key === 'cpu' ? t('CPU') : t('Memory')}
                                series={series(key)}
                                thresholds={[
                                    {
                                        value: thresholds[key].warn,
                                        color: '#f59e0b',
                                        label: t('Warning'),
                                    },
                                    {
                                        value: thresholds[key].critical,
                                        color: '#ef4444',
                                        label: t('Critical'),
                                    },
                                ]}
                            />
                            <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                                {rows.map((row) => (
                                    <li
                                        key={row.server.id}
                                        className="flex items-center gap-1.5"
                                    >
                                        <span
                                            className="inline-block h-0.5 w-3 rounded-full"
                                            style={{
                                                backgroundColor: row.color,
                                            }}
                                        />
                                        {row.server.name}
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </div>
            )}
        </div>
    );
}
