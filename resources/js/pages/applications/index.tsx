import { Head, router } from '@inertiajs/react';
import {
    ChevronDown,
    Download,
    FileText,
    Layers,
    RefreshCw,
    Search,
    X,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ApplicationController from '@/actions/App/Http/Controllers/ApplicationController';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import { timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { index } from '@/routes/applications';

type ServiceStatus = 'failed' | 'running' | 'stopped' | 'disabled';

type Service = {
    id: number;
    unit: string;
    description: string | null;
    status: ServiceStatus;
    active_state: string;
    sub_state: string | null;
    unit_file_state: string | null;
    journal_at: string | null;
    journal_pending: boolean;
};

type ServerServices = {
    id: number;
    name: string;
    last_seen_at: string | null;
    services: Service[];
};

type Props = {
    team: { id: number; name: string } | null;
    servers: ServerServices[];
    generated_at: string;
};

const STATUSES: ServiceStatus[] = ['failed', 'running', 'stopped', 'disabled'];

const DOT: Record<ServiceStatus, string> = {
    failed: 'bg-red-500',
    running: 'bg-emerald-500',
    stopped: 'bg-amber-500',
    disabled: 'bg-muted-foreground/40',
};

const ALL = 'all';

/** How many services of one server are shown before "Show all". */
const PAGE = 15;

const STORAGE_KEY = 'applications.hide-system';

/**
 * Units the admin set up (enabled, disabled, masked) are applications. The rest (static, generated,
 * indirect, template instances without a unit file) belongs to the system itself and is mostly noise.
 */
function isSystemUnit(service: Service): boolean {
    return (
        service.status !== 'failed' &&
        !['enabled', 'disabled', 'masked'].includes(
            service.unit_file_state ?? '',
        )
    );
}

function readHideSystem(): boolean {
    try {
        return localStorage.getItem(STORAGE_KEY) !== '0';
    } catch {
        return true;
    }
}

function emptyCounts(): Record<ServiceStatus, number> {
    return { failed: 0, running: 0, stopped: 0, disabled: 0 };
}

export default function Applications({ team, servers, generated_at }: Props) {
    const { t, locale } = useTranslation();
    const [status, setStatus] = useState<ServiceStatus | typeof ALL>(ALL);
    const [server, setServer] = useState<string>(ALL);
    const [search, setSearch] = useState('');
    const [hideSystem, setHideSystem] = useState(readHideSystem);
    const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const waiting = servers.some((s) =>
        s.services.some((service) => service.journal_pending),
    );

    // The agent answers with its next report, so look again until every request is fulfilled.
    useEffect(() => {
        if (!waiting) {
            return;
        }

        const timer = setInterval(
            () => router.reload({ only: ['servers', 'generated_at'] }),
            5000,
        );

        return () => clearInterval(timer);
    }, [waiting]);

    const requestJournal = (id: number) =>
        router.post(
            ApplicationController.requestJournal.url(id),
            {},
            { preserveScroll: true, only: ['servers', 'generated_at'] },
        );

    const toggleHideSystem = (value: boolean) => {
        setHideSystem(value);

        try {
            localStorage.setItem(STORAGE_KEY, value ? '1' : '0');
        } catch {
            // The choice then only lasts until the page is closed.
        }
    };

    const toggle = (
        set: Set<number>,
        id: number,
        update: (next: Set<number>) => void,
    ) => {
        const next = new Set(set);

        if (!next.delete(id)) {
            next.add(id);
        }

        update(next);
    };

    const labels: Record<ServiceStatus, string> = {
        failed: t('Crashed'),
        running: t('Running'),
        stopped: t('Stopped'),
        disabled: t('Disabled'),
    };

    const query = search.trim().toLowerCase();
    const filtering = status !== ALL || query !== '';
    const dirty = filtering || server !== ALL;

    // Everything except the status chip, so the chips show what each one would give.
    const candidates = useMemo(
        () =>
            servers
                .filter((s) => server === ALL || String(s.id) === server)
                .map((s) => ({
                    ...s,
                    services: s.services.filter(
                        (service) =>
                            (!hideSystem || !isSystemUnit(service)) &&
                            (query === '' ||
                                service.unit.toLowerCase().includes(query) ||
                                (service.description ?? '')
                                    .toLowerCase()
                                    .includes(query)),
                    ),
                })),
        [servers, server, hideSystem, query],
    );

    const counts = useMemo(() => {
        const result = emptyCounts();

        candidates.forEach((s) =>
            s.services.forEach((service) => (result[service.status] += 1)),
        );

        return result;
    }, [candidates]);

    const hiddenSystem = useMemo(
        () =>
            servers
                .filter((s) => server === ALL || String(s.id) === server)
                .reduce(
                    (sum, s) => sum + s.services.filter(isSystemUnit).length,
                    0,
                ),
        [servers, server],
    );

    const visible = candidates
        .map((s) => ({
            ...s,
            summary: s.services.reduce((result, service) => {
                result[service.status] += 1;

                return result;
            }, emptyCounts()),
            services: s.services.filter(
                (service) => status === ALL || service.status === status,
            ),
        }))
        .filter((s) => s.services.length > 0);

    const total = visible.reduce((sum, s) => sum + s.services.length, 0);

    const clearFilters = () => {
        setStatus(ALL);
        setServer(ALL);
        setSearch('');
    };

    return (
        <>
            <Head title={t('Applications')} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-5 p-4 md:p-6">
                <div className="space-y-1">
                    <h1 className="text-2xl font-semibold">
                        {t('Applications')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'The systemd services of the servers with the agent: what runs, what is stopped, switched off or crashed. Press Journal and the agent sends its journal within a minute.',
                        )}
                    </p>
                </div>

                {team === null || servers.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed p-12 text-center">
                        <Layers className="size-8 text-muted-foreground" />
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'No services yet. They appear once a server with the agent (version 1.6 or newer) sends its first report.',
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
                                        placeholder={t('Search services')}
                                        aria-label={t('Search services')}
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

                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <div
                                    role="tablist"
                                    className="flex flex-wrap gap-1.5"
                                >
                                    {[ALL as typeof ALL, ...STATUSES].map(
                                        (value) => {
                                            const count =
                                                value === ALL
                                                    ? STATUSES.reduce(
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
                                                    aria-selected={
                                                        status === value
                                                    }
                                                    onClick={() =>
                                                        setStatus(value)
                                                    }
                                                    className={cn(
                                                        'flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
                                                        status === value
                                                            ? 'border-foreground/20 bg-muted font-medium'
                                                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                                                        value === 'failed' &&
                                                            count > 0 &&
                                                            'border-red-500/40',
                                                    )}
                                                >
                                                    {value !== ALL && (
                                                        <span
                                                            className={cn(
                                                                'size-2 rounded-full',
                                                                DOT[value],
                                                            )}
                                                            aria-hidden
                                                        />
                                                    )}
                                                    {value === ALL
                                                        ? t('All')
                                                        : labels[value]}
                                                    <span
                                                        className={cn(
                                                            'text-xs tabular-nums',
                                                            value ===
                                                                'failed' &&
                                                                count > 0
                                                                ? 'font-semibold text-red-600 dark:text-red-400'
                                                                : 'text-muted-foreground',
                                                        )}
                                                    >
                                                        {count}
                                                    </span>
                                                </button>
                                            );
                                        },
                                    )}
                                </div>

                                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground select-none">
                                    <Checkbox
                                        checked={hideSystem}
                                        onCheckedChange={(value) =>
                                            toggleHideSystem(value === true)
                                        }
                                    />
                                    {t('Hide system units')}
                                    {hideSystem && hiddenSystem > 0 && (
                                        <span className="text-xs tabular-nums">
                                            ({hiddenSystem})
                                        </span>
                                    )}
                                </label>
                            </div>
                        </div>

                        {visible.length === 0 ? (
                            <div className="flex flex-col items-center gap-3 py-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {t('No service matches the filter.')}
                                </p>
                                {dirty && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={clearFilters}
                                    >
                                        {t('Clear filters')}
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {t(
                                            ':count services on :servers servers',
                                            {
                                                count: String(total),
                                                servers: String(visible.length),
                                            },
                                        )}
                                    </span>
                                    {visible.length > 1 && (
                                        <button
                                            type="button"
                                            className="hover:text-foreground hover:underline"
                                            onClick={() =>
                                                setCollapsed(
                                                    collapsed.size === 0
                                                        ? new Set(
                                                              visible.map(
                                                                  (s) => s.id,
                                                              ),
                                                          )
                                                        : new Set(),
                                                )
                                            }
                                        >
                                            {collapsed.size === 0
                                                ? t('Collapse all')
                                                : t('Expand all')}
                                        </button>
                                    )}
                                </div>

                                {visible.map((s) => {
                                    // A search or a status filter looks at everything, so it opens the lists.
                                    const open =
                                        filtering || !collapsed.has(s.id);
                                    const all =
                                        filtering ||
                                        expanded.has(s.id) ||
                                        s.services.length <= PAGE;
                                    const shown = all
                                        ? s.services
                                        : s.services.slice(0, PAGE);

                                    return (
                                        <section
                                            key={s.id}
                                            className="overflow-hidden rounded-xl border bg-card"
                                        >
                                            <button
                                                type="button"
                                                aria-expanded={open}
                                                onClick={() =>
                                                    toggle(
                                                        collapsed,
                                                        s.id,
                                                        setCollapsed,
                                                    )
                                                }
                                                className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-4 py-3 text-left hover:bg-muted/40"
                                            >
                                                <ChevronDown
                                                    className={cn(
                                                        'size-4 shrink-0 text-muted-foreground transition-transform',
                                                        !open && '-rotate-90',
                                                    )}
                                                />
                                                <h2 className="font-semibold">
                                                    {s.name}
                                                </h2>
                                                <span className="flex items-center gap-2.5 text-xs text-muted-foreground">
                                                    {STATUSES.filter(
                                                        (key) =>
                                                            s.summary[key] > 0,
                                                    ).map((key) => (
                                                        <span
                                                            key={key}
                                                            className={cn(
                                                                'flex items-center gap-1',
                                                                key ===
                                                                    'failed' &&
                                                                    'font-medium text-red-600 dark:text-red-400',
                                                            )}
                                                            title={labels[key]}
                                                        >
                                                            <span
                                                                className={cn(
                                                                    'size-2 rounded-full',
                                                                    DOT[key],
                                                                )}
                                                                aria-hidden
                                                            />
                                                            <span className="tabular-nums">
                                                                {s.summary[key]}
                                                            </span>
                                                        </span>
                                                    ))}
                                                </span>
                                                {s.last_seen_at && (
                                                    <span className="ml-auto text-xs text-muted-foreground">
                                                        {t('Reported :time', {
                                                            time: timeAgo(
                                                                s.last_seen_at,
                                                                generated_at,
                                                                locale,
                                                            ),
                                                        })}
                                                    </span>
                                                )}
                                            </button>

                                            {open && (
                                                <>
                                                    <ul className="divide-y border-t">
                                                        {shown.map(
                                                            (service) => (
                                                                <ServiceRow
                                                                    key={
                                                                        service.id
                                                                    }
                                                                    service={
                                                                        service
                                                                    }
                                                                    label={
                                                                        labels[
                                                                            service
                                                                                .status
                                                                        ]
                                                                    }
                                                                    generatedAt={
                                                                        generated_at
                                                                    }
                                                                    onRequest={
                                                                        requestJournal
                                                                    }
                                                                />
                                                            ),
                                                        )}
                                                    </ul>
                                                    {!all && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                toggle(
                                                                    expanded,
                                                                    s.id,
                                                                    setExpanded,
                                                                )
                                                            }
                                                            className="w-full border-t px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                                        >
                                                            {t(
                                                                'Show all :count',
                                                                {
                                                                    count: String(
                                                                        s
                                                                            .services
                                                                            .length,
                                                                    ),
                                                                },
                                                            )}
                                                        </button>
                                                    )}
                                                    {all &&
                                                        !filtering &&
                                                        s.services.length >
                                                            PAGE && (
                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    toggle(
                                                                        expanded,
                                                                        s.id,
                                                                        setExpanded,
                                                                    )
                                                                }
                                                                className="w-full border-t px-4 py-2 text-sm text-muted-foreground hover:bg-muted/40 hover:text-foreground"
                                                            >
                                                                {t('Show less')}
                                                            </button>
                                                        )}
                                                </>
                                            )}
                                        </section>
                                    );
                                })}
                            </>
                        )}
                    </>
                )}
            </div>
        </>
    );
}

