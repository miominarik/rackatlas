import { Head, Link } from '@inertiajs/react';
import { Check, Copy, Menu } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import AppLogoIcon from '@/components/app-logo-icon';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { login } from '@/routes';
import { localized as homeLocalized } from '@/routes/home';

type Props = {
    baseUrl: string;
    scopes: string[];
    intervals: number[];
    maxRangeDays: number;
    maxPoints: number;
};

type Param = { name: string; type: string; description: string };

type Endpoint = {
    id: string;
    path: string;
    scope: string | null;
    title: string;
    description: string;
    params?: Param[];
    request: string;
    response: string;
};

const NAV: { title: string; items: { id: string; label: string }[] }[] = [
    {
        title: 'Getting started',
        items: [
            { id: 'introduction', label: 'Introduction' },
            { id: 'authentication', label: 'Authentication' },
            { id: 'scopes', label: 'Scopes' },
            { id: 'conventions', label: 'Conventions' },
            { id: 'errors', label: 'Errors' },
            { id: 'limits', label: 'Rate limits' },
        ],
    },
    {
        title: 'Endpoints',
        items: [
            { id: 'me', label: 'Who am I' },
            { id: 'servers', label: 'List servers' },
            { id: 'server', label: 'Get a server' },
            { id: 'metrics', label: 'Metrics history' },
            { id: 'disks', label: 'Disk history' },
            { id: 'applications', label: 'Applications' },
            { id: 'backups', label: 'Backups' },
            { id: 'alerts', label: 'Alerts' },
        ],
    },
    {
        title: 'Guides',
        items: [{ id: 'grafana', label: 'Grafana' }],
    },
];

const ALL_IDS = NAV.flatMap((group) => group.items.map((item) => item.id));

