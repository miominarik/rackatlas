import { Link } from '@inertiajs/react';
import StatusDot from '@/components/storage/status-dot';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, timeAgo } from '@/lib/dashboard';
import { index, show } from '@/routes/storage';
import type { StorageMonitor } from '@/types/storage';

export default function StorageList({
    monitors,
    generatedAt,
}: {
    monitors: StorageMonitor[];
    generatedAt: string;
}) {
    const { t, locale } = useTranslation();

    return (
        <section aria-label={t('Storage')} className="space-y-2">
            <h2 className="text-sm font-medium">
                <Link href={index()} className="hover:underline">
                    {t('Storage')}
                </Link>
            </h2>
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {monitors.map((monitor) => {
                    const approx = monitor.is_partial ? '≥ ' : '';

                    return (
                        <li key={monitor.id}>
                            <Link
                                href={show(monitor.id)}
                                className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5 text-sm hover:bg-accent/40"
                            >
                                <StatusDot status={monitor.status} />
                                <span className="font-medium">
                                    {monitor.name}
                                </span>
                                {monitor.status === 'offline' ? (
                                    <span className="min-w-0 flex-1 truncate text-red-600 dark:text-red-400">
                                        {monitor.last_error
                                            ? t(monitor.last_error)
                                            : t('Not available')}
                                    </span>
                                ) : (
                                    <span className="min-w-0 flex-1 truncate text-muted-foreground">
                                        {monitor.total_bytes === null
                                            ? t('Not checked yet')
                                            : `${approx}${formatBytes(monitor.total_bytes)} · ${approx}${(monitor.blob_count ?? 0).toLocaleString(locale)} ${t('Blobs').toLowerCase()}`}
                                    </span>
                                )}
                                {monitor.last_checked_at && (
                                    <span className="text-xs text-muted-foreground/70">
                                        {timeAgo(
                                            monitor.last_checked_at,
                                            generatedAt,
                                            locale,
                                        )}
                                    </span>
                                )}
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </section>
    );
}
