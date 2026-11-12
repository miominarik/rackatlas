import { Head, router, useHttp } from '@inertiajs/react';
import {
    Container,
    FileText,
    Play,
    RefreshCw,
    RotateCw,
    Search,
    Square,
    TriangleAlert,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import DockerController from '@/actions/App/Http/Controllers/DockerController';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes, timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index } from '@/routes/docker';

type Group = 'running' | 'problem' | 'stopped';

type Container = {
    id: number;
    container_id: string;
    name: string;
    image: string;
    state: string;
    status: string | null;
    ports: string | null;
    cpu_percent: number | null;
    memory_bytes: number | null;
    memory_limit_bytes: number | null;
    pending_action: 'start' | 'stop' | 'restart' | null;
    action_result: string | null;
};

type DockerServer = {
    id: number;
    name: string;
    status: string;
    via_agent: boolean;
    error: string | null;
    checked_at: string | null;
    containers: Container[];
};

type Props = {
    team: { id: number; name: string } | null;
    canManage?: boolean;
    servers: DockerServer[];
    generated_at: string;
};

type LogState = {
    logs: string | null;
    updated_at: string | null;
    pending: boolean;
};

const GROUPS: Group[] = ['problem', 'running', 'stopped'];

const DOT: Record<Group, string> = {
    problem: 'bg-red-500',
    running: 'bg-emerald-500',
    stopped: 'bg-muted-foreground/40',
};

const ALL = 'all';

/** A container that restarts in a loop, is dead or reports itself unhealthy needs attention. */
function groupOf(container: Container): Group {
    if (
        ['restarting', 'dead'].includes(container.state) ||
        (container.status ?? '').includes('unhealthy')
    ) {
        return 'problem';
    }

    return container.state === 'running' || container.state === 'paused'
        ? 'running'
        : 'stopped';
}

function emptyCounts(): Record<Group, number> {
    return { problem: 0, running: 0, stopped: 0 };
}