function endpoints(baseUrl: string): Endpoint[] {
    const curl = (path: string) =>
        `curl ${baseUrl}${path} \\\n  -H "Authorization: Bearer $RACKATLAS_KEY"`;

    return [
        {
            id: 'me',
            path: '/me',
            scope: null,
            title: 'Who am I',
            description:
                'Returns the team the key belongs to and the scopes it has. Needs no scope, so it is the best first call and a good health check for a data source.',
            request: curl('/me'),
            response: `{
  "data": {
    "team": { "id": 3, "name": "Acme" },
    "key": {
      "name": "Grafana",
      "scopes": ["servers:read", "metrics:read"],
      "expires_at": null
    }
  }
}`,
        },
        {
            id: 'servers',
            path: '/servers',
            scope: 'servers:read',
            title: 'List servers',
            description:
                'All servers of the team with their latest sample. Servers that never reported have "current": null.',
            request: curl('/servers'),
            response: `{
  "data": [
    {
      "id": 12,
      "name": "web-1",
      "category": "Production",
      "provider": "Hetzner",
      "country": "DE",
      "host": "203.0.113.10",
      "status": "online",
      "agent_version": "1.6",
      "system_info": { "os": "Debian GNU/Linux 12", "kernel": "6.1.0" },
      "last_seen_at": "2026-11-05T13:41:02+00:00",
      "last_checked_at": "2026-11-05T13:41:02+00:00",
      "current": {
        "collected_at": "2026-11-05T13:41:02+00:00",
        "cpu_percent": 12.4,
        "cpu_cores": 4,
        "load_1": 0.42,
        "load_5": 0.38,
        "load_15": 0.31,
        "memory_total_bytes": 8321486848,
        "memory_used_bytes": 3120562176,
        "memory_percent": 37.5,
        "swap_total_bytes": 0,
        "swap_used_bytes": 0,
        "uptime_seconds": 864000,
        "net_rx_bps": 18200,
        "net_tx_bps": 40100,
        "disks": [
          {
            "mount": "/",
            "device": "/dev/vda1",
            "filesystem": "ext4",
            "total_bytes": 85899345920,
            "used_bytes": 31457280000,
            "used_percent": 36.6
          }
        ]
      }
    }
  ]
}`,
        },
        {
            id: 'server',
            path: '/servers/{id}',
            scope: 'servers:read',
            title: 'Get a server',
            description:
                'One server, in the same shape as an item of the list. A server of another team answers 404.',
            params: [
                {
                    name: 'id',
                    type: 'integer, path',
                    description: 'The id of the server.',
                },
            ],
            request: curl('/servers/12'),
            response: `{ "data": { "id": 12, "name": "web-1", "status": "online", "current": { "...": "..." } } }`,
        },
        {
            id: 'metrics',
            path: '/servers/{id}/metrics',
            scope: 'metrics:read',
            title: 'Metrics history',
            description:
                'CPU, memory, load and network of one server as one flat row per time bucket. Rows are averaged (and maximums kept) inside each bucket. Buckets without samples are left out.',
            params: [
                {
                    name: 'from',
                    type: 'datetime, optional',
                    description:
                        'Start of the range, ISO 8601. Default: a day before "to".',
                },
                {
                    name: 'to',
                    type: 'datetime, optional',
                    description: 'End of the range, ISO 8601. Default: now.',
                },
                {
                    name: 'interval',
                    type: 'integer, optional',
                    description:
                        'Bucket size in seconds. Default: the smallest allowed value that keeps the range readable.',
                },
            ],
            request: curl(
                '/servers/12/metrics?from=2026-11-04T00:00:00Z&interval=300',
            ),
            response: `{
  "data": [
    {
      "time": "2026-11-04T00:00:00+00:00",
      "samples": 5,
      "cpu_percent_avg": 11.8,
      "cpu_percent_max": 24.1,
      "memory_percent_avg": 37.2,
      "memory_percent_max": 37.6,
      "memory_used_bytes_avg": 3095000000,
      "swap_percent_avg": null,
      "load_1": 0.4,
      "load_5": 0.38,
      "load_15": 0.31,
      "net_rx_bps_avg": 17800,
      "net_rx_bps_max": 61000,
      "net_tx_bps_avg": 39500,
      "net_tx_bps_max": 120000
    }
  ],
  "meta": {
    "from": "2026-11-04T00:00:00+00:00",
    "to": "2026-11-05T13:45:00+00:00",
    "interval_seconds": 300
  }
}`,
        },
        {
            id: 'disks',
            path: '/servers/{id}/metrics/disks',
            scope: 'metrics:read',
            title: 'Disk history',
            description:
                'Disk usage of one server in long format: one row per mount point and time bucket. Partition or filter by "mount" in Grafana. Takes the same parameters as the metrics history.',
            request: curl('/servers/12/metrics/disks?interval=3600'),
            response: `{
  "data": [
    {
      "time": "2026-11-05T12:00:00+00:00",
      "mount": "/",
      "used_bytes": 31457280000,
      "total_bytes": 85899345920,
      "used_percent": 36.6
    }
  ],
  "meta": { "from": "...", "to": "...", "interval_seconds": 3600 }
}`,
        },
        {
            id: 'applications',
            path: '/applications',
            scope: 'applications:read',
            title: 'Applications',
            description:
                'The systemd services of the servers that run the agent, with their state as the agent last reported it.',
            params: [
                {
                    name: 'server_id',
                    type: 'integer, optional',
                    description: 'Only the services of this server.',
                },
                {
                    name: 'status',
                    type: 'string, optional',
                    description: 'One of failed, running, stopped or disabled.',
                },
            ],
            request: curl('/applications?status=failed'),
            response: `{
  "data": [
    {
      "id": 481,
      "server_id": 12,
      "server_name": "web-1",
      "unit": "php8.5-fpm.service",
      "description": "The PHP 8.5 FastCGI Process Manager",
      "status": "failed",
      "active_state": "failed",
      "sub_state": "failed",
      "unit_file_state": "enabled"
    }
  ]
}`,
        },
        {
            id: 'backups',
            path: '/backups',
            scope: 'backups:read',
            title: 'Backups',
            description:
                'The backups of the team and how their last run went. "overdue" is true when no run was reported within the expected interval. The secret webhook address of a backup is never part of the answer.',
            request: curl('/backups'),
            response: `{
  "data": [
    {
      "id": 5,
      "name": "Database dump",
      "server_id": 12,
      "server_name": "web-1",
      "is_active": true,
      "expected_interval_hours": 24,
      "last_run_at": "2026-11-05T03:00:11+00:00",
      "last_status": "success",
      "last_message": null,
      "last_size_bytes": 482934112,
      "overdue": false
    }
  ]
}`,
        },
        {
            id: 'alerts',
            path: '/alerts',
            scope: 'alerts:read',
            title: 'Alerts',
            description:
                'Problems RackAtlas detected on the servers of the team, newest first (at most 500).',
            params: [
                {
                    name: 'status',
                    type: 'string, optional',
                    description: 'open (default), resolved or all.',
                },
                {
                    name: 'server_id',
                    type: 'integer, optional',
                    description: 'Only the alerts of this server.',
                },
            ],
            request: curl('/alerts?status=open'),
            response: `{
  "data": [
    {
      "id": 77,
      "server_id": 12,
      "server_name": "web-1",
      "type": "resource",
      "key": "disk:/",
      "context": { "percent": 93.1 },
      "opened_at": "2026-11-05T11:20:00+00:00",
      "resolved_at": null,
      "open": true
    }
  ]
}`,
        },
    ];
}

