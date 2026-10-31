import { Head, Link } from '@inertiajs/react';
import { Activity, Pencil } from 'lucide-react';
import RecentErrors from '@/components/dashboard/recent-errors';
import RecentLogs from '@/components/dashboard/recent-logs';
import UsageBar from '@/components/dashboard/usage-bar';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import {
    diskPercent,
    evaluateServer,
    formatBytes,
    formatUptime,
    levelDot,
    memoryPercent,
    timeAgo,
    usageLevel,
} from '@/lib/dashboard';
import { serverAddress } from '@/lib/server-address';
import { dotClass } from '@/lib/server-colors';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index as metricsIndex } from '@/routes/metrics';
import { edit, index as serversIndex } from '@/routes/servers';
import type {
    DashboardError,
    DashboardLog,
    DashboardServer,
    DashboardThresholds,
    MetricsIncident,
} from '@/types';

type SystemInfo = {
    hostname?: string;
    os?: string;
    kernel?: string;
    arch?: string;
    cpu_model?: string;
    virtualization?: string;
    updates?: number;
    security_updates?: number;
    reboot_required?: boolean;
};

type Props = {
    server: Omit<DashboardServer, 'metrics'> & {
        metrics:
            | (NonNullable<DashboardServer['metrics']> & {
                  net_rx_bps: number | null;
                  net_tx_bps: number | null;
              })
            | null;
        system_info: SystemInfo | null;
        ssh_key_name: string | null;
        ssh_host_fingerprint: string | null;
        agent_version: string | null;
        created_at: string | null;
    };
    canManage: boolean;
    thresholds: DashboardThresholds;
    alerts: MetricsIncident[];
    logs: DashboardLog[];
    errors: DashboardError[];
    generated_at: string;
};

function Section({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section aria-label={title} className="space-y-2">
            <h2 className="text-sm font-medium">{title}</h2>
            {children}
        </section>
    );
}

function Field({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div className="flex flex-wrap justify-between gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="min-w-0 break-all">{children}</dd>
        </div>
    );
}

