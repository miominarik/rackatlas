import { Head, Link } from '@inertiajs/react';
import { Cloud, Plus } from 'lucide-react';
import StatusDot from '@/components/storage/status-dot';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, timeAgo } from '@/lib/dashboard';
import { dashboard } from '@/routes';
import { create, index, show } from '@/routes/storage';
import { index as teamsIndex } from '@/routes/teams';
import type { StorageMonitor } from '@/types/storage';

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    monitors: StorageMonitor[];
    generated_at: string;
};

export default function StorageIndex({
    team,
    canManage,
    monitors,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();

    if (!team) {
        return (
            <>
                <Head title={t('Storage')} />
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

    const statusText = {
        online: t('Available'),
        offline: t('Not available'),
        unknown: t('Not checked yet'),
    };

    return (
        <>
            <Head title={t('Storage')} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Storage')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Azure Blob Storage containers of the team :team',
                                { team: team.name },
                            )}
                        </p>
                    </div>
                    {canManage && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                {t('Add storage')}
                            </Link>
                        </Button>
                    )}
                </div>

                {monitors.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <Cloud className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{t('No storage yet')}</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                'Add a container of Azure Blob Storage and we will watch whether it answers and how much it holds.',
                            )}
                        </p>
                    </div>
                ) : (
                    <ul className="grid items-start gap-3 md:grid-cols-2 2xl:grid-cols-3">
                        {monitors.map((monitor) => (
                            <li key={monitor.id}>
                                <Link
                                    href={show(monitor.id)}
                                    className="block space-y-3 rounded-xl border bg-card p-4 transition-colors hover:bg-accent/40"
                                    data-test="storage-link"
                                >
                                    <div className="flex items-center gap-3">
                                        <StatusDot status={monitor.status} />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {monitor.name}
                                            </p>
                                            <p className="truncate font-mono text-xs text-muted-foreground">
                                                {monitor.account}/
                                                {monitor.container}
                                            </p>
                                        </div>
                                        <span className="text-xs text-muted-foreground">
                                            {statusText[monitor.status]}
                                        </span>
                                    </div>

                                    {monitor.status === 'offline' &&
                                        monitor.last_error && (
                                            <p className="text-sm text-red-600 dark:text-red-400">
                                                {t(monitor.last_error)}
                                            </p>
                                        )}

                                    <dl className="grid grid-cols-3 gap-2 text-sm">
                                        <div>
                                            <dt className="text-xs text-muted-foreground">
                                                {t('Size')}
                                            </dt>
                                            <dd className="font-medium">
                                                {monitor.total_bytes === null
                                                    ? '–'
                                                    : `${monitor.is_partial ? '≥ ' : ''}${formatBytes(monitor.total_bytes)}`}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-muted-foreground">
                                                {t('Blobs')}
                                            </dt>
                                            <dd className="font-medium">
                                                {monitor.blob_count === null
                                                    ? '–'
                                                    : `${monitor.is_partial ? '≥ ' : ''}${monitor.blob_count.toLocaleString(locale)}`}
                                            </dd>
                                        </div>
                                        <div>
                                            <dt className="text-xs text-muted-foreground">
                                                {t('Response')}
                                            </dt>
                                            <dd className="font-medium">
                                                {monitor.response_ms === null
                                                    ? '–'
                                                    : `${monitor.response_ms} ms`}
                                            </dd>
                                        </div>
                                    </dl>

                                    <p className="text-xs text-muted-foreground">
                                        {monitor.last_checked_at
                                            ? t('Checked :time', {
                                                  time: timeAgo(
                                                      monitor.last_checked_at,
                                                      generated_at,
                                                      locale,
                                                  ),
                                              })
                                            : t('Not checked yet')}
                                    </p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </>
    );
}

StorageIndex.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Storage', href: index() },
    ],
};
