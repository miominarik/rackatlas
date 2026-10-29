import { Head, Link, usePoll } from '@inertiajs/react';
import { LayoutDashboard, Plus, SlidersHorizontal } from 'lucide-react';
import { useMemo, useState } from 'react';
import CustomizeSheet from '@/components/dashboard/customize-sheet';
import ProblemsList from '@/components/dashboard/problems-list';
import RecentErrors from '@/components/dashboard/recent-errors';
import RecentLogs from '@/components/dashboard/recent-logs';
import ServerCard from '@/components/dashboard/server-card';
import SummaryTiles from '@/components/dashboard/summary-tiles';
import TopLists from '@/components/dashboard/top-lists';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { evaluateServer, levelRank } from '@/lib/dashboard';
import type { Evaluated } from '@/lib/dashboard';
import { dotClass } from '@/lib/server-colors';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { create as createServer } from '@/routes/servers';
import { index as teamsIndex } from '@/routes/teams';
import type {
    DashboardError,
    DashboardHistory,
    DashboardLog,
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
    logs: DashboardLog[];
};

const POLLED = ['servers', 'history', 'errors', 'logs', 'generated_at'];

function Poller({ seconds }: { seconds: number }) {
    usePoll(Math.max(seconds, 1) * 1000, { only: POLLED }, { autoStart: seconds > 0 });

    return null;
}

function sortItems(items: Evaluated[], sort: DashboardSettings['servers']['sort']) {
    const by = {
        name: (a: Evaluated, b: Evaluated) =>
            a.server.name.localeCompare(b.server.name),
        status: (a: Evaluated, b: Evaluated) =>
            levelRank[b.level] - levelRank[a.level] ||
            a.server.name.localeCompare(b.server.name),
        cpu: (a: Evaluated, b: Evaluated) => (b.cpu ?? -1) - (a.cpu ?? -1),
        ram: (a: Evaluated, b: Evaluated) => (b.ram ?? -1) - (a.ram ?? -1),
        disk: (a: Evaluated, b: Evaluated) => (b.disk ?? -1) - (a.disk ?? -1),
    }[sort];

    return [...items].sort(by);
}

function ServerGrid({
    items,
    settings,
    history,
    generatedAt,
}: {
    items: Evaluated[];
    settings: DashboardSettings;
    history: DashboardHistory;
    generatedAt: string;
}) {
    const { t } = useTranslation();
    const compact = settings.servers.density === 'compact';

    const sorted = sortItems(items, settings.servers.sort);

    type Group = {
        key: string;
        category: DashboardServer['category'];
        items: Evaluated[];
    };

    const groups: Group[] = settings.servers.group_by_category
        ? [
              ...new Map(
                  sorted
                      .filter((item) => item.server.category)
                      .map((item) => [
                          item.server.category!.id,
                          item.server.category!,
                      ]),
              ).values(),
          ]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((category) => ({
                  key: String(category.id),
                  category,
                  items: sorted.filter((item) => item.server.category?.id === category.id),
              }))
        : [];

    if (settings.servers.group_by_category) {
        const rest = sorted.filter((item) => !item.server.category);

        if (rest.length > 0) {
            groups.push({ key: 'none', category: null, items: rest });
        }
    }

    const grid = cn(
        'grid gap-4',
        compact
            ? 'grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3'
            : 'grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]',
    );

    const cards = (list: Evaluated[]) => (
        <div className={grid}>
            {list.map((evaluated) => (
                <ServerCard
                    key={evaluated.server.id}
                    evaluated={evaluated}
                    settings={settings}
                    history={history[evaluated.server.id] ?? []}
                    generatedAt={generatedAt}
                />
            ))}
        </div>
    );

    return (
        <section aria-label={t('Server cards')} className="space-y-3">
            <h2 className="text-sm font-medium">
                {t('Servers')}{' '}
                <span className="text-muted-foreground">{items.length}</span>
            </h2>
            {settings.servers.group_by_category ? (
                <div className="space-y-6">
                    {groups.map((group) => (
                        <div key={group.key} className="space-y-3">
                            <h3 className="flex items-center gap-2 text-sm text-muted-foreground">
                                {group.category && (
                                    <span
                                        className={cn(
                                            'size-2 rounded-full',
                                            dotClass(group.category.color),
                                        )}
                                    />
                                )}
                                {group.category?.name ?? t('No category')}
                                <span className="text-xs">{group.items.length}</span>
                            </h3>
                            {cards(group.items)}
                        </div>
                    ))}
                </div>
            ) : (
                cards(sorted)
            )}
        </section>
    );
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
    logs,
}: Props & { team: NonNullable<Props['team']> }) {
    const { t, locale } = useTranslation();
    const [customizing, setCustomizing] = useState(false);

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
        summary: <SummaryTiles items={items} />,
        problems: <ProblemsList problems={problems} />,
        servers: (
            <ServerGrid
                items={items}
                settings={settings}
                history={history}
                generatedAt={generated_at}
            />
        ),
        top: <TopLists items={items} thresholds={settings.thresholds} />,
        logs: <RecentLogs logs={logs} generatedAt={generated_at} />,
        errors: <RecentErrors errors={errors} generatedAt={generated_at} />,
    };

    return (
        <>
            <Head title={t('Dashboard')} />
            <Poller key={settings.refresh_seconds} seconds={settings.refresh_seconds} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {t('Dashboard')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Overview of the team :team', { team: team.name })}
                        </p>
                    </div>
                    <Button
                        variant="outline"
                        onClick={() => setCustomizing(true)}
                        data-test="customize-dashboard-button"
                    >
                        <SlidersHorizontal className="size-4" />
                        {t('Customize')}
                    </Button>
                </div>

                {servers.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <LayoutDashboard className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{t('No servers to show yet')}</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t('Add a server and its metrics appear here within a minute.')}
                        </p>
                        <Button asChild className="mt-4">
                            <Link href={createServer()}>
                                <Plus className="size-4" />
                                {t('Add server')}
                            </Link>
                        </Button>
                    </div>
                ) : (
                    settings.widgets
                        .filter((widget) => widget.visible)
                        .map((widget) => (
                            <div key={widget.id}>{widgets[widget.id]}</div>
                        ))
                )}

                {settings.widgets.every((widget) => !widget.visible) && (
                    <p className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">
                        {t('All sections are hidden. Use Customize to show them again.')}
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
                    <h1 className="text-lg font-semibold">{t('Create a team first')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('Servers belong to a team, so you need one before you can add servers.')}
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
