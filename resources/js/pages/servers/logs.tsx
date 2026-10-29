import { Head, Link, router } from '@inertiajs/react';
import { ScrollText } from 'lucide-react';
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

type Props = {
    team: { id: number; name: string } | null;
    logs: {
        data: DashboardLog[];
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    servers: { id: number; name: string }[];
    filters: { server: number | null; level: string | null };
    retention_days: number;
    generated_at: string;
};

const ALL = 'all';

export default function Logs({
    team,
    logs,
    servers,
    filters,
    retention_days,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();

    if (!team) {
        return (
            <>
                <Head title={t('Logs')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-lg font-semibold">{t('Create a team first')}</h1>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const filter = (next: { server?: string; level?: string }) => {
        const server = next.server ?? String(filters.server ?? ALL);
        const level = next.level ?? (filters.level ?? ALL);

        router.get(
            index(),
            {
                ...(server !== ALL && { server }),
                ...(level !== ALL && { level }),
            },
            { preserveState: true, replace: true },
        );
    };

    return (
        <>
            <Head title={t('Logs')} />

            <div className="mx-auto w-full max-w-5xl space-y-6 p-4 md:py-8">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {t('Logs')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Only what is wrong: critical and error entries from the servers with the agent. Kept for :days days.', {
                                days: retention_days,
                            })}
                        </p>
                    </div>
                    <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
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

                {logs.data.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <ScrollText className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{t('No problems in the logs')}</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t('When a server with the agent logs an error, it shows up here.')}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                        {logs.data.map((log) => (
                            <li key={log.id} className="space-y-1 px-4 py-3">
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
