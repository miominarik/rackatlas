import { Head, router } from '@inertiajs/react';
import { Download, FileText, Layers, RefreshCw, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ApplicationController from '@/actions/App/Http/Controllers/ApplicationController';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
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

export default function Applications({ team, servers, generated_at }: Props) {
    const { t, locale } = useTranslation();
    const [status, setStatus] = useState<ServiceStatus | typeof ALL>(ALL);
    const [server, setServer] = useState<string>(ALL);
    const [search, setSearch] = useState('');

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

    const labels: Record<ServiceStatus, string> = {
        failed: t('Crashed'),
        running: t('Running'),
        stopped: t('Stopped'),
        disabled: t('Disabled'),
    };

    const counts = useMemo(() => {
        const result: Record<ServiceStatus, number> = {
            failed: 0,
            running: 0,
            stopped: 0,
            disabled: 0,
        };

        servers
            .filter((s) => server === ALL || String(s.id) === server)
            .forEach((s) =>
                s.services.forEach((service) => (result[service.status] += 1)),
            );

        return result;
    }, [servers, server]);

    const query = search.trim().toLowerCase();
    const visible = servers
        .filter((s) => server === ALL || String(s.id) === server)
        .map((s) => ({
            ...s,
            services: s.services.filter(
                (service) =>
                    (status === ALL || service.status === status) &&
                    (query === '' ||
                        service.unit.toLowerCase().includes(query) ||
                        (service.description ?? '')
                            .toLowerCase()
                            .includes(query)),
            ),
        }))
        .filter((s) => s.services.length > 0);

    return (
        <>
            <Head title={t('Applications')} />

            <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
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
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div
                                role="tablist"
                                className="inline-flex flex-wrap rounded-lg bg-muted p-1"
                            >
                                {[ALL as typeof ALL, ...STATUSES].map(
                                    (value) => (
                                        <button
                                            key={value}
                                            type="button"
                                            role="tab"
                                            aria-selected={status === value}
                                            onClick={() => setStatus(value)}
                                            className={cn(
                                                'flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                                                status === value
                                                    ? 'bg-card font-medium shadow-xs'
                                                    : 'text-muted-foreground hover:text-foreground',
                                            )}
                                        >
                                            {value === ALL
                                                ? t('All')
                                                : labels[value]}
                                            {value !== ALL && (
                                                <span className="text-xs text-muted-foreground tabular-nums">
                                                    {counts[value]}
                                                </span>
                                            )}
                                        </button>
                                    ),
                                )}
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <div className="relative">
                                    <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <input
                                        type="search"
                                        value={search}
                                        onChange={(e) =>
                                            setSearch(e.target.value)
                                        }
                                        placeholder={t('Search services')}
                                        aria-label={t('Search services')}
                                        className="h-9 w-48 rounded-md border bg-background pr-3 pl-8 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                                    />
                                </div>
                                <Select
                                    value={server}
                                    onValueChange={setServer}
                                >
                                    <SelectTrigger
                                        className="w-44"
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
                            </div>
                        </div>

                        {visible.length === 0 && (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('No service matches the filter.')}
                            </p>
                        )}

                        {visible.map((s) => (
                            <section
                                key={s.id}
                                className="overflow-hidden rounded-xl border bg-card"
                            >
                                <header className="flex flex-wrap items-baseline justify-between gap-2 border-b px-4 py-3">
                                    <h2 className="font-semibold">{s.name}</h2>
                                    {s.last_seen_at && (
                                        <span className="text-xs text-muted-foreground">
                                            {t('Reported :time', {
                                                time: timeAgo(
                                                    s.last_seen_at,
                                                    generated_at,
                                                    locale,
                                                ),
                                            })}
                                        </span>
                                    )}
                                </header>
                                <ul className="divide-y">
                                    {s.services.map((service) => (
                                        <li
                                            key={service.id}
                                            className="flex items-center gap-3 px-4 py-2.5"
                                        >
                                            <span
                                                className={cn(
                                                    'size-2.5 shrink-0 rounded-full',
                                                    DOT[service.status],
                                                )}
                                                aria-hidden
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate text-sm font-medium">
                                                    {service.unit.replace(
                                                        /\.service$/,
                                                        '',
                                                    )}
                                                </p>
                                                {service.description && (
                                                    <p className="truncate text-xs text-muted-foreground">
                                                        {service.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="hidden text-right text-xs text-muted-foreground sm:block">
                                                <p
                                                    className={cn(
                                                        service.status ===
                                                            'failed' &&
                                                            'font-medium text-red-600 dark:text-red-400',
                                                    )}
                                                >
                                                    {labels[service.status]}
                                                </p>
                                                <p>
                                                    {[
                                                        service.sub_state,
                                                        service.unit_file_state,
                                                    ]
                                                        .filter(Boolean)
                                                        .join(' · ')}
                                                </p>
                                            </div>
                                            <div className="flex shrink-0 items-center gap-1.5">
                                                {service.journal_pending ? (
                                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                                        <Spinner className="size-3.5" />
                                                        <span className="hidden md:inline">
                                                            {t(
                                                                'Waiting for the agent',
                                                            )}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <>
                                                        {service.journal_at && (
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                asChild
                                                            >
                                                                <a
                                                                    href={ApplicationController.journal.url(
                                                                        service.id,
                                                                    )}
                                                                    download
                                                                    title={t(
                                                                        'Journal from :time',
                                                                        {
                                                                            time: timeAgo(
                                                                                service.journal_at,
                                                                                generated_at,
                                                                                locale,
                                                                            ),
                                                                        },
                                                                    )}
                                                                    aria-label={t(
                                                                        'Download the journal of :name',
                                                                        {
                                                                            name: service.unit,
                                                                        },
                                                                    )}
                                                                >
                                                                    <Download className="size-3.5" />
                                                                    <span className="hidden md:inline">
                                                                        {t(
                                                                            'Download',
                                                                        )}
                                                                    </span>
                                                                </a>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() =>
                                                                requestJournal(
                                                                    service.id,
                                                                )
                                                            }
                                                            aria-label={t(
                                                                'Request the journal of :name',
                                                                {
                                                                    name: service.unit,
                                                                },
                                                            )}
                                                        >
                                                            {service.journal_at ? (
                                                                <RefreshCw className="size-3.5" />
                                                            ) : (
                                                                <FileText className="size-3.5" />
                                                            )}
                                                            <span className="hidden md:inline">
                                                                {service.journal_at
                                                                    ? t(
                                                                          'Request again',
                                                                      )
                                                                    : t(
                                                                          'Journal',
                                                                      )}
                                                            </span>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </section>
                        ))}
                    </>
                )}
            </div>
        </>
    );
}

Applications.layout = {
    breadcrumbs: [{ title: 'Applications', href: index() }],
};