export default function DockerPage({
    team,
    canManage = false,
    servers,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();
    const [group, setGroup] = useState<Group | typeof ALL>(ALL);
    const [server, setServer] = useState<string>(ALL);
    const [search, setSearch] = useState('');
    const [logsOf, setLogsOf] = useState<{
        container: Container;
        serverName: string;
    } | null>(null);

    const waiting = servers.some((s) =>
        s.containers.some((c) => c.pending_action !== null),
    );

    // Containers change by themselves, and an action through the agent is carried out within a minute or two.
    useEffect(() => {
        const timer = setInterval(
            () => router.reload({ only: ['servers', 'generated_at'] }),
            waiting ? 5000 : 15000,
        );

        return () => clearInterval(timer);
    }, [waiting]);

    const act = (container: Container, action: 'start' | 'stop' | 'restart') =>
        router.post(
            DockerController.act.url({ container: container.id, action }),
            {},
            { preserveScroll: true, only: ['servers', 'generated_at'] },
        );

    const labels: Record<Group, string> = {
        problem: t('Problem'),
        running: t('Running'),
        stopped: t('Stopped'),
    };

    const query = search.trim().toLowerCase();
    const dirty = group !== ALL || server !== ALL || query !== '';

    const candidates = useMemo(
        () =>
            servers
                .filter((s) => server === ALL || String(s.id) === server)
                .map((s) => ({
                    ...s,
                    containers: s.containers.filter(
                        (c) =>
                            query === '' ||
                            c.name.toLowerCase().includes(query) ||
                            c.image.toLowerCase().includes(query),
                    ),
                })),
        [servers, server, query],
    );

    const counts = useMemo(() => {
        const result = emptyCounts();

        candidates.forEach((s) =>
            s.containers.forEach((c) => (result[groupOf(c)] += 1)),
        );

        return result;
    }, [candidates]);

    const visible = candidates
        .map((s) => ({
            ...s,
            containers: s.containers
                .filter((c) => group === ALL || groupOf(c) === group)
                .sort(
                    (a, b) =>
                        GROUPS.indexOf(groupOf(a)) - GROUPS.indexOf(groupOf(b)),
                ),
        }))
        // A server with a problem is shown even when no container matches the filter.
        .filter((s) => s.containers.length > 0 || (s.error && !dirty));

    const clearFilters = () => {
        setGroup(ALL);
        setServer(ALL);
        setSearch('');
    };

    return (
        <>
            <Head title={t('Docker')} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">{t('Docker')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'The containers of all servers that have Docker switched on in their settings, with their state and use of CPU and memory.',
                        )}
                    </p>
                </div>

                {team === null || servers.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
                        <Container className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'No server has Docker yet. Switch Docker on in the settings of a server and its containers appear here within a few minutes.',
                            )}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="sticky top-0 z-10 -mx-4 space-y-3 border-b bg-background/95 px-4 py-3 backdrop-blur md:-mx-6 md:px-6">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative min-w-48 flex-1 sm:max-w-sm">
                                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder={t('Search containers')}
                                        aria-label={t('Search containers')}
                                        className="pl-8"
                                    />
                                </div>

                                <Select
                                    value={server}
                                    onValueChange={setServer}
                                >
                                    <SelectTrigger
                                        className="w-48"
                                        aria-label={t('Server')}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={ALL}>
                                            {t('All servers')}
                                        </SelectItem>
                                        {servers.map((s) => (
                                            <SelectItem
                                                key={s.id}
                                                value={String(s.id)}
                                            >
                                                {s.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                {dirty && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        <X className="size-3.5" />
                                        {t('Clear filters')}
                                    </Button>
                                )}
                            </div>

                            <div
                                role="tablist"
                                className="flex flex-wrap gap-1.5"
                            >
                                {[ALL as typeof ALL, ...GROUPS].map((value) => {
                                    const count =
                                        value === ALL
                                            ? GROUPS.reduce(
                                                  (sum, key) =>
                                                      sum + counts[key],
                                                  0,
                                              )
                                            : counts[value];

                                    return (
                                        <button
                                            key={value}
                                            type="button"
                                            role="tab"
                                            aria-selected={group === value}
                                            onClick={() => setGroup(value)}
                                            className={cn(
                                                'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
                                                group === value
                                                    ? 'border-primary bg-primary text-primary-foreground'
                                                    : 'hover:bg-muted',
                                            )}
                                        >
                                            {value !== ALL && (
                                                <span
                                                    className={cn(
                                                        'size-2 rounded-full',
                                                        DOT[value],
                                                    )}
                                                />
                                            )}
                                            {value === ALL
                                                ? t('All')
                                                : labels[value]}
                                            <span className="text-xs opacity-70">
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {visible.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('No container matches the filters.')}
                            </p>
                        ) : (
                            visible.map((s) => (
                                <section
                                    key={s.id}
                                    className="overflow-hidden rounded-xl border"
                                >
                                    <header className="flex flex-wrap items-center justify-between gap-2 border-b bg-muted/40 px-4 py-2.5">
                                        <h2 className="font-medium">
                                            {s.name}
                                        </h2>
                                        <span className="text-xs text-muted-foreground">
                                            {s.via_agent
                                                ? t('via the agent')
                                                : t('via SSH')}
                                            {s.checked_at &&
                                                ` · ${timeAgo(s.checked_at, generated_at, locale)}`}
                                        </span>
                                    </header>

                                    {s.error && (
                                        <div className="flex items-start gap-2 border-b bg-amber-500/10 px-4 py-3 text-sm">
                                            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                                            <div className="space-y-1">
                                                <p className="font-mono text-xs break-all">
                                                    {s.error}
                                                </p>
                                                {/permission denied/i.test(
                                                    s.error,
                                                ) && (
                                                    <p className="text-muted-foreground">
                                                        {s.via_agent
                                                            ? t(
                                                                  'Let the agent use Docker with: sudo usermod -aG docker rackatlas-agent. This gives it full control of Docker, so do it only where you want that.',
                                                              )
                                                            : t(
                                                                  'The SSH user is not allowed to use Docker. Add it to the docker group.',
                                                              )}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {s.containers.length === 0 ? (
                                        <p className="px-4 py-6 text-center text-sm text-muted-foreground">
                                            {s.checked_at === null
                                                ? t(
                                                      'Waiting for the first reading of the containers.',
                                                  )
                                                : t('No containers.')}
                                        </p>
                                    ) : (
                                        <ul className="divide-y">
                                            {s.containers.map((c) => (
                                                <ContainerRow
                                                    key={c.id}
                                                    container={c}
                                                    canManage={canManage}
                                                    onAct={act}
                                                    onLogs={() =>
                                                        setLogsOf({
                                                            container: c,
                                                            serverName: s.name,
                                                        })
                                                    }
                                                />
                                            ))}
                                        </ul>
                                    )}
                                </section>
                            ))
                        )}
                    </>
                )}
            </div>

            {logsOf && (
                <LogsDialog
                    container={logsOf.container}
                    serverName={logsOf.serverName}
                    generatedAt={generated_at}
                    onClose={() => setLogsOf(null)}
                />
            )}
        </>
    );
}

function ContainerRow({
    container,
    canManage,
    onAct,
    onLogs,
}: {
    container: Container;
    canManage: boolean;
    onAct: (container: Container, action: 'start' | 'stop' | 'restart') => void;
    onLogs: () => void;
}) {
    const { t } = useTranslation();
    const group = groupOf(container);
    const running = container.state === 'running';
    const busy = container.pending_action !== null;

    return (
        <li className="grid gap-2 px-4 py-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
            <div className="min-w-0 space-y-0.5">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            'size-2.5 shrink-0 rounded-full',
                            DOT[group],
                        )}
                    />
                    <span className="truncate font-medium">
                        {container.name}
                    </span>
                    <span className="truncate text-sm text-muted-foreground">
                        {container.image}
                    </span>
                </div>
                <p className="pl-[18px] text-xs text-muted-foreground">
                    {container.status ?? container.state}
                    {container.ports && ` · ${container.ports}`}
                </p>
                {container.action_result && (
                    <p className="pl-[18px] text-xs text-red-600">
                        {container.action_result}
                    </p>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-3 pl-[18px] md:pl-0">
                {running && container.cpu_percent !== null && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {t('CPU')} {container.cpu_percent.toFixed(1)} %
                    </span>
                )}
                {running && container.memory_bytes !== null && (
                    <span className="text-xs text-muted-foreground tabular-nums">
                        {t('RAM')} {formatBytes(container.memory_bytes)}
                        {container.memory_limit_bytes
                            ? ` / ${formatBytes(container.memory_limit_bytes)}`
                            : ''}
                    </span>
                )}

                {busy && (
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Spinner className="size-3.5" />
                        {t('Waiting for the agent…')}
                    </span>
                )}

                <div className="flex items-center gap-1">
                    {canManage && !running && (
                        <Button
                            variant="ghost"
                            size="sm"
                            disabled={busy}
                            onClick={() => onAct(container, 'start')}
                            aria-label={t('Start :name', {
                                name: container.name,
                            })}
                        >
                            <Play className="size-3.5" />
                            <span className="hidden md:inline">
                                {t('Start')}
                            </span>
                        </Button>
                    )}
                    {canManage && running && (
                        <>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={() => onAct(container, 'restart')}
                                aria-label={t('Restart :name', {
                                    name: container.name,
                                })}
                            >
                                <RotateCw className="size-3.5" />
                                <span className="hidden md:inline">
                                    {t('Restart')}
                                </span>
                            </Button>
                            <Button
                                variant="ghost"
                                size="sm"
                                disabled={busy}
                                onClick={() => onAct(container, 'stop')}
                                aria-label={t('Stop :name', {
                                    name: container.name,
                                })}
                            >
                                <Square className="size-3.5" />
                                <span className="hidden md:inline">
                                    {t('Stop')}
                                </span>
                            </Button>
                        </>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onLogs}
                        aria-label={t('Logs of :name', {
                            name: container.name,
                        })}
                    >
                        <FileText className="size-3.5" />
                        <span className="hidden md:inline">{t('Logs')}</span>
                    </Button>
                </div>
            </div>
        </li>
    );
}

function LogsDialog({
    container,
    serverName,
    generatedAt,
    onClose,
}: {
    container: Container;
    serverName: string;
    generatedAt: string;
    onClose: () => void;
}) {
    const { t, locale } = useTranslation();
    const http = useHttp<Record<string, never>, LogState>({});
    const [state, setState] = useState<LogState | null>(null);
    const [error, setError] = useState<string | null>(null);

    const request = () => {
        setError(null);

        void http
            .post(DockerController.requestLogs.url(container.id))
            .then(setState)
            .catch(() => setError(t('The logs could not be loaded.')));
    };

    // Shows what is stored, then asks for a fresh copy.
    useEffect(() => {
        void http
            .get(DockerController.logs.url(container.id))
            .then(setState)
            .catch(() => undefined);
        request();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [container.id]);

    // From the agent the log arrives with its next report.
    useEffect(() => {
        if (!state?.pending) {
            return;
        }

        const timer = setInterval(() => {
            void http
                .get(DockerController.logs.url(container.id))
                .then(setState)
                .catch(() => undefined);
        }, 4000);

        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state?.pending, container.id]);

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl">
                <DialogHeader>
                    <DialogTitle>
                        {container.name} · {serverName}
                    </DialogTitle>
                    <DialogDescription>
                        {t('The last 500 lines of the log.')}
                        {state?.updated_at &&
                            ` ${timeAgo(state.updated_at, generatedAt, locale)}`}
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <pre className="max-h-[60vh] overflow-auto rounded-md border bg-muted/40 p-3 font-mono text-xs break-all whitespace-pre-wrap">
                    {state?.logs
                        ? state.logs
                        : state?.pending || http.processing
                          ? t('Loading…')
                          : t('The log is empty.')}
                </pre>

                <div className="flex items-center justify-between gap-2">
                    {state?.pending || http.processing ? (
                        <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Spinner className="size-3.5" />
                            {t('Waiting for the agent…')}
                        </span>
                    ) : (
                        <span />
                    )}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={request}
                        disabled={state?.pending || http.processing}
                    >
                        <RefreshCw className="size-3.5" />
                        {t('Refresh')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

DockerPage.layout = {
    breadcrumbs: [{ title: 'Docker', href: index() }],
};
