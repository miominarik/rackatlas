import { useTranslation } from '@/hooks/use-translation';
import { periodLabel, timeAgo } from '@/lib/dashboard';
import type { DashboardError } from '@/types';

export default function RecentErrors({
    errors,
    generatedAt,
    hours,
}: {
    errors: DashboardError[];
    generatedAt: string;
    hours: number;
}) {
    const { t, locale } = useTranslation();

    return (
        <section aria-label={t('Collection errors')} className="space-y-2">
            <h2 className="text-sm font-medium">
                {t('Collection errors')}{' '}
                <span className="text-xs font-normal text-muted-foreground">
                    {periodLabel(hours, t)}
                </span>
            </h2>
            {errors.length === 0 ? (
                <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    {t('No errors in this period.')}
                </p>
            ) : (
                <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                    {errors.map((error) => (
                        <li
                            key={error.id}
                            className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5 px-4 py-2.5 text-sm"
                        >
                            <span className="font-medium">
                                {error.server_name}
                            </span>
                            <span className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] tracking-wide text-muted-foreground uppercase">
                                {error.type}
                            </span>
                            <span className="min-w-0 flex-1 truncate text-muted-foreground">
                                {error.message}
                            </span>
                            <span className="text-xs text-muted-foreground/70">
                                {timeAgo(
                                    error.occurred_at,
                                    generatedAt,
                                    locale,
                                )}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
