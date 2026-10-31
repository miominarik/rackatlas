import type {
    DashboardDisk,
    DashboardMetrics,
    DashboardServer,
    DashboardThresholds,
} from '@/types';

export type Level =
    | 'ok'
    | 'warning'
    | 'critical'
    | 'offline'
    | 'stale'
    | 'unknown';

export type Problem = {
    severity: 'critical' | 'warning';
    serverId: number;
    serverName: string;
    kind: 'offline' | 'stale' | 'cpu' | 'ram' | 'disk' | 'unit';
    message: string;
    value: number;
};

export type Evaluated = {
    server: DashboardServer;
    level: Level;
    problems: Problem[];
    cpu: number | null;
    ram: number | null;
    disk: number | null;
};

type Translate = (
    key?: string,
    replacements?: Record<string, string | number>,
) => string;

/** Without a fresh check for this long the scheduler is probably not running. */
export const STALE_MINUTES = 5;

/** Worst first, used for sorting by status. */
export const levelRank: Record<Level, number> = {
    offline: 5,
    critical: 4,
    warning: 3,
    stale: 2,
    unknown: 1,
    ok: 0,
};

export const levelDot: Record<Level, string> = {
    ok: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
    offline: 'bg-red-500',
    stale: 'bg-zinc-400',
    unknown: 'bg-zinc-400',
};

export function percent(used: number, total: number): number {
    return total > 0 ? (used / total) * 100 : 0;
}

export function diskPercent(disk: DashboardDisk): number {
    return percent(disk.used_bytes, disk.total_bytes);
}

export function memoryPercent(metrics: DashboardMetrics): number {
    return percent(metrics.memory_used, metrics.memory_total);
}

export function minutesBetween(from: string, to: string): number {
    return (new Date(to).getTime() - new Date(from).getTime()) / 60000;
}

export function usageLevel(
    value: number,
    limits: { warn: number; critical: number },
): 'ok' | 'warning' | 'critical' {
    if (value >= limits.critical) {
        return 'critical';
    }

    return value >= limits.warn ? 'warning' : 'ok';
}

export function evaluateServer(
    server: DashboardServer,
    thresholds: DashboardThresholds,
    generatedAt: string,
    t: Translate,
): Evaluated {
    const metrics = server.metrics;
    const problems: Problem[] = [];

    const base = {
        serverId: server.id,
        serverName: server.name,
    };

    const evaluated: Evaluated = {
        server,
        level: 'unknown',
        problems,
        cpu: metrics ? metrics.cpu_percent : null,
        ram: metrics ? memoryPercent(metrics) : null,
        disk: metrics?.disks.length
            ? Math.max(...metrics.disks.map(diskPercent))
            : null,
    };

    if (!server.last_checked_at) {
        return evaluated;
    }

    if (server.status === 'offline') {
        problems.push({
            ...base,
            severity: 'critical',
            kind: 'offline',
            message: t('Server is offline'),
            value: 1000,
        });
        evaluated.level = 'offline';

        return evaluated;
    }

    const minutesStale = minutesBetween(server.last_checked_at, generatedAt);

    if (minutesStale > STALE_MINUTES) {
        problems.push({
            ...base,
            severity: 'warning',
            kind: 'stale',
            message: t('No fresh data for :minutes min', {
                minutes: Math.floor(minutesStale),
            }),
            value: minutesStale,
        });
        evaluated.level = 'stale';
    }

    if (!metrics) {
        return evaluated;
    }

    const checks: {
        kind: 'cpu' | 'ram' | 'disk';
        value: number;
        limits: { warn: number; critical: number };
        message: string;
    }[] = [
        {
            kind: 'cpu',
            value: metrics.cpu_percent,
            limits: thresholds.cpu,
            message: t('CPU at :value%', {
                value: Math.round(metrics.cpu_percent),
            }),
        },
        {
            kind: 'ram',
            value: memoryPercent(metrics),
            limits: thresholds.ram,
            message: t('Memory at :value%', {
                value: Math.round(memoryPercent(metrics)),
            }),
        },
        ...metrics.disks.map((disk) => ({
            kind: 'disk' as const,
            value: diskPercent(disk),
            limits: thresholds.disk,
            message: t('Disk :mount at :value%', {
                mount: disk.mount,
                value: Math.round(diskPercent(disk)),
            }),
        })),
    ];

    let worst: Level = evaluated.level;

    for (const unit of server.failed_units) {
        problems.push({
            ...base,
            severity: 'warning',
            kind: 'unit',
            message: t('Service :unit has failed', { unit }),
            value: 0,
        });

        if (levelRank.warning > levelRank[worst]) {
            worst = 'warning';
        }
    }

    for (const check of checks) {
        const level = usageLevel(check.value, check.limits);

        if (level === 'ok') {
            continue;
        }

        problems.push({
            ...base,
            severity: level,
            kind: check.kind,
            message: check.message,
            value: check.value,
        });

        if (levelRank[level] > levelRank[worst]) {
            worst = level;
        }
    }

    evaluated.level = worst === 'unknown' ? 'ok' : worst;

    return evaluated;
}

/** Critical before warning, then the biggest value first. */
export function sortProblems(problems: Problem[]): Problem[] {
    return [...problems].sort((a, b) => {
        if (a.severity !== b.severity) {
            return a.severity === 'critical' ? -1 : 1;
        }

        return b.value - a.value;
    });
}

export function formatBytes(bytes: number): string {
    if (bytes <= 0) {
        return '0 B';
    }

    const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    const index = Math.min(
        units.length - 1,
        Math.floor(Math.log(bytes) / Math.log(1024)),
    );
    const value = bytes / 1024 ** index;

    return `${value >= 100 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}

export function formatUptime(seconds: number, t: Translate): string {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    if (days > 0) {
        return t(':days d :hours h', { days, hours });
    }

    if (hours > 0) {
        return t(':hours h :minutes min', { hours, minutes });
    }

    return t(':minutes min', { minutes });
}

/** Relative to the time the server generated the page, so the browser clock does not matter. */
export function timeAgo(iso: string, now: string, locale: string): string {
    const seconds = Math.round(
        (new Date(iso).getTime() - new Date(now).getTime()) / 1000,
    );
    const formatter = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });

    if (Math.abs(seconds) < 60) {
        return formatter.format(Math.min(seconds, 0), 'second');
    }

    if (Math.abs(seconds) < 3600) {
        return formatter.format(Math.round(seconds / 60), 'minute');
    }

    if (Math.abs(seconds) < 86400) {
        return formatter.format(Math.round(seconds / 3600), 'hour');
    }

    return formatter.format(Math.round(seconds / 86400), 'day');
}

/** The name of a period of the dashboard lists, from their length in hours. */
export function periodLabel(hours: number, t: Translate): string {
    if (hours <= 6) {
        return t('Last 6 hours');
    }

    return hours >= 168 ? t('Last 7 days') : t('Last 24 hours');
}

/** The name of the range of the small charts, from its length in minutes. */
export function historyLabel(minutes: number, t: Translate): string {
    if (minutes >= 1440) {
        return t('CPU in the last 24 hours');
    }

    return minutes >= 360
        ? t('CPU in the last 6 hours')
        : t('CPU in the last hour');
}
