import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import { timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index } from '@/routes/logs';
import type { DashboardLog } from '@/types';

export const levelStyle = {
    critical: 'bg-red-500/10 text-red-700 dark:text-red-300',
    error: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
} as const;

export default function RecentLogs({
    logs,
    generatedAt,
}: {
    logs: DashboardLog[];
    generatedAt: string;
}) {
    const { t, locale } = useTranslation();

    return (
        <section aria-label={t('Server logs')} className="space-y-2">
            <div className="flex items-center justify-between">
                <h2 className="text-sm font-medium">{t('Server logs')}</h2>
                <Link
                    href={index()}
                    className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                >
                    {t('Show all')}
                </Link>
            </div>
            {logs.length === 0 ? (
                <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    {t('No serious log entries in the last 24 hours.')}
                </p>
            ) : (
                <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                    {logs.map((log) => (
                        <li
                            key={log.id}
                            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-2.5 text-sm"
                        >
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
                            <span className="min-w-0 flex-1 truncate text-muted-foreground">
                                {log.message}
                            </span>
                            {log.count > 1 && (
                                <span className="text-xs text-muted-foreground">
                                    ×{log.count}
                                </span>
                            )}
                            <span className="text-xs text-muted-foreground/70">
                                {timeAgo(log.occurred_at, generatedAt, locale)}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
