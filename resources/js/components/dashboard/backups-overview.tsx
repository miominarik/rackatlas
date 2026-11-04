import { Link } from '@inertiajs/react';
import { CheckCircle2, Clock, Hourglass, XCircle } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index } from '@/routes/backups';
import type { DashboardBackup } from '@/types';

type State = 'failed' | 'overdue' | 'ok' | 'waiting';

const styles: Record<
    State,
    { icon: LucideIcon; accent: string; badge: string; circle: string }
> = {
    failed: {
        icon: XCircle,
        accent: 'border-l-red-500',
        badge: 'bg-red-500/10 text-red-700 dark:text-red-300',
        circle: 'bg-red-500/10 text-red-600 dark:text-red-400',
    },
    overdue: {
        icon: Clock,
        accent: 'border-l-amber-500',
        badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-300',
        circle: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    },
    ok: {
        icon: CheckCircle2,
        accent: 'border-l-emerald-500',
        badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
        circle: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    },
    waiting: {
        icon: Hourglass,
        accent: 'border-l-border',
        badge: 'bg-muted text-muted-foreground',
        circle: 'bg-muted text-muted-foreground',
    },
};

const stateOf = (backup: DashboardBackup): State => {
    if (backup.last_status === 'failed') {
        return 'failed';
    }

    if (backup.overdue) {
        return 'overdue';
    }

    return backup.last_run_at ? 'ok' : 'waiting';
};

export default function BackupsOverview({
    backups,
    generatedAt,
}: {
    backups: DashboardBackup[];
    generatedAt: string;
}) {
    const { t, locale } = useTranslation();

    const labels: Record<State, string> = {
        failed: t('Failed'),
        overdue: t('Overdue'),
        ok: t('OK'),
        waiting: t('Waiting for first run'),
    };

    const counts = backups.reduce(
        (sum, backup) => {
            sum[stateOf(backup)]++;

            return sum;
        },
        { failed: 0, overdue: 0, ok: 0, waiting: 0 } as Record<State, number>,
    );

    return (
        <section aria-label={t('Backups')} className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-sm font-medium">{t('Backups')}</h2>
                <div className="flex items-center gap-3">
                    {(['failed', 'overdue', 'ok'] as const).map(
                        (state) =>
                            counts[state] > 0 && (
                                <span
                                    key={state}
                                    className={cn(
                                        'rounded-full px-2 py-0.5 text-xs font-medium',
                                        styles[state].badge,
                                    )}
                                >
                                    {counts[state]} {labels[state]}
                                </span>
                            ),
                    )}
                    <Link
                        href={index()}
                        className="text-xs text-muted-foreground underline-offset-4 hover:underline"
                    >
                        {t('Show all')}
                    </Link>
                </div>
            </div>
            {backups.length === 0 ? (
                <p className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
                    {t('No backups yet')}
                </p>
            ) : (
                <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {backups.map((backup) => {
                        const state = stateOf(backup);
                        const style = styles[state];
                        const Icon = style.icon;

                        return (
                            <li
                                key={backup.id}
                                title={backup.last_message ?? undefined}
                                className={cn(
                                    'flex items-center gap-2.5 rounded-lg border border-l-4 bg-card px-3 py-2',
                                    style.accent,
                                )}
                            >
                                <span
                                    className={cn(
                                        'flex size-7 shrink-0 items-center justify-center rounded-full',
                                        style.circle,
                                    )}
                                >
                                    <Icon className="size-4" />
                                </span>
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-start justify-between gap-2">
                                        <p className="min-w-0 font-medium break-words">
                                            {backup.name}
                                        </p>
                                        <span
                                            className={cn(
                                                'shrink-0 rounded-md px-1.5 py-0.5 text-[11px] tracking-wide uppercase',
                                                style.badge,
                                            )}
                                        >
                                            {labels[state]}
                                        </span>
                                    </div>
                                    <p className="text-xs break-words text-muted-foreground">
                                        {[
                                            backup.server_name,
                                            backup.last_run_at
                                                ? timeAgo(
                                                      backup.last_run_at,
                                                      generatedAt,
                                                      locale,
                                                  )
                                                : null,
                                            backup.last_size_bytes !== null
                                                ? formatBytes(
                                                      backup.last_size_bytes,
                                                  )
                                                : null,
                                        ]
                                            .filter(Boolean)
                                            .join(' · ') || '—'}
                                    </p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </section>
    );
}