export default function ServerShow({
    server,
    canManage,
    thresholds,
    alerts,
    logs,
    errors,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();
    const metrics = server.metrics;
    const { level } = evaluateServer(server, thresholds, generated_at, t);

    const levelLabel = {
        ok: t('Healthy'),
        warning: t('Warning'),
        critical: t('Critical'),
        offline: t('Offline'),
        stale: t('Outdated data'),
        unknown: t('Not checked yet'),
    }[level];

    const authLabel = {
        password: t('Password'),
        key: t('SSH key'),
        agent: t('Agent'),
    }[server.auth_type];

    const ignoredLabel: Record<string, string> = {
        cpu: t('CPU'),
        ram: t('Memory'),
        disk: t('Disks'),
        services: t('Failed services'),
        logs: t('Critical log entries'),
    };

    const alertLabel = (alert: MetricsIncident): string => {
        if (alert.type === 'offline') {
            return t('Server was offline');
        }

        if (alert.key === 'cpu') {
            return t('High CPU usage');
        }

        if (alert.key === 'ram') {
            return t('High memory usage');
        }

        if (alert.key.startsWith('disk:')) {
            return t('Disk :mount almost full', { mount: alert.key.slice(5) });
        }

        if (alert.key.startsWith('unit:')) {
            return t('Service :unit has failed', {
                unit: alert.key.slice(5),
            });
        }

        return alert.key;
    };

    const ago = (iso: string) => timeAgo(iso, generated_at, locale);

    return (
        <>
            <Head title={server.name} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <span
                            title={levelLabel}
                            className={cn(
                                'mt-2.5 size-3 shrink-0 rounded-full',
                                levelDot[level],
                            )}
                        />
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-semibold">
                                {server.name}
                            </h1>
                            <p className="truncate font-mono text-sm text-muted-foreground">
                                {serverAddress(server, t('Agent'))}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {levelLabel}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" asChild>
                            <Link
                                href={metricsIndex({
                                    query: { server: server.id },
                                })}
                            >
                                <Activity className="size-4" />
                                {t('Metrics')}
                            </Link>
                        </Button>
                        {canManage && (
                            <Button variant="outline" asChild>
                                <Link href={edit(server.id)}>
                                    <Pencil className="size-4" />
                                    {t('Edit')}
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {server.failed_units.length > 0 && (
                    <p className="rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-300">
                        {t('Failed services: :units', {
                            units: server.failed_units.join(', '),
                        })}
                    </p>
                )}

                <Section title={t('Current state')}>
                    {metrics ? (
                        <div className="space-y-3 rounded-xl border bg-card p-4">
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
                            <UsageBar
                                label={t('Memory')}
                                value={memoryPercent(metrics)}
                                level={usageLevel(
                                    memoryPercent(metrics),
                                    thresholds.ram,
                                )}
                                detail={`${formatBytes(metrics.memory_used)} / ${formatBytes(metrics.memory_total)}`}
                            />
                            {metrics.swap_total > 0 && (
                                <UsageBar
                                    label={t('Swap')}
                                    value={
                                        (metrics.swap_used /
                                            metrics.swap_total) *
                                        100
                                    }
                                    level="ok"
                                    detail={`${formatBytes(metrics.swap_used)} / ${formatBytes(metrics.swap_total)}`}
                                />
                            )}
                            {[...metrics.disks]
                                .sort((a, b) => diskPercent(b) - diskPercent(a))
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
                            <p className="text-xs text-muted-foreground">
                                {t('Network')}:{' '}
                                {metrics.net_rx_bps !== null &&
                                metrics.net_tx_bps !== null
                                    ? `↓ ${formatBytes(metrics.net_rx_bps)}/s · ↑ ${formatBytes(metrics.net_tx_bps)}/s`
                                    : server.auth_type === 'agent'
                                      ? t(
                                            'no data yet, it needs the agent 1.3.0 or newer',
                                        )
                                      : t('only available with the agent')}
                            </p>
                            <p className="border-t pt-3 font-mono text-xs text-muted-foreground">
                                {t('Load average 1 / 5 / 15 min')}:{' '}
                                {metrics.load_1.toFixed(2)} ·{' '}
                                {metrics.load_5.toFixed(2)} ·{' '}
                                {metrics.load_15.toFixed(2)}
                                {' · '}
                                {t('up :time', {
                                    time: formatUptime(
                                        metrics.uptime_seconds,
                                        t,
                                    ),
                                })}
                                {' · '}
                                {t('Updated :time', {
                                    time: ago(metrics.collected_at),
                                })}
                            </p>
                        </div>
                    ) : (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t('Waiting for the first check…')}
                        </p>
                    )}
                </Section>

                <Section title={t('Server settings')}>
                    <dl className="divide-y overflow-hidden rounded-xl border bg-card">
                        <Field label={t('Address')}>
                            {serverAddress(server, t('Agent'))}
                        </Field>
                        <Field label={t('Authentication')}>
                            {authLabel}
                            {server.ssh_key_name && ` · ${server.ssh_key_name}`}
                        </Field>
                        <Field label={t('Category')}>
                            {server.category ? (
                                <span className="inline-flex items-center gap-1.5">
                                    <span
                                        className={cn(
                                            'size-2 rounded-full',
                                            dotClass(server.category.color),
                                        )}
                                    />
                                    {server.category.name}
                                </span>
                            ) : (
                                '–'
                            )}
                        </Field>
                        {server.auth_type === 'agent' && (
                            <Field label={t('Agent version')}>
                                {server.agent_version ?? '–'}
                            </Field>
                        )}
                        {server.ssh_host_fingerprint && (
                            <Field label={t('Host key')}>
                                <span className="font-mono text-xs">
                                    {server.ssh_host_fingerprint}
                                </span>
                            </Field>
                        )}
                        <Field label={t('Last data')}>
                            {server.last_seen_at
                                ? ago(server.last_seen_at)
                                : server.last_checked_at
                                  ? ago(server.last_checked_at)
                                  : '–'}
                        </Field>
                        <Field label={t('Added')}>
                            {server.created_at ? ago(server.created_at) : '–'}
                        </Field>
                        <Field label={t('Ignore warnings about')}>
                            {server.ignored_alerts.length > 0
                                ? server.ignored_alerts
                                      .map((key) => ignoredLabel[key] ?? key)
                                      .join(', ')
                                : t('None')}
                        </Field>
                    </dl>
                </Section>

                {server.system_info && (
                    <Section title={t('System')}>
                        <dl className="divide-y overflow-hidden rounded-xl border bg-card">
                            {(
                                [
                                    ['Hostname', server.system_info.hostname],
                                    ['Operating system', server.system_info.os],
                                    ['Kernel', server.system_info.kernel],
                                    ['Architecture', server.system_info.arch],
                                    ['Processor', server.system_info.cpu_model],
                                    [
                                        'Virtualization',
                                        server.system_info.virtualization,
                                    ],
                                ] as const
                            )
                                .filter(([, value]) => value)
                                .map(([label, value]) => (
                                    <Field key={label} label={t(label)}>
                                        {value}
                                    </Field>
                                ))}
                            {server.system_info.updates !== undefined && (
                                <Field label={t('Pending updates')}>
                                    {server.system_info.updates}
                                    {server.system_info.security_updates
                                        ? ` (${t(':count security', { count: server.system_info.security_updates })})`
                                        : ''}
                                </Field>
                            )}
                            {server.system_info.reboot_required !==
                                undefined && (
                                <Field label={t('Restart required')}>
                                    {server.system_info.reboot_required
                                        ? t('Yes')
                                        : t('No')}
                                </Field>
                            )}
                        </dl>
                    </Section>
                )}

                <Section title={t('Recent problems')}>
                    {alerts.length === 0 ? (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t('No problems recorded for this server.')}
                        </p>
                    ) : (
                        <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                            {alerts.map((alert) => (
                                <li
                                    key={alert.id}
                                    className="flex flex-wrap items-baseline justify-between gap-x-3 px-4 py-2.5 text-sm"
                                >
                                    <span>{alertLabel(alert)}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {alert.resolved_at
                                            ? t('Resolved :time', {
                                                  time: ago(alert.resolved_at),
                                              })
                                            : t('Open since :time', {
                                                  time: ago(alert.opened_at),
                                              })}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </Section>

                <RecentLogs
                    logs={logs}
                    generatedAt={generated_at}
                    hours={168}
                />
                <RecentErrors
                    errors={errors}
                    generatedAt={generated_at}
                    hours={168}
                />
            </div>
        </>
    );
}

ServerShow.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Servers', href: serversIndex() },
    ],
};