function ServiceRow({
    service,
    label,
    generatedAt,
    onRequest,
}: {
    service: Service;
    label: string;
    generatedAt: string;
    onRequest: (id: number) => void;
}) {
    const { t, locale } = useTranslation();
    const detail = [service.sub_state, service.unit_file_state]
        .filter(Boolean)
        .join(' · ');

    return (
        <li className="flex items-center gap-3 px-4 py-2 hover:bg-muted/30">
            <span
                className={cn(
                    'size-2.5 shrink-0 rounded-full',
                    DOT[service.status],
                )}
                title={label}
                aria-hidden
            />
            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                    {service.unit.replace(/\.service$/, '')}
                </p>
                {service.description && (
                    <p className="truncate text-xs text-muted-foreground">
                        {service.description}
                    </p>
                )}
            </div>
            <div className="hidden w-36 shrink-0 text-right text-xs text-muted-foreground sm:block">
                <p
                    className={cn(
                        service.status === 'failed' &&
                            'font-medium text-red-600 dark:text-red-400',
                    )}
                >
                    {label}
                </p>
                {detail && <p className="truncate">{detail}</p>}
            </div>
            <div className="flex w-28 shrink-0 items-center justify-end gap-1 md:w-40">
                {service.journal_pending ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Spinner className="size-3.5" />
                        <span className="hidden md:inline">
                            {t('Waiting for the agent')}
                        </span>
                    </span>
                ) : (
                    <>
                        {service.journal_at && (
                            <Button variant="outline" size="sm" asChild>
                                <a
                                    href={ApplicationController.journal.url(
                                        service.id,
                                    )}
                                    download
                                    title={t('Journal from :time', {
                                        time: timeAgo(
                                            service.journal_at,
                                            generatedAt,
                                            locale,
                                        ),
                                    })}
                                    aria-label={t(
                                        'Download the journal of :name',
                                        { name: service.unit },
                                    )}
                                >
                                    <Download className="size-3.5" />
                                    <span className="hidden md:inline">
                                        {t('Download')}
                                    </span>
                                </a>
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRequest(service.id)}
                            title={
                                service.journal_at
                                    ? t('Request again')
                                    : t('Journal')
                            }
                            aria-label={t('Request the journal of :name', {
                                name: service.unit,
                            })}
                        >
                            {service.journal_at ? (
                                <RefreshCw className="size-3.5" />
                            ) : (
                                <FileText className="size-3.5" />
                            )}
                            {!service.journal_at && (
                                <span className="hidden md:inline">
                                    {t('Journal')}
                                </span>
                            )}
                        </Button>
                    </>
                )}
            </div>
        </li>
    );
}

Applications.layout = {
    breadcrumbs: [{ title: 'Applications', href: index() }],
};
