import { Head, Link, router } from '@inertiajs/react';
import { Check, CheckCheck, Copy, RotateCcw, ScrollText } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import LogController from '@/actions/App/Http/Controllers/Servers/LogController';
import { levelStyle } from '@/components/dashboard/recent-logs';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { usePermissions } from '@/hooks/use-permissions';
import { useTranslation } from '@/hooks/use-translation';
import { timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index } from '@/routes/logs';
import { index as teamsIndex } from '@/routes/teams';
import type { DashboardLog } from '@/types';

type LogEntry = DashboardLog & {
    resolved_at: string | null;
    resolved_by: string | null;
};

type Props = {
    team: { id: number; name: string } | null;
    logs: {
        data: LogEntry[];
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    servers: { id: number; name: string }[];
    filters: {
        server: number | null;
        level: string | null;
        status: 'open' | 'resolved' | 'all';
    };
    open_count: number;
    retention_days: number;
    generated_at: string;
};

const ALL = 'all';

const DOT = {
    critical: 'bg-red-500',
    error: 'bg-amber-500',
} as const;

function LogDetail({
    log,
    generatedAt,
    onResolve,
    onReopen,
    canEdit,
}: {
    log: LogEntry;
    canEdit: boolean;
    generatedAt: string;
    onResolve: () => void;
    onReopen: () => void;
}) {
    const { t, locale } = useTranslation();

    const copy = async () => {
        try {
            await navigator.clipboard.writeText(log.message);
            toast.success(t('Copied.'));
        } catch {
            toast.error(t('Copy failed.'));
        }
    };

    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <span
                    className={cn(
                        'inline-block rounded-md px-2 py-0.5 text-xs font-medium tracking-wide uppercase',
                        levelStyle[log.level],
                    )}
                >
                    {t(log.level === 'critical' ? 'Critical' : 'Error')}
                </span>
                <h2 className="text-lg font-semibold">{log.server_name}</h2>
            </div>

            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                        {t('Message')}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={copy}>
                        <Copy className="size-3.5" />
                        {t('Copy')}
                    </Button>
                </div>
                <pre className="max-h-80 overflow-auto rounded-lg border bg-muted/50 p-4 font-mono text-xs leading-relaxed break-words whitespace-pre-wrap">
                    {log.message}
                </pre>
            </div>

            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 text-sm">
                <div>
                    <dt className="text-xs text-muted-foreground">
                        {t('Time')}
                    </dt>
                    <dd className="mt-1">
                        {new Date(log.occurred_at).toLocaleString(locale)}
                        <span className="block text-xs text-muted-foreground">
                            {timeAgo(log.occurred_at, generatedAt, locale)}
                        </span>
                    </dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">
                        {t('Source')}
                    </dt>
                    <dd className="mt-1 break-words">{log.source}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">
                        {t('Occurrences')}
                    </dt>
                    <dd className="mt-1 tabular-nums">×{log.count}</dd>
                </div>
                <div>
                    <dt className="text-xs text-muted-foreground">
                        {t('Status')}
                    </dt>
                    <dd className="mt-1">
                        {log.resolved_at ? (
                            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                                <Check className="size-4" />
                                {log.resolved_by
                                    ? t('Resolved by :name', {
                                          name: log.resolved_by,
                                      })
                                    : t('Resolved automatically')}
                            </span>
                        ) : (
                            t('Open')
                        )}
                    </dd>
                </div>
            </dl>

            <div className="border-t pt-5">
                {!canEdit ? null : log.resolved_at ? (
                    <Button variant="outline" onClick={onReopen}>
                        <RotateCcw className="size-4" />
                        {t('Reopen')}
                    </Button>
                ) : (
                    <Button onClick={onResolve}>
                        <Check className="size-4" />
                        {t('Mark as resolved')}
                    </Button>
                )}
            </div>
        </div>
    );
}