function CodeBlock({
    code,
    label,
    className,
}: {
    code: string;
    label?: string;
    className?: string;
}) {
    const [copied, copy] = useClipboard();
    const done = copied === code;

    return (
        <div
            className={cn(
                'group overflow-hidden rounded-xl border border-[var(--l-border)] bg-[#0b0f0e] text-[#d7e0db]',
                className,
            )}
        >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-2 text-xs text-[#8a948f]">
                <span>{label ?? ''}</span>
                <button
                    type="button"
                    onClick={() => copy(code)}
                    className="flex items-center gap-1.5 rounded-md px-2 py-1 hover:bg-white/10 hover:text-white"
                    aria-label="Copy"
                >
                    {done ? (
                        <Check className="size-3.5" />
                    ) : (
                        <Copy className="size-3.5" />
                    )}
                    {done ? 'Copied' : 'Copy'}
                </button>
            </div>
            <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed">
                <code>{code}</code>
            </pre>
        </div>
    );
}

function Section({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: ReactNode;
}) {
    return (
        <section
            id={id}
            className="scroll-mt-24 border-b border-[var(--l-border)] py-10 last:border-0"
        >
            <h2 className="mb-4 text-[26px] font-semibold tracking-tight">
                {title}
            </h2>
            <div className="space-y-4 text-[var(--l-body)]">{children}</div>
        </section>
    );
}

function Inline({ children }: { children: ReactNode }) {
    return (
        <code className="rounded-md bg-[var(--l-soft)] px-1.5 py-0.5 font-mono text-[0.85em] text-[var(--l-ink)]">
            {children}
        </code>
    );
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
    return (
        <div className="overflow-x-auto rounded-xl border border-[var(--l-border)]">
            <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-[var(--l-soft)] text-[var(--l-muted)]">
                    <tr>
                        {head.map((cell) => (
                            <th
                                key={cell}
                                className="px-3.5 py-2.5 font-medium"
                            >
                                {cell}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--l-border)]">
                    {rows.map((row, index) => (
                        <tr key={index}>
                            {row.map((cell, cellIndex) => (
                                <td
                                    key={cellIndex}
                                    className="px-3.5 py-2.5 align-top"
                                >
                                    {cell}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

function EndpointSection({ endpoint }: { endpoint: Endpoint }) {
    return (
        <Section id={endpoint.id} title={endpoint.title}>
            <div className="flex flex-wrap items-center gap-2.5">
                <span className="rounded-md bg-emerald-500/15 px-2 py-1 font-mono text-xs font-semibold text-[var(--l-accent)]">
                    GET
                </span>
                <code className="font-mono text-[14px] break-all text-[var(--l-ink)]">
                    /api/v1{endpoint.path}
                </code>
                {endpoint.scope ? (
                    <span className="rounded-full border border-[var(--l-border)] px-2.5 py-0.5 font-mono text-xs text-[var(--l-muted)]">
                        {endpoint.scope}
                    </span>
                ) : (
                    <span className="rounded-full border border-[var(--l-border)] px-2.5 py-0.5 text-xs text-[var(--l-muted)]">
                        any key
                    </span>
                )}
            </div>
            <p>{endpoint.description}</p>
            {endpoint.params && (
                <Table
                    head={['Parameter', 'Type', 'Description']}
                    rows={endpoint.params.map((param) => [
                        <Inline key="n">{param.name}</Inline>,
                        <span key="t" className="text-[var(--l-muted)]">
                            {param.type}
                        </span>,
                        param.description,
                    ])}
                />
            )}
            <CodeBlock code={endpoint.request} label="Request" />
            <CodeBlock code={endpoint.response} label="Response 200" />
        </Section>
    );
}

export default function ApiDocs({
    baseUrl,
    scopes,
    intervals,
    maxRangeDays,
    maxPoints,
}: Props) {
    const { locale } = useTranslation();
    const [active, setActive] = useState(ALL_IDS[0]);
    const [menuOpen, setMenuOpen] = useState(false);
    const list = endpoints(baseUrl);

    useEffect(() => {
        document.documentElement.classList.add('smooth-anchors');

        const observer = new IntersectionObserver(
            (entries) => {
                const visible = entries
                    .filter((entry) => entry.isIntersecting)
                    .sort(
                        (a, b) =>
                            a.boundingClientRect.top - b.boundingClientRect.top,
                    );

                if (visible[0]) {
                    setActive(visible[0].target.id);
                }
            },
            { rootMargin: '-80px 0px -65% 0px' },
        );

        ALL_IDS.forEach((id) => {
            const element = document.getElementById(id);

            if (element) {
                observer.observe(element);
            }
        });

        return () => {
            observer.disconnect();
            document.documentElement.classList.remove('smooth-anchors');
        };
    }, []);

    const nav = (
        <nav className="space-y-6 text-sm">
            {NAV.map((group) => (
                <div key={group.title}>
                    <p className="mb-2 text-xs font-semibold tracking-wider text-[var(--l-muted)] uppercase">
                        {group.title}
                    </p>
                    <ul className="space-y-0.5">
                        {group.items.map((item) => (
                            <li key={item.id}>
                                <a
                                    href={`#${item.id}`}
                                    onClick={() => setMenuOpen(false)}
                                    className={cn(
                                        'block rounded-md px-2.5 py-1.5 text-[var(--l-body)] hover:bg-[var(--l-soft)] hover:text-[var(--l-ink)]',
                                        active === item.id &&
                                            'bg-[var(--l-soft)] font-medium text-[var(--l-ink)]',
                                    )}
                                >
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </nav>
    );

    return (
        <>
            <Head title="API documentation" />
            <div className="landing min-h-dvh bg-[var(--l-bg)] text-[16px] leading-relaxed text-[var(--l-ink)]">
                <header className="sticky top-0 z-30 border-b border-[var(--l-border)] bg-[var(--l-bg)]/90 backdrop-blur">
                    <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-3 px-4 sm:px-8">
                        <button
                            type="button"
                            className="-ml-2 rounded-md p-2 hover:bg-[var(--l-soft)] lg:hidden"
                            aria-label="Menu"
                            onClick={() => setMenuOpen((open) => !open)}
                        >
                            <Menu className="size-5" />
                        </button>
                        <Link
                            href={homeLocalized(locale)}
                            className="flex items-center gap-2 font-semibold tracking-tight"
                        >
                            <AppLogoIcon className="size-6 fill-current text-[var(--l-accent)]" />
                            RackAtlas
                        </Link>
                        <span className="rounded-md border border-[var(--l-border)] px-2 py-0.5 text-xs text-[var(--l-muted)]">
                            API v1
                        </span>
                        <div className="ml-auto flex items-center gap-4 text-sm">
                            <Link
                                href={homeLocalized(locale)}
                                className="hidden text-[var(--l-muted)] hover:text-[var(--l-ink)] sm:inline"
                            >
                                Home
                            </Link>
                            <Link
                                href={login()}
                                className="rounded-full bg-[var(--l-ink)] px-4 py-1.5 font-medium text-[var(--l-bg)] hover:opacity-90"
                            >
                                Get a key
                            </Link>
                        </div>
                    </div>
                    {menuOpen && (
                        <div className="max-h-[70dvh] overflow-y-auto border-t border-[var(--l-border)] px-4 py-4 lg:hidden">
                            {nav}
                        </div>
                    )}
                </header>

                <div className="mx-auto grid max-w-[1180px] gap-10 px-4 sm:px-8 lg:grid-cols-[220px_minmax(0,1fr)]">
                    <aside className="hidden lg:block">
                        <div className="sticky top-20 max-h-[calc(100dvh-6rem)] overflow-y-auto py-10 pr-2">
                            {nav}
                        </div>
                    </aside>

                    <main className="min-w-0 pb-24">
                        <Section id="introduction" title="RackAtlas API">
                            <p>
                                A read-only JSON API for the data RackAtlas
                                collects about your servers: current state,
                                metrics history, systemd services, backups and
                                alerts. It is made for dashboards. Grafana can
                                read it directly, see the{' '}
                                <a
                                    href="#grafana"
                                    className="text-[var(--l-accent)] underline underline-offset-4"
                                >
                                    Grafana guide
                                </a>
                                .
                            </p>
                            <p>The base URL of every endpoint is:</p>
                            <CodeBlock code={baseUrl} label="Base URL" />
                            <p>
                                Create a key in{' '}
                                <strong>
                                    Settings → Teams → your team → API keys
                                </strong>
                                . Then try it:
                            </p>
                            <CodeBlock
                                label="Quick start"
                                code={`export RACKATLAS_KEY=rak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\n\ncurl ${baseUrl}/me \\\n  -H "Authorization: Bearer $RACKATLAS_KEY"`}
                            />
                        </Section>

                        <Section id="authentication" title="Authentication">
                            <p>
                                Send the key of your team as a bearer token in
                                the <Inline>Authorization</Inline> header of
                                every request. A key belongs to one team and
                                sees only the data of that team.
                            </p>
                            <CodeBlock code="Authorization: Bearer rak_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx" />
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    A key is shown <strong>once</strong>, when
                                    you create it. RackAtlas keeps only a hash,
                                    so a lost key cannot be recovered. Create a
                                    new one and revoke the old one.
                                </li>
                                <li>
                                    A key can expire (30, 90 or 365 days) or
                                    live until you revoke it. A revoked or
                                    expired key answers <Inline>401</Inline>.
                                </li>
                                <li>
                                    Use one key per integration, so you can
                                    revoke one without breaking the others. The
                                    page of the keys shows when each was last
                                    used.
                                </li>
                                <li>
                                    Keep keys out of dashboards that are shared
                                    publicly and out of source control.
                                </li>
                            </ul>
                        </Section>

                        <Section id="scopes" title="Scopes">
                            <p>
                                A key gets only the scopes you tick when you
                                create it. A request to an endpoint whose scope
                                the key lacks answers <Inline>403</Inline>. All
                                scopes are read-only.
                            </p>
                            <Table
                                head={['Scope', 'Allows']}
                                rows={[
                                    [
                                        'servers:read',
                                        'List and read servers with their latest sample',
                                    ],
                                    [
                                        'metrics:read',
                                        'Metrics and disk history of a server',
                                    ],
                                    [
                                        'applications:read',
                                        'Systemd services of the servers',
                                    ],
                                    [
                                        'backups:read',
                                        'Backups and the result of their last run',
                                    ],
                                    ['alerts:read', 'Open and resolved alerts'],
                                ]
                                    .filter(([scope]) => scopes.includes(scope))
                                    .map(([scope, text]) => [
                                        <Inline key={scope}>{scope}</Inline>,
                                        text,
                                    ])}
                            />
                        </Section>

                        <Section id="conventions" title="Conventions">
                            <ul className="list-disc space-y-2 pl-5">
                                <li>
                                    <strong>JSON only.</strong> Every response,
                                    errors included, is{' '}
                                    <Inline>application/json</Inline>. A client
                                    that accepts nothing else than another
                                    format gets <Inline>406</Inline>, and a
                                    request body that is not JSON gets{' '}
                                    <Inline>415</Inline>.
                                </li>
                                <li>
                                    <strong>Read-only.</strong> Only{' '}
                                    <Inline>GET</Inline> is supported. Other
                                    methods answer <Inline>405</Inline>.
                                </li>
                                <li>
                                    <strong>Envelope.</strong> Data is in the{' '}
                                    <Inline>data</Inline> key. Time series add a{' '}
                                    <Inline>meta</Inline> object with the range
                                    and bucket size that was applied.
                                </li>
                                <li>
                                    <strong>Times</strong> are ISO 8601 with an
                                    offset, for example{' '}
                                    <Inline>2026-11-05T13:41:02+00:00</Inline>.
                                    Sizes are in bytes, rates in bytes per
                                    second, percentages are 0 to 100.
                                </li>
                                <li>
                                    <strong>Time series.</strong> Allowed
                                    intervals are{' '}
                                    {intervals.map((value, index) => (
                                        <span key={value}>
                                            {index > 0 && ', '}
                                            <Inline>{value}</Inline>
                                        </span>
                                    ))}{' '}
                                    seconds. A request may span at most{' '}
                                    {maxRangeDays} days and {maxPoints} points.
                                    The history is kept for 30 days.
                                </li>
                            </ul>
                        </Section>

                        <Section id="errors" title="Errors">
                            <p>
                                Errors carry a <Inline>message</Inline>.
                                Validation errors (<Inline>422</Inline>) also
                                list the invalid fields under{' '}
                                <Inline>errors</Inline>.
                            </p>
                            <Table
                                head={['Status', 'Meaning']}
                                rows={[
                                    [
                                        '401',
                                        'The key is missing, wrong, revoked or expired.',
                                    ],
                                    [
                                        '403',
                                        'The key lacks the scope of the endpoint.',
                                    ],
                                    [
                                        '404',
                                        'No such endpoint, or the server does not belong to your team.',
                                    ],
                                    ['405', 'Only GET is supported.'],
                                    [
                                        '406',
                                        'The client does not accept application/json.',
                                    ],
                                    [
                                        '415',
                                        'The request body is not application/json.',
                                    ],
                                    ['422', 'A parameter is invalid.'],
                                    [
                                        '429',
                                        'Too many requests, see Retry-After.',
                                    ],
                                ].map(([status, text]) => [
                                    <Inline key={status}>{status}</Inline>,
                                    text,
                                ])}
                            />
                            <CodeBlock
                                label="Response 422"
                                code={`{
  "message": "The selected interval is invalid.",
  "errors": { "interval": ["The selected interval is invalid."] }
}`}
                            />
                        </Section>

                        <Section id="limits" title="Rate limits">
                            <p>
                                A key may send{' '}
                                <strong>120 requests per minute</strong>. Wrong
                                keys are limited per IP address: after 20 failed
                                attempts in a minute the address is blocked for
                                the rest of that minute. When a limit is hit you
                                get <Inline>429</Inline> and a{' '}
                                <Inline>Retry-After</Inline> header with the
                                seconds to wait.
                            </p>
                            <p>
                                Servers report once a minute, so polling more
                                often than that returns the same data. A
                                dashboard refresh of 30 to 60 seconds is plenty.
                            </p>
                        </Section>

                        {list.map((endpoint) => (
                            <EndpointSection
                                key={endpoint.id}
                                endpoint={endpoint}
                            />
                        ))}

                        <Section id="grafana" title="Grafana">
                            <p>
                                Use the{' '}
                                <a
                                    href="https://grafana.com/grafana/plugins/yesoreyeram-infinity-datasource/"
                                    target="_blank"
                                    rel="noreferrer noopener"
                                    className="text-[var(--l-accent)] underline underline-offset-4"
                                >
                                    Infinity data source
                                </a>
                                , which reads JSON from any HTTP API. You need
                                no Prometheus or database in between.
                            </p>
                            <ol className="list-decimal space-y-3 pl-5">
                                <li>
                                    Create a key with the scopes{' '}
                                    <Inline>servers:read</Inline> and{' '}
                                    <Inline>metrics:read</Inline> (add the
                                    others for the panels you want).
                                </li>
                                <li>
                                    In Grafana, install the Infinity plugin and
                                    add a data source. Under{' '}
                                    <strong>Authentication</strong> choose{' '}
                                    <strong>Bearer token</strong> and paste the
                                    key.
                                </li>
                                <li>
                                    Under <strong>Allowed hosts</strong> add{' '}
                                    <Inline>{new URL(baseUrl).origin}</Inline>.
                                </li>
                                <li>
                                    Press <strong>Save &amp; test</strong>. You
                                    can set the health check URL to{' '}
                                    <Inline>{baseUrl}/me</Inline>.
                                </li>
                            </ol>
                            <p>A panel with the CPU of one server:</p>
                            <div className="space-y-2 rounded-xl border border-[var(--l-border)] bg-[var(--l-card)] p-4 text-sm">
                                <p>
                                    <strong>Type</strong> JSON,{' '}
                                    <strong>Parser</strong> Backend,{' '}
                                    <strong>Format</strong> Time series
                                </p>
                                <p>
                                    <strong>URL</strong>{' '}
                                    <Inline>
                                        {baseUrl}/servers/12/metrics?from=${'{'}
                                        __from:date:iso{'}'}&amp;to=${'{'}
                                        __to:date:iso{'}'}
                                    </Inline>
                                </p>
                                <p>
                                    <strong>Rows / root</strong>{' '}
                                    <Inline>data</Inline>
                                </p>
                                <p>
                                    <strong>Columns</strong>{' '}
                                    <Inline>time</Inline> (Timestamp),{' '}
                                    <Inline>cpu_percent_avg</Inline> (Number),{' '}
                                    <Inline>memory_percent_avg</Inline> (Number)
                                </p>
                            </div>
                            <p>
                                The <Inline>from</Inline> and{' '}
                                <Inline>to</Inline> variables follow the time
                                picker of the dashboard. Leave{' '}
                                <Inline>interval</Inline> out and RackAtlas
                                picks a bucket that suits the range. For tables
                                of servers, services, backups or alerts use the
                                endpoints above with the format{' '}
                                <strong>Table</strong>. To draw one line per
                                disk, use the disk history and add the{' '}
                                <Inline>mount</Inline> column to{' '}
                                <strong>Group by</strong>.
                            </p>
                        </Section>

                        <p className="pt-6 text-sm text-[var(--l-muted)]">
                            Questions or something missing?{' '}
                            <Link
                                href={homeLocalized(locale)}
                                className="underline underline-offset-4 hover:text-[var(--l-ink)]"
                            >
                                Back to RackAtlas
                            </Link>
                        </p>
                    </main>
                </div>
            </div>
        </>
    );
}
