import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    LayoutDashboard,
    Plus,
    RefreshCw,
    SlidersHorizontal,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import CustomizeSheet from '@/components/dashboard/customize-sheet';
import BackupsOverview from '@/components/dashboard/backups-overview';
import ProblemsList from '@/components/dashboard/problems-list';
import RecentErrors from '@/components/dashboard/recent-errors';
import ServerOverview from '@/components/dashboard/server-overview';
import SummaryTiles from '@/components/dashboard/summary-tiles';
import TopLists from '@/components/dashboard/top-lists';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { evaluateServer } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as createServer } from '@/routes/servers';
import { index as teamsIndex } from '@/routes/teams';
import type {
    DashboardError,
    DashboardHistory,
    DashboardBackup,
    DashboardServer,
    DashboardSettings,
} from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    device: { id: number; label: string } | null;
    other_devices: { id: number; label: string }[];
    settings: DashboardSettings;
    generated_at: string;
    servers: DashboardServer[];
    history: DashboardHistory;
    errors: DashboardError[];
    backups: DashboardBackup[];
};

const POLLED = [
    'servers',
    'history',
    'errors',
    'backups',
    'backupsGlance',
    'generated_at',
];

/** The other sections are short lists that sit two side by side on a wide screen. */
const FULL_WIDTH = ['summary', 'servers'];

function Poller({ seconds }: { seconds: number }) {
    usePoll(
        Math.max(seconds, 1) * 1000,
        { only: POLLED },
        { autoStart: seconds > 0 },
    );

    return null;
}

function DashboardContent({
    team,
    device,
    other_devices,
    settings,
    generated_at,
    servers,
    history,
    errors,
    backups,
}: Props & { team: NonNullable<Props['team']> }) {
    const { t, locale } = useTranslation();
    const [customizing, setCustomizing] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const refresh = () =>
        router.reload({
            only: POLLED,
            onStart: () => setRefreshing(true),
            onFinish: () => setRefreshing(false),
        });

    const items = useMemo(
        () =>
            servers.map((server) =>
                evaluateServer(server, settings.thresholds, generated_at, t),
            ),
        // t is recreated on each render but only changes with the locale.
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [servers, settings.thresholds, generated_at, locale],
    );

    const problems = items.flatMap((item) => item.problems);

    const widgets: Record<string, React.ReactNode> = {
        summary: <SummaryTiles items={items} backups={backups} />,
        problems: <ProblemsList problems={problems} />,
        servers: (
            <ServerOverview
                items={items}
                settings={settings}
                history={history}
                generatedAt={generated_at}
            />
        ),
        top: <TopLists items={items} thresholds={settings.thresholds} />,
        backups: (
            <BackupsOverview backups={backups} generatedAt={generated_at} />
        ),
        errors: (
            <RecentErrors
                errors={errors}
                generatedAt={generated_at}
                hours={settings.errors.hours}
            />
        ),
    };

    return (
        <>
            <Head title={t('Dashboard')} />
            <Poller
                key={settings.refresh_seconds}
                seconds={settings.refresh_seconds}
            />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Dashboard')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Overview of the team :team', {
                                team: team.name,
                            })}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={refresh}
                            disabled={refreshing}
                            aria-label={t('Refresh data')}
                            title={t('Refresh data')}
                            data-test="refresh-dashboard-button"
                        >
                            <RefreshCw
                                className={cn(
                                    'size-4',
                                    refreshing && 'animate-spin',
                                )}
                            />
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setCustomizing(true)}
                            data-test="customize-dashboard-button"
                        >
                            <SlidersHorizontal className="size-4" />
                            {t('Customize')}
                        </Button>
                    </div>
                </div>

                {servers.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <LayoutDashboard className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {t('No servers to show yet')}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                'Add a server and its metrics appear here within a minute.',
                            )}
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={createServer()}>
                                <Plus className="size-4" />
                                {t('Add server')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid gap-6 xl:grid-cols-2">
                        {settings.widgets
                            .filter((widget) => widget.visible)
                            .map((widget) => (
                                <div
                                    key={widget.id}
                                    className={cn(
                                        'min-w-0',
                                        FULL_WIDTH.includes(widget.id) &&
                                            'xl:col-span-2',
                                    )}
                                >
                                    {widgets[widget.id]}
                                </div>
                            ))}
                    </div>
                )}

                {settings.widgets.every((widget) => !widget.visible) && (
                    <p className="rounded-xl border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                        {t(
                            'All sections are hidden. Use Customize to show them again.',
                        )}
                    </p>
                )}
            </div>

            <CustomizeSheet
                open={customizing}
                onOpenChange={setCustomizing}
                settings={settings}
                device={device}
                otherDevices={other_devices}
            />
        </>
    );
}

export default function Dashboard(props: Props) {
    const { t } = useTranslation();

    if (!props.team) {
        return (
            <>
                <Head title={t('Dashboard')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
                        <LayoutDashboard className="size-7 text-muted-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold">
                        {t('Create a team first')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'Servers belong to a team, so you need one before you can add servers.',
                        )}
                    </p>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    return <DashboardContent {...props} team={props.team} />;
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
