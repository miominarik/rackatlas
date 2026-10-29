import { Head, Link, router } from '@inertiajs/react';
import { Check, CheckCheck, RotateCcw, ScrollText } from 'lucide-react';
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
    filters: { server: number | null; level: string | null; status: 'open' | 'resolved' | 'all' };
    open_count: number;
    retention_days: number;
    generated_at: string;
};

const ALL = 'all';

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

    if (!team) {
        return (
            <>
                <Head title={t('Logs')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-xl font-semibold">{t('Create a team first')}</h1>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const filter = (next: { server?: string; level?: string; status?: string }) => {
        const server = next.server ?? String(filters.server ?? ALL);
        const level = next.level ?? (filters.level ?? ALL);
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
        router.post(LogController.resolve.url(log.id), {}, { preserveScroll: true });

    const reopen = (log: LogEntry) =>
        router.delete(LogController.reopen.url(log.id), { preserveScroll: true });

    const resolveAll = () =>
        router.post(
            LogController.resolveAll.url(),
            {
                ...(filters.server && { server: filters.server }),
                ...(filters.level && { level: filters.level }),
            },
            { preserveScroll: true },
        );

    return (
        <>
            <Head title={t('Logs')} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Logs')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Only what is wrong: critical and error entries from the servers with the agent. Kept for :days days.', {
                                days: retention_days,
                            })}
                        </p>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                        <Select value={filters.status} onValueChange={(status) => filter({ status })}>
                            <SelectTrigger className="w-full sm:w-36" aria-label={t('Status')}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="open">{t('Open')}</SelectItem>
                                <SelectItem value="resolved">{t('Resolved')}</SelectItem>
                                <SelectItem value="all">{t('All entries')}</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select
                            value={String(filters.server ?? ALL)}
                            onValueChange={(server) => filter({ server })}
                        >
                            <SelectTrigger className="w-full sm:w-44" aria-label={t('Server')}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>{t('All servers')}</SelectItem>
                                {servers.map((server) => (
                                    <SelectItem key={server.id} value={String(server.id)}>
                                        {server.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Select
                            value={filters.level ?? ALL}
                            onValueChange={(level) => filter({ level })}
                        >
                            <SelectTrigger className="w-full sm:w-36" aria-label={t('Level')}>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL}>{t('All levels')}</SelectItem>
                                <SelectItem value="critical">{t('Critical')}</SelectItem>
                                <SelectItem value="error">{t('Error')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {open_count > 0 && filters.status !== 'resolved' && (
                    <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border bg-muted/40 px-4 py-2.5">
                        <p className="text-sm text-muted-foreground">
                            {t(':count open entries', { count: open_count })}
                        </p>
                        <Button size="sm" variant="outline" onClick={resolveAll}>
                            <CheckCheck className="size-4" />
                            {t('Mark all as resolved')}
                        </Button>
                    </div>
                )}

                {logs.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <ScrollText className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {filters.status === 'resolved' ? t('No resolved entries yet') : t('No problems in the logs')}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t('When a server with the agent logs an error, it shows up here.')}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                        {logs.data.map((log) => (
                            <li
                                key={log.id}
                                className={cn('space-y-1 px-4 py-3', log.resolved_at && 'bg-muted/30 opacity-70')}
                            >
                                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
                                    <span className="font-medium">{log.server_name}</span>
                                    <span
                                        className={cn(
                                            'rounded-md px-1.5 py-0.5 text-[11px] tracking-wide uppercase',
                                            levelStyle[log.level],
                                        )}
                                    >
                                        {t(log.level === 'critical' ? 'Critical' : 'Error')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                        {log.source}
                                    </span>
                                    {log.count > 1 && (
                                        <span className="text-xs text-muted-foreground">
                                            ×{log.count}
                                        </span>
                                    )}
                                    <span
                                        className="ml-auto text-xs text-muted-foreground/70"
                                        title={new Date(log.occurred_at).toLocaleString(locale)}
                                    >
                                        {timeAgo(log.occurred_at, generated_at, locale)}
                                    </span>
                                </div>
                                <p className="font-mono text-xs break-words whitespace-pre-wrap text-muted-foreground">
                                    {log.message}
                                </p>
                                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                                    {log.resolved_at ? (
                                        <p className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400">
                                            <Check className="size-3.5" />
                                            {log.resolved_by
                                                ? t('Resolved by :name', { name: log.resolved_by })
                                                : t('Resolved automatically')}
                                            <span className="text-muted-foreground">
                                                {timeAgo(log.resolved_at, generated_at, locale)}
                                            </span>
                                        </p>
                                    ) : (
                                        <span />
                                    )}
                                    {log.resolved_at ? (
                                        <Button variant="ghost" size="sm" onClick={() => reopen(log)}>
                                            <RotateCcw className="size-3.5" />
                                            {t('Reopen')}
                                        </Button>
                                    ) : (
                                        <Button variant="outline" size="sm" onClick={() => resolve(log)}>
                                            <Check className="size-3.5" />
                                            {t('Mark as resolved')}
                                        </Button>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                )}

                {(logs.prev_page_url || logs.next_page_url) && (
                    <div className="flex justify-between">
                        <Button variant="outline" disabled={!logs.prev_page_url} asChild={!!logs.prev_page_url}>
                            {logs.prev_page_url ? (
                                <Link href={logs.prev_page_url}>{t('Newer')}</Link>
                            ) : (
                                <span>{t('Newer')}</span>
                            )}
                        </Button>
                        <Button variant="outline" disabled={!logs.next_page_url} asChild={!!logs.next_page_url}>
                            {logs.next_page_url ? (
                                <Link href={logs.next_page_url}>{t('Older')}</Link>
                            ) : (
                                <span>{t('Older')}</span>
                            )}
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
}

Logs.layout = {
    breadcrumbs: [{ title: 'Logs', href: index() }],
};
