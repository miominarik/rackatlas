import { Clock, Cpu, ServerOff } from 'lucide-react';
import Sparkline from '@/components/dashboard/sparkline';
import UsageBar from '@/components/dashboard/usage-bar';
import { useTranslation } from '@/hooks/use-translation';
import {
    diskPercent,
    formatBytes,
    formatUptime,
    historyLabel,
    levelDot,
    memoryPercent,
    timeAgo,
    usageLevel,
} from '@/lib/dashboard';
import type { Evaluated } from '@/lib/dashboard';
import { serverAddress } from '@/lib/server-address';
import { dotClass } from '@/lib/server-colors';
import { cn } from '@/lib/utils';
import type { DashboardSettings } from '@/types';

type Props = {
    evaluated: Evaluated;
    settings: DashboardSettings;
    history: { cpu: number; ram: number }[];
    generatedAt: string;
};

// The left edge of the card is the status light of a rack unit: it is readable from across the room.
const border: Record<string, string> = {
    ok: 'border-l-emerald-500',
    warning: 'border-l-amber-500',
    critical: 'border-l-red-500 bg-red-500/[0.04]',
    offline: 'border-l-red-500 bg-red-500/[0.04]',
    stale: 'border-l-muted-foreground/40 border-dashed',
    unknown: 'border-l-muted-foreground/40 border-dashed',
};

export default function ServerCard({
    evaluated,
    settings,
    history,
    generatedAt,
}: Props) {
    const { t, locale } = useTranslation();
    const { server, level } = evaluated;
    const metrics = server.metrics;
    const show = (id: DashboardSettings['servers']['metrics'][number]) =>
        settings.servers.metrics.includes(id);
    const compact = settings.servers.density === 'compact';
    const thresholds = settings.thresholds;

    const levelLabel = {
        ok: t('Healthy'),
        warning: t('Warning'),
        critical: t('Critical'),
        offline: t('Offline'),
        stale: t('Outdated data'),
        unknown: t('Not checked yet'),
    }[level];

    return (
        <article
            className={cn(
                'flex flex-col gap-3 rounded-lg border border-l-4 bg-card p-4 text-card-foreground',
                compact && 'gap-2 p-3',
                border[level],
            )}
            aria-label={`${server.name}: ${levelLabel}`}
        >
            <header className="flex items-start gap-3">
                <span
                    title={levelLabel}
                    className={cn(
                        'mt-1.5 size-2.5 shrink-0 rounded-full',
                        levelDot[level],
                        level === 'ok' &&
                            'shadow-[0_0_0_3px] shadow-emerald-500/20',
                    )}
                />
                <div className="min-w-0 flex-1">
                    <h3 className="truncate text-xl leading-tight font-semibold">
                        {server.name}
                    </h3>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                        {serverAddress(server, t('Agent'))}
                    </p>
                </div>
                {server.category && (
                    <span className="inline-flex max-w-[40%] shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] text-muted-foreground">
                        <span
                            className={cn(
                                'size-1.5 rounded-full',
                                dotClass(server.category.color),
                            )}
                        />
                        <span className="truncate">{server.category.name}</span>
                    </span>
                )}
            </header>

            {level === 'offline' && (
                <div className="flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                    <ServerOff className="size-4 shrink-0" />
                    <span>
                        {server.last_seen_at
                            ? t('Offline, last seen :time', {
                                  time: timeAgo(
                                      server.last_seen_at,
                                      generatedAt,
                                      locale,
                                  ),
                              })
                            : t('Offline, never reached')}
                    </span>
                </div>
            )}

            {level === 'unknown' && (
                <p className="text-sm text-muted-foreground">
                    {t('Waiting for the first check…')}
                </p>
            )}

            {server.failed_units.length > 0 && (
                <p className="truncate text-xs text-amber-600 dark:text-amber-400">
                    {t('Failed services: :units', {
                        units: server.failed_units.join(', '),
                    })}
                </p>
            )}

            {metrics && compact && (
                <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
                    {show('cpu') && (
                        <span>CPU {Math.round(metrics.cpu_percent)}%</span>
                    )}
                    {show('ram') && (
                        <span>RAM {Math.round(memoryPercent(metrics))}%</span>
                    )}
                    {show('disk') && evaluated.disk !== null && (
                        <span>
                            {t('Disk')} {Math.round(evaluated.disk)}%
                        </span>
                    )}
                    {show('uptime') && (
                        <span className="text-muted-foreground">
                            {formatUptime(metrics.uptime_seconds, t)}
                        </span>
                    )}
                </div>
            )}

            {metrics && !compact && (
                <div className="space-y-2.5">
                    {show('cpu') && (
                        <div className="space-y-1">
                            <UsageBar
                                label={t('CPU')}
                                value={metrics.cpu_percent}
                                level={usageLevel(
                                    metrics.cpu_percent,
                                    thresholds.cpu,
                                )}
                                detail={t(':count cores', {
                                    count: metrics.cpu_cores,
                                })}
                            />
                            {settings.servers.show_history && (
                                <Sparkline
                                    values={history.map((point) => point.cpu)}
                                    label={historyLabel(
                                        settings.servers.history_minutes,
                                        t,
                                    )}
                                />
                            )}
                        </div>
                    )}
                    {show('ram') && (
                        <UsageBar
                            label={t('Memory')}
                            value={memoryPercent(metrics)}
                            level={usageLevel(
                                memoryPercent(metrics),
                                thresholds.ram,
                            )}
                            detail={`${formatBytes(metrics.memory_used)} / ${formatBytes(metrics.memory_total)}`}
                        />
                    )}
                    {show('disk') &&
                        [...metrics.disks]
                            .sort((a, b) => diskPercent(b) - diskPercent(a))
                            .slice(0, 3)
                            .map((disk) => (
                                <UsageBar
                                    key={disk.mount}
                                    label={`${t('Disk')} ${disk.mount}`}
                                    value={diskPercent(disk)}
                                    level={usageLevel(
                                        diskPercent(disk),
                                        thresholds.disk,
                                    )}
                                    detail={`${formatBytes(disk.used_bytes)} / ${formatBytes(disk.total_bytes)}`}
                                />
                            ))}
                    {show('disk') && metrics.disks.length > 3 && (
                        <p className="text-xs text-muted-foreground">
                            {t('+ :count more disks', {
                                count: metrics.disks.length - 3,
                            })}
                        </p>
                    )}
                </div>
            )}

            {metrics && !compact && (show('load') || show('uptime')) && (
                <footer className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t pt-2.5 text-xs text-muted-foreground">
                    {show('load') && (
                        <span
                            className="inline-flex items-center gap-1 font-mono"
                            title={t('Load average 1 / 5 / 15 min')}
                        >
                            <Cpu className="size-3" />
                            {metrics.load_1.toFixed(2)} ·{' '}
                            {metrics.load_5.toFixed(2)} ·{' '}
                            {metrics.load_15.toFixed(2)}
                        </span>
                    )}
                    {show('uptime') && (
                        <span className="inline-flex items-center gap-1">
                            <Clock className="size-3" />
                            {t('up :time', {
                                time: formatUptime(metrics.uptime_seconds, t),
                            })}
                        </span>
                    )}
                </footer>
            )}

            {metrics && (
                <p className="text-[11px] text-muted-foreground/70">
                    {t('Updated :time', {
                        time: timeAgo(
                            metrics.collected_at,
                            generatedAt,
                            locale,
                        ),
                    })}
                </p>
            )}
        </article>
    );
}
