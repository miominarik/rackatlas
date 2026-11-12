import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import {
    diskPercent,
    formatUptime,
    levelDot,
    memoryPercent,
    usageLevel,
} from '@/lib/dashboard';
import type { Evaluated } from '@/lib/dashboard';
import { serverAddress } from '@/lib/server-address';
import { dotClass } from '@/lib/server-colors';
import { cn } from '@/lib/utils';
import { show as showServer } from '@/routes/servers';
import type { DashboardSettings } from '@/types';

const text: Record<string, string> = {
    ok: '',
    warning: 'font-medium text-amber-600 dark:text-amber-400',
    critical: 'font-medium text-red-600 dark:text-red-400',
};

/** One server as a single line, for a long list of servers. */
export default function ServerRow({
    evaluated,
    settings,
    className,
}: {
    evaluated: Evaluated;
    settings: DashboardSettings;
    className?: string;
}) {
    const { t } = useTranslation();
    const { server, level } = evaluated;
    const metrics = server.metrics;
    const thresholds = settings.thresholds;
    const show = (id: DashboardSettings['servers']['metrics'][number]) =>
        settings.servers.metrics.includes(id);

    const worstDisk = metrics?.disks.length
        ? Math.max(...metrics.disks.map(diskPercent))
        : null;

    const cell = (
        key: 'cpu' | 'ram' | 'disk',
        value: number | null,
        label: string,
    ) => (
        <span
            className={cn(
                'w-20 shrink-0 text-right tabular-nums',
                value === null && 'text-muted-foreground',
                value !== null && text[usageLevel(value, thresholds[key])],
            )}
        >
            <span className="mr-1 text-xs text-muted-foreground">{label}</span>
            {value === null ? '–' : `${Math.round(value)}%`}
        </span>
    );

    return (
        <li
            className={cn(
                'flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm',
                level !== 'ok' &&
                    level !== 'unknown' &&
                    (level === 'warning' || level === 'stale'
                        ? 'bg-amber-500/[0.05]'
                        : 'bg-red-500/[0.05]'),
                className,
            )}
        >
            <span
                className={cn(
                    'size-2.5 shrink-0 rounded-full',
                    levelDot[level],
                )}
            />
            <span className="min-w-0 flex-1 basis-40">
                <Link
                    href={showServer(server.id)}
                    className="block truncate font-medium hover:underline"
                    data-test="server-link"
                >
                    {server.name}
                </Link>
                <span className="block truncate font-mono text-xs text-muted-foreground">
                    {serverAddress(server, t('Agent'))}
                </span>
                {evaluated.problems.length > 0 && (
                    <span
                        className={cn(
                            'block truncate text-xs',
                            level === 'warning' || level === 'stale'
                                ? text.warning
                                : text.critical,
                        )}
                        title={evaluated.problems
                            .map((problem) => problem.message)
                            .join(', ')}
                    >
                        {evaluated.problems
                            .map((problem) => problem.message)
                            .join(' · ')}
                    </span>
                )}
            </span>
            {server.category && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span
                        className={cn(
                            'size-1.5 rounded-full',
                            dotClass(server.category.color),
                        )}
                    />
                    {server.category.name}
                </span>
            )}
            {metrics &&
                show('cpu') &&
                cell('cpu', metrics.cpu_percent, t('CPU'))}
            {metrics &&
                show('ram') &&
                cell('ram', memoryPercent(metrics), t('RAM'))}
            {metrics && show('disk') && cell('disk', worstDisk, t('Disk'))}
            {metrics && show('uptime') && (
                <span className="w-24 shrink-0 text-right text-xs text-muted-foreground">
                    {formatUptime(metrics.uptime_seconds, t)}
                </span>
            )}
        </li>
    );
}