export default function Logs({
    team,
    logs,
    servers,
    filters,
    open_count,
    retention_days,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();
    const canEdit = usePermissions().can('logs.edit');
    const [selectedId, setSelectedId] = useState<number | null>(null);

    if (!team) {
        return (
            <>
                <Head title={t('Logs')} />
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

    const filter = (next: {
        server?: string;
        level?: string;
        status?: string;
    }) => {
        const server = next.server ?? String(filters.server ?? ALL);
        const level = next.level ?? filters.level ?? ALL;
        const status = next.status ?? filters.status;

        router.get(
            index(),
            {
                ...(server !== ALL && { server }),
                ...(level !== ALL && { level }),
                ...(status !== 'open' && { status }),
            },
            { preserveState: true, replace: true },
        );
    };

    const resolve = (log: LogEntry) =>
        router.post(
            LogController.resolve.url(log.id),
            {},
            { preserveScroll: true },
        );

    const reopen = (log: LogEntry) =>
        router.delete(LogController.reopen.url(log.id), {
            preserveScroll: true,
        });

    const resolveAll = () =>
        router.post(
            LogController.resolveAll.url(),
            {
                ...(filters.server && { server: filters.server }),
                ...(filters.level && { level: filters.level }),
            },
            { preserveScroll: true },
        );

    const activeId = logs.data.some((log) => log.id === selectedId)
        ? selectedId
        : (logs.data[0]?.id ?? null);
    const active = logs.data.find((log) => log.id === activeId) ?? null;

    const statuses = [
        { value: 'open', label: t('Open') },
        { value: 'resolved', label: t('Resolved') },
        { value: 'all', label: t('All entries') },
    ] as const;

    return (
        <>
            <Head title={t('Logs')} />

            <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-6 p-4 md:p-6 lg:h-[calc(100svh-5rem)] lg:overflow-hidden">
                <div className="space-y-1 lg:shrink-0">
                    <h1 className="text-2xl font-semibold">{t('Logs')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'Only what is wrong: critical and error entries from the servers with the agent. Kept for :days days.',
                            { days: retention_days },
                        )}
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-4 lg:shrink-0">
                    <div
                        role="tablist"
                        className="flex w-full rounded-lg bg-muted p-1 sm:inline-flex sm:w-auto"
                    >
                        {statuses.map((status) => (
                            <button
                                key={status.value}
                                type="button"
                                role="tab"
                                aria-selected={filters.status === status.value}
                                onClick={() => filter({ status: status.value })}
                                className={cn(
                                    'flex flex-1 items-center justify-center gap-2 rounded-md px-3.5 py-1.5 text-sm transition-colors sm:flex-none',
                                    filters.status === status.value
                                        ? 'bg-card font-medium shadow-xs'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {status.label}
                                {status.value === 'open' && open_count > 0 && (
                                    <span className="rounded-full bg-red-500/10 px-1.5 text-xs text-red-700 tabular-nums dark:text-red-300">
                                        {open_count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>

                    <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                        <Select
                            value={String(filters.server ?? ALL)}
                            onValueChange={(server) => filter({ server })}
                        >
                            <SelectTrigger
                                className="w-full sm:w-44"
                                aria-label={t('Server')}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t('All servers')}
                                </SelectItem>
                                {servers.map((server) => (
                                    <SelectItem
                                        key={server.id}
                                        value={String(server.id)}
                                    >
                                        {server.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.level ?? ALL}
                            onValueChange={(level) => filter({ level })}
                        >
                            <SelectTrigger
                                className="w-full sm:w-36"
                                aria-label={t('Level')}
                            >
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>
                                    {t('All levels')}
                                </SelectItem>
                                <SelectItem value="critical">
                                    {t('Critical')}
                                </SelectItem>
                                <SelectItem value="error">
                                    {t('Error')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        {canEdit &&
                            open_count > 0 &&
                            filters.status !== 'resolved' && (
                                <Button variant="outline" onClick={resolveAll}>
                                    <CheckCheck className="size-4" />
                                    {t('Mark all as resolved')}
                                </Button>
                            )}
                    </div>
                </div>

                {logs.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-14 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <ScrollText className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {filters.status === 'resolved'
                                ? t('No resolved entries yet')
                                : t('No problems in the logs')}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                'When a server with the agent logs an error, it shows up here.',
                            )}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6 lg:min-h-0 lg:flex-1 lg:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
                        <ul className="space-y-3 lg:min-h-0 lg:overflow-y-auto lg:pr-1 lg:pb-1">
                            {logs.data.map((log) => (
                                <li key={log.id}>
                                    <div
                                        className={cn(
                                            'overflow-hidden rounded-xl border bg-card transition-colors',
                                            log.id === activeId &&
                                                'border-primary/60 ring-1 ring-primary/30',
                                            log.resolved_at && 'opacity-70',
                                        )}
                                    >
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedId(
                                                    log.id === selectedId
                                                        ? null
                                                        : log.id,
                                                )
                                            }
                                            className="flex w-full items-start gap-3 p-4 text-left hover:bg-muted/40 sm:gap-4 sm:p-5"
                                        >
                                            <span
                                                className={cn(
                                                    'mt-1.5 size-2.5 shrink-0 rounded-full',
                                                    log.resolved_at
                                                        ? 'bg-emerald-500'
                                                        : DOT[log.level],
                                                )}
                                            />
                                            <span className="min-w-0 flex-1 space-y-2">
                                                <span className="flex items-baseline justify-between gap-3">
                                                    <span className="truncate font-medium">
                                                        {log.server_name}
                                                    </span>
                                                    <span className="shrink-0 text-xs text-muted-foreground">
                                                        {timeAgo(
                                                            log.occurred_at,
                                                            generated_at,
                                                            locale,
                                                        )}
                                                    </span>
                                                </span>
                                                <span className="line-clamp-2 block text-sm break-words text-muted-foreground">
                                                    {log.message}
                                                </span>
                                            </span>
                                        </button>

                                        {log.id === selectedId && (
                                            <div className="border-t p-4 sm:p-5 lg:hidden">
                                                <LogDetail
                                                    log={log}
                                                    generatedAt={generated_at}
                                                    onResolve={() =>
                                                        resolve(log)
                                                    }
                                                    onReopen={() => reopen(log)}
                                                    canEdit={canEdit}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}

                            {(logs.prev_page_url || logs.next_page_url) && (
                                <li className="flex justify-between pt-2">
                                    <Button
                                        variant="outline"
                                        disabled={!logs.prev_page_url}
                                        asChild={!!logs.prev_page_url}
                                    >
                                        {logs.prev_page_url ? (
                                            <Link href={logs.prev_page_url}>
                                                {t('Newer')}
                                            </Link>
                                        ) : (
                                            <span>{t('Newer')}</span>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        disabled={!logs.next_page_url}
                                        asChild={!!logs.next_page_url}
                                    >
                                        {logs.next_page_url ? (
                                            <Link href={logs.next_page_url}>
                                                {t('Older')}
                                            </Link>
                                        ) : (
                                            <span>{t('Older')}</span>
                                        )}
                                    </Button>
                                </li>
                            )}
                        </ul>

                        <aside className="hidden min-h-0 overflow-y-auto rounded-xl border bg-card p-8 lg:block">
                            {active ? (
                                <LogDetail
                                    key={active.id}
                                    log={active}
                                    generatedAt={generated_at}
                                    onResolve={() => resolve(active)}
                                    onReopen={() => reopen(active)}
                                    canEdit={canEdit}
                                />
                            ) : (
                                <p className="text-sm text-muted-foreground">
                                    {t('Select an entry to see its details')}
                                </p>
                            )}
                        </aside>
                    </div>
                )}
            </div>
        </>
    );
}

Logs.layout = {
    breadcrumbs: [{ title: 'Logs', href: index() }],
};
