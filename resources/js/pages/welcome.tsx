import { Head, Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import type { ReactNode } from 'react';
import LanguageController from '@/actions/App/Http/Controllers/Settings/LanguageController';
import {
    openCookieSettings,
    useCookieConsent,
} from '@/hooks/use-privacy-choices';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { dashboard, login, privacy, register } from '@/routes';

type Props = {
    canRegister: boolean;
    canonicalUrl: string;
};

function Mark({ className }: { className?: string }) {
    return (
        <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
            <rect width="32" height="32" rx="8" fill="var(--l-accent)" />
            <g fill="#fff">
                <rect x="6" y="7" width="20" height="4.5" rx="1.25" />
                <rect
                    x="6"
                    y="13.75"
                    width="20"
                    height="4.5"
                    rx="1.25"
                    opacity=".8"
                />
                <rect
                    x="6"
                    y="20.5"
                    width="20"
                    height="4.5"
                    rx="1.25"
                    opacity=".6"
                />
            </g>
        </svg>
    );
}

function Meter({
    label,
    value,
    tone = 'ok',
}: {
    label: string;
    value: number;
    tone?: 'ok' | 'warn';
}) {
    return (
        <div className="flex items-center gap-2 text-[11px] text-[var(--l-muted)]">
            <span className="w-9 shrink-0">{label}</span>
            <span className="h-[5px] flex-1 rounded-full bg-[var(--l-border)]">
                <span
                    className={cn(
                        'block h-[5px] rounded-full',
                        tone === 'ok' ? 'bg-[var(--l-dot)]' : 'bg-amber-500',
                    )}
                    style={{ width: `${value}%` }}
                />
            </span>
            <span
                className={cn(
                    'w-8 shrink-0 text-right font-mono',
                    tone === 'warn' && 'text-amber-600 dark:text-amber-400',
                )}
            >
                {value}%
            </span>
        </div>
    );
}

function ServerCard({
    name,
    meters,
    state = 'ok',
}: {
    name: string;
    meters: { label: string; value: number; tone?: 'ok' | 'warn' }[];
    state?: 'ok' | 'warn';
}) {
    return (
        <div
            className={cn(
                'rounded-xl border p-3',
                state === 'warn'
                    ? 'border-[var(--l-warn-border)] bg-[var(--l-warn-bg)]'
                    : 'border-[var(--l-border)] bg-[var(--l-card)]',
            )}
        >
            <p className="mb-2.5 flex items-center gap-2 text-[13px] font-semibold">
                <span
                    className={cn(
                        'size-2 rounded-full',
                        state === 'warn' ? 'bg-amber-500' : 'bg-[var(--l-dot)]',
                    )}
                />
                {name}
            </p>
            <div className="space-y-1.5">
                {meters.map((meter) => (
                    <Meter key={meter.label} {...meter} />
                ))}
            </div>
        </div>
    );
}

function Tile({
    className,
    children,
    dark = false,
}: {
    className?: string;
    children: ReactNode;
    dark?: boolean;
}) {
    return (
        <div
            className={cn(
                'rounded-[20px] border p-6 transition-[box-shadow,border-color] hover:shadow-[0_12px_32px_-20px_rgba(15,25,20,0.35)] sm:p-7',
                dark
                    ? 'border-[#0e1110] bg-[#0e1110] text-white dark:border-[var(--l-border)] dark:bg-[var(--l-soft)]'
                    : 'border-[var(--l-border)] bg-[var(--l-card)]',
                className,
            )}
        >
            {children}
        </div>
    );
}

function Eyebrow({
    children,
    className,
}: {
    children: ReactNode;
    className?: string;
}) {
    return (
        <p
            className={cn(
                'mb-2.5 font-mono text-xs tracking-wide text-[var(--l-accent)] uppercase',
                className,
            )}
        >
            {children}
        </p>
    );
}

export default function Welcome({ canRegister, canonicalUrl }: Props) {
    const { t, locale } = useTranslation();
    const { consent } = useCookieConsent();

    useEffect(() => {
        document.documentElement.classList.add('smooth-anchors');

        return () =>
            document.documentElement.classList.remove('smooth-anchors');
    }, []);
    const { locales, auth } = usePage<{
        locales: Record<string, string>;
        auth: { user: unknown };
    }>().props;
    const signedIn = auth.user !== null && auth.user !== undefined;

    const primary =
        'inline-flex items-center justify-center rounded-full px-6 py-3 text-[15px] font-medium transition-transform hover:-translate-y-px';

    const title = t('Linux server monitoring without open ports');
    const description = t(
        'RackAtlas monitors Debian and Ubuntu servers with a lightweight agent: CPU, memory, disks, services and critical logs. Alerts by email and push, no open ports.',
    );
    const faq: [string, string][] = [
        [
            t('What does the agent collect?'),
            t(
                'CPU, load, memory, swap, disk usage, failed systemd services and critical log entries. It does not read your files or application data.',
            ),
        ],
        [
            t('Do I need to open any ports?'),
            t(
                'No. The agent sends data to RackAtlas over HTTPS once a minute. Nothing connects into your server, so your firewall stays as it is.',
            ),
        ],
        [
            t('Which systems are supported?'),
            t(
                'Debian and Ubuntu on amd64, arm64, armhf and i386, installed from a signed apt repository.',
            ),
        ],
        [
            t('How do I remove the agent?'),
            t(
                'Run sudo apt purge rackatlas-agent on the server and delete the server in RackAtlas.',
            ),
        ],
    ];

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <link rel="canonical" href={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content="RackAtlas" />
                <meta property="og:title" content={`${title} - RackAtlas`} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={`${title} - RackAtlas`} />
                <meta name="twitter:description" content={description} />
                <script type="application/ld+json">
                    {JSON.stringify([
                        {
                            '@context': 'https://schema.org',
                            '@type': 'SoftwareApplication',
                            name: 'RackAtlas',
                            url: canonicalUrl,
                            description,
                            applicationCategory: 'BusinessApplication',
                            operatingSystem: 'Web, Debian, Ubuntu',
                            inLanguage: locale,
                        },
                        {
                            '@context': 'https://schema.org',
                            '@type': 'FAQPage',
                            mainEntity: faq.map(([question, answer]) => ({
                                '@type': 'Question',
                                name: question,
                                acceptedAnswer: {
                                    '@type': 'Answer',
                                    text: answer,
                                },
                            })),
                        },
                    ])}
                </script>
            </Head>

            <div className="landing min-h-dvh overflow-x-clip bg-[var(--l-bg)] text-[17px] leading-relaxed text-[var(--l-ink)]">
                {/* navigation */}
                <div className="sticky top-0 z-30 mx-auto max-w-[1240px] px-4 pt-4 sm:px-8 sm:pt-5">
                    <header className="flex items-center gap-x-8 rounded-full border border-[var(--l-border)] bg-[var(--l-card)]/85 py-2.5 pr-2.5 pl-4 shadow-[0_8px_24px_-16px_rgba(15,25,20,0.35)] backdrop-blur-md sm:pr-3 sm:pl-5">
                        <a
                            href="/"
                            className="flex items-center gap-2.5 text-lg font-semibold tracking-tight"
                        >
                            <Mark className="size-[26px]" />
                            <span className="hidden min-[430px]:inline">
                                RackAtlas
                            </span>
                            <span className="sr-only min-[430px]:hidden">
                                RackAtlas
                            </span>
                        </a>
                        <nav className="hidden flex-1 justify-center gap-7 text-[15px] text-[var(--l-body)] md:flex">
                            <a
                                href="#features"
                                className="hover:text-[var(--l-ink)]"
                            >
                                {t('Features')}
                            </a>
                            <a
                                href="#how"
                                className="hover:text-[var(--l-ink)]"
                            >
                                {t('How it works')}
                            </a>
                            <a
                                href="#start"
                                className="hover:text-[var(--l-ink)]"
                            >
                                {t('Get started')}
                            </a>
                        </nav>
                        <div className="ml-auto flex items-center gap-0.5 text-sm sm:gap-1 sm:text-[15px]">
                            {signedIn ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-full bg-[var(--l-ink)] px-4 py-2.5 font-medium whitespace-nowrap text-[var(--l-bg)] transition-transform hover:-translate-y-px sm:px-5"
                                >
                                    {t('Dashboard')}
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-full px-3 py-2 font-medium whitespace-nowrap text-[var(--l-body)] hover:text-[var(--l-ink)] sm:px-4"
                                    >
                                        {t('Log in')}
                                    </Link>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className="rounded-full bg-[var(--l-ink)] px-4 py-2.5 font-medium whitespace-nowrap text-[var(--l-bg)] transition-transform hover:-translate-y-px sm:px-5"
                                        >
                                            {t('Create account')}
                                        </Link>
                                    )}
                                </>
                            )}
                        </div>
                    </header>
                </div>

                {/* hero */}
                <section
                    id="top"
                    className="mx-auto flex max-w-[1240px] scroll-mt-24 flex-wrap items-center gap-x-6 gap-y-14 px-4 pt-16 pb-10 sm:px-8 sm:pt-20"
                >
                    <div className="max-w-[660px] min-w-0 flex-[1_1_580px]">
                        <p className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-[var(--l-border)] bg-[var(--l-card)] py-1.5 pr-3.5 pl-2.5 font-mono text-[12.5px] text-[var(--l-body)]">
                            <span className="size-2 rounded-full bg-[var(--l-dot)]" />
                            {t('Monitoring for Debian and Ubuntu servers')}
                        </p>
                        <h1 className="mb-6 text-[clamp(2.3rem,4.4vw,3.7rem)] leading-[1.04] font-semibold tracking-[-0.045em]">
                            {t('Linux server monitoring')}
                            <br />
                            <span className="text-[var(--l-accent)]">
                                {t('without open ports.')}
                            </span>
                        </h1>
                        <p className="mb-8 max-w-[500px] text-[19px] leading-normal text-[var(--l-body)]">
                            {t(
                                'You hear about a problem before your customers do. One calm overview of all your servers, and an alert the moment something goes wrong.',
                            )}
                        </p>
                        <div className="mb-7 flex flex-wrap gap-2.5">
                            {signedIn ? (
                                <Link
                                    href={dashboard()}
                                    className={cn(
                                        primary,
                                        'bg-[var(--l-accent)] text-white shadow-[0_8px_20px_-10px_var(--l-accent)] dark:text-[#04130c]',
                                    )}
                                >
                                    {t('Dashboard')}
                                </Link>
                            ) : (
                                canRegister && (
                                    <Link
                                        href={register()}
                                        className={cn(
                                            primary,
                                            'bg-[var(--l-accent)] text-white shadow-[0_8px_20px_-10px_var(--l-accent)] dark:text-[#04130c]',
                                        )}
                                    >
                                        {t('Create account')}
                                    </Link>
                                )
                            )}
                            <a
                                href="#how"
                                className={cn(
                                    primary,
                                    'border border-[var(--l-border)] bg-[var(--l-card)] hover:border-[var(--l-muted)]',
                                )}
                            >
                                {t('How it works')}
                            </a>
                        </div>
                        <div className="inline-flex max-w-full items-center gap-3 overflow-x-auto rounded-xl border border-[var(--l-border)] bg-[var(--l-card)] px-4 py-2.5 font-mono text-sm whitespace-nowrap">
                            <span className="text-[var(--l-accent)]">$</span>
                            sudo apt install rackatlas-agent
                        </div>
                    </div>

                    {/* the product */}
                    <div
                        className="min-w-0 flex-[1_1_540px]"
                        aria-hidden="true"
                    >
                        <div className="overflow-hidden rounded-2xl border border-[var(--l-border)] bg-[var(--l-card)] shadow-[0_40px_90px_-40px_rgba(15,25,20,0.4)]">
                            <div className="flex items-center gap-2 border-b border-[var(--l-border)] bg-[var(--l-soft)] px-4 py-3">
                                <span className="size-2.5 rounded-full bg-[var(--l-border)]" />
                                <span className="size-2.5 rounded-full bg-[var(--l-border)]" />
                                <span className="size-2.5 rounded-full bg-[var(--l-border)]" />
                                <span className="ml-3 font-mono text-xs text-[var(--l-muted)]">
                                    rackatlas.dev/app
                                </span>
                            </div>
                            <div className="flex min-h-[400px]">
                                <div className="hidden w-[150px] shrink-0 flex-col gap-1 border-r border-[var(--l-border)] bg-[var(--l-soft)] p-3 text-[13px] sm:flex">
                                    <div className="flex items-center gap-2 px-2 pb-3.5 font-semibold">
                                        <Mark className="size-[18px]" />
                                        RackAtlas
                                    </div>
                                    <div className="rounded-lg bg-[var(--l-border)] px-2.5 py-1.5 font-medium">
                                        {t('Dashboard')}
                                    </div>
                                    <div className="px-2.5 py-1.5 text-[var(--l-muted)]">
                                        {t('Servers')}
                                    </div>
                                    <div className="px-2.5 py-1.5 text-[var(--l-muted)]">
                                        {t('Metrics')}
                                    </div>
                                    <div className="px-2.5 py-1.5 text-[var(--l-muted)]">
                                        {t('Logs')}
                                    </div>
                                    <div className="px-2.5 py-1.5 text-[var(--l-muted)]">
                                        {t('SSH keys')}
                                    </div>
                                </div>
                                <div className="min-w-0 flex-1 p-4 sm:p-5">
                                    <p className="mb-3 text-[15px] font-semibold">
                                        {t('Dashboard')}
                                    </p>
                                    <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        {[
                                            [t('Servers'), '5', ''],
                                            [
                                                t('Healthy'),
                                                '3',
                                                'text-emerald-600 dark:text-emerald-400',
                                            ],
                                            [
                                                t('Warnings'),
                                                '1',
                                                'text-amber-600 dark:text-amber-400',
                                            ],
                                            [
                                                t('Critical'),
                                                '1',
                                                'text-red-600 dark:text-red-400',
                                            ],
                                        ].map(([label, value, tone]) => (
                                            <div
                                                key={label}
                                                className="rounded-lg border border-[var(--l-border)] px-3 py-2"
                                            >
                                                <p className="text-[11px] text-[var(--l-muted)]">
                                                    {label}
                                                </p>
                                                <p
                                                    className={cn(
                                                        'text-xl leading-tight font-semibold',
                                                        tone,
                                                    )}
                                                >
                                                    {value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="grid gap-2.5 sm:grid-cols-2">
                                        <ServerCard
                                            name="web-1"
                                            meters={[
                                                { label: 'CPU', value: 34 },
                                                { label: 'RAM', value: 52 },
                                                { label: t('Disk'), value: 46 },
                                            ]}
                                        />
                                        <ServerCard
                                            name="db-1"
                                            meters={[
                                                { label: 'CPU', value: 61 },
                                                { label: 'RAM', value: 78 },
                                                { label: t('Disk'), value: 63 },
                                            ]}
                                        />
                                        <ServerCard
                                            name="backup-1"
                                            state="warn"
                                            meters={[
                                                { label: 'CPU', value: 12 },
                                                { label: 'RAM', value: 41 },
                                                {
                                                    label: t('Disk'),
                                                    value: 91,
                                                    tone: 'warn',
                                                },
                                            ]}
                                        />
                                        <div className="rounded-xl border border-[var(--l-bad-border)] bg-[var(--l-bad-bg)] p-3">
                                            <p className="mb-2 flex items-center gap-2 text-[13px] font-semibold">
                                                <span className="size-2 rounded-full bg-red-500" />
                                                ci-1
                                            </p>
                                            <p className="text-xs text-red-700 dark:text-red-300">
                                                {t(
                                                    'Offline. No data for 5 min.',
                                                )}
                                            </p>
                                            <p className="mt-2 font-mono text-[11px] text-[var(--l-muted)]">
                                                {t('last report :time', {
                                                    time: '18:37',
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="mt-3 font-mono text-[10.5px] text-[var(--l-muted)]">
                                        {t('Sample data')}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <p className="mx-auto flex max-w-[1240px] flex-wrap justify-center gap-x-7 gap-y-2 px-4 pt-9 pb-6 font-mono text-[13px] text-[var(--l-muted)] sm:px-8">
                    <span>Debian</span>
                    <span>Ubuntu</span>
                    <span>systemd</span>
                    <span>HTTPS</span>
                    <span>{t('agent without root rights')}</span>
                </p>

                {/* features */}
                <section
                    id="features"
                    className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-[72px] pb-10 sm:px-8"
                >
                    <h2 className="mb-3.5 max-w-[700px] text-[clamp(2rem,4vw,3.25rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
                        {t(
                            'Everything that matters for server health. Nothing else.',
                        )}
                    </h2>
                    <p className="mb-11 max-w-[560px] text-lg text-[var(--l-body)]">
                        {t(
                            'RackAtlas answers one question first: is everything fine? The details are one click away.',
                        )}
                    </p>

                    <div className="grid gap-4 lg:grid-cols-6">
                        <Tile className="flex flex-wrap items-center gap-6 lg:col-span-4">
                            <div className="min-w-0 flex-[1_1_220px]">
                                <Eyebrow>{t('Disks')}</Eyebrow>
                                <h3 className="mb-2.5 text-2xl leading-tight font-semibold tracking-[-0.03em]">
                                    {t('Know when a disk will fill up')}
                                </h3>
                                <p className="text-[15px] text-[var(--l-body)]">
                                    {t(
                                        'RackAtlas warns you before a disk runs out of space.',
                                    )}
                                </p>
                            </div>
                            <div className="min-w-0 flex-[1_1_280px]">
                                <svg
                                    viewBox="0 0 320 150"
                                    role="img"
                                    aria-label={t(
                                        'Disk growth with a forecast',
                                    )}
                                    className="block h-auto w-full"
                                >
                                    <g stroke="var(--l-border)" strokeWidth="1">
                                        <path d="M0 30H320M0 75H320M0 120H320" />
                                    </g>
                                    <line
                                        x1="0"
                                        y1="14"
                                        x2="320"
                                        y2="14"
                                        stroke="#e5534b"
                                        strokeWidth="1"
                                        strokeDasharray="4 4"
                                    />
                                    <text
                                        x="4"
                                        y="10"
                                        fontFamily="ui-monospace, monospace"
                                        fontSize="9"
                                        fill="#e5534b"
                                    >
                                        100 %
                                    </text>
                                    <path
                                        d="M0 122L40 118L80 112L120 104L160 98L200 90"
                                        fill="none"
                                        stroke="var(--l-accent)"
                                        strokeWidth="2.2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                    <path
                                        d="M200 90L240 72L280 52L312 14"
                                        fill="none"
                                        stroke="var(--l-accent)"
                                        strokeWidth="2"
                                        strokeDasharray="4 5"
                                        strokeLinecap="round"
                                    />
                                    <circle
                                        cx="200"
                                        cy="90"
                                        r="4.5"
                                        fill="var(--l-accent)"
                                    />
                                    <circle
                                        cx="312"
                                        cy="14"
                                        r="4"
                                        fill="var(--l-card)"
                                        stroke="#e5534b"
                                        strokeWidth="2"
                                    />
                                    <text
                                        x="206"
                                        y="112"
                                        fontFamily="ui-monospace, monospace"
                                        fontSize="9.5"
                                        fill="var(--l-body)"
                                    >
                                        {t('now')}
                                    </text>
                                    <text
                                        x="196"
                                        y="140"
                                        fontFamily="ui-monospace, monospace"
                                        fontSize="9.5"
                                        fill="var(--l-body)"
                                    >
                                        {t('full in about :days days', {
                                            days: 27,
                                        })}
                                    </text>
                                </svg>
                            </div>
                        </Tile>

                        <Tile dark className="lg:col-span-2">
                            <Eyebrow className="text-emerald-300">
                                {t('Notifications')}
                            </Eyebrow>
                            <h3 className="mb-4 text-2xl leading-tight font-semibold tracking-[-0.03em]">
                                {t('Push notifications on your phone')}
                            </h3>
                            <div className="flex items-start gap-2.5 rounded-2xl border border-white/10 bg-white/[0.06] p-3">
                                <Mark className="size-[26px] shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-[13.5px] font-semibold">
                                        {t(':server: high CPU usage', {
                                            server: 'web-1',
                                        })}
                                    </p>
                                    <p className="mt-0.5 text-[12.5px] text-white/65">
                                        {t(
                                            'CPU usage is :value% (limit :limit%).',
                                            { value: 98, limit: 95 },
                                        )}
                                    </p>
                                </div>
                            </div>
                        </Tile>

                        <Tile className="lg:col-span-2">
                            <Eyebrow>{t('Agent')}</Eyebrow>
                            <h3 className="mb-3.5 text-2xl leading-tight font-semibold tracking-[-0.03em]">
                                {t('Easy to install')}
                            </h3>
                            <div className="mb-3 overflow-x-auto rounded-xl bg-[var(--l-soft)] px-3.5 py-3 font-mono text-[12.5px] whitespace-nowrap">
                                sudo apt install rackatlas-agent
                            </div>
                            <p className="text-[15px] text-[var(--l-body)]">
                                {t(
                                    'One command on the server and the data starts flowing. Updates are just as simple.',
                                )}
                            </p>
                        </Tile>

                        <Tile className="lg:col-span-2">
                            <Eyebrow>{t('Devices')}</Eyebrow>
                            <h3 className="mb-3.5 text-2xl leading-tight font-semibold tracking-[-0.03em]">
                                {t('A separate layout per device')}
                            </h3>
                            <div
                                className="mb-3 flex items-end gap-2.5"
                                aria-hidden="true"
                            >
                                <div className="flex-1 rounded-lg border border-[var(--l-border)] p-2">
                                    <div className="mb-1 grid grid-cols-3 gap-1">
                                        <div className="h-4 rounded-[3px] bg-[var(--l-soft)]" />
                                        <div className="h-4 rounded-[3px] bg-[var(--l-soft)]" />
                                        <div className="h-4 rounded-[3px] bg-[var(--l-soft)]" />
                                    </div>
                                    <div className="h-[30px] rounded-[3px] bg-[var(--l-soft)]" />
                                </div>
                                <div className="w-[54px] shrink-0 rounded-[10px] border border-[var(--l-border)] p-1.5">
                                    <div className="mb-1 h-3.5 rounded-[3px] bg-amber-300/80" />
                                    <div className="h-[30px] rounded-[3px] bg-[var(--l-soft)]" />
                                </div>
                            </div>
                            <p className="text-[15px] text-[var(--l-body)]">
                                {t('Each device shows what you need on it.')}
                            </p>
                        </Tile>

                        <Tile className="lg:col-span-2">
                            <Eyebrow>{t('Logs')}</Eyebrow>
                            <h3 className="mb-3.5 text-2xl leading-tight font-semibold tracking-[-0.03em]">
                                {t('Only what needs attention')}
                            </h3>
                            <div className="mb-3 space-y-1.5 font-mono text-xs">
                                <p className="flex items-center gap-2 text-[var(--l-body)]">
                                    <span className="size-[7px] shrink-0 rounded-full bg-red-500" />
                                    kernel · Out of memory
                                </p>
                                <p className="flex items-center gap-2 text-[var(--l-muted)]">
                                    <span className="size-[7px] shrink-0 rounded-full bg-[var(--l-dot)]" />
                                    nginx.service · {t('resolved')}
                                </p>
                            </div>
                            <p className="text-[15px] text-[var(--l-body)]">
                                {t(
                                    'Problems you have dealt with disappear on their own.',
                                )}
                            </p>
                        </Tile>
                    </div>
                </section>

                {/* steps */}
                <section
                    id="how"
                    className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-20 pb-10 sm:px-8"
                >
                    <h2 className="mb-11 max-w-[620px] text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
                        {t('From sign-up to the first data in minutes')}
                    </h2>
                    <div className="grid gap-10 md:grid-cols-3 md:gap-12">
                        {[
                            [
                                '01',
                                t('Add a server'),
                                t('Pick a name and copy the command.'),
                            ],
                            [
                                '02',
                                t('Run it on the server'),
                                t('Paste it into the terminal on your server.'),
                            ],
                            [
                                '03',
                                t('See the data'),
                                t(
                                    'The server appears on the dashboard within a minute.',
                                ),
                            ],
                        ].map(([number, title, text], index) => (
                            <div key={number}>
                                <p className="mb-3.5 font-mono text-[13px] text-[var(--l-accent)]">
                                    {number}
                                </p>
                                <div
                                    className={cn(
                                        'mb-[18px] h-px',
                                        index === 2
                                            ? 'bg-[var(--l-accent)]'
                                            : 'bg-[var(--l-border)]',
                                    )}
                                />
                                <h3 className="mb-1.5 text-[19px] font-semibold">
                                    {title}
                                </h3>
                                <p className="text-[15.5px] text-[var(--l-body)]">
                                    {text}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* faq */}
                <section
                    id="faq"
                    className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-20 pb-10 sm:px-8"
                >
                    <h2 className="mb-11 max-w-[620px] text-[clamp(1.9rem,3.6vw,2.9rem)] leading-[1.05] font-semibold tracking-[-0.04em]">
                        {t('Frequently asked questions')}
                    </h2>
                    <dl className="grid gap-x-12 gap-y-9 md:grid-cols-2">
                        {faq.map(([question, answer]) => (
                            <div key={question}>
                                <dt className="mb-1.5 text-[19px] font-semibold">
                                    {question}
                                </dt>
                                <dd className="text-[15.5px] text-[var(--l-body)]">
                                    {answer}
                                </dd>
                            </div>
                        ))}
                    </dl>
                </section>

                {/* call to action */}
                <section
                    id="start"
                    className="mx-auto max-w-[1240px] scroll-mt-24 px-4 pt-[72px] pb-[88px] sm:px-8"
                >
                    <div className="flex flex-wrap items-center justify-between gap-8 rounded-[28px] bg-[#0e1110] p-8 text-white sm:p-12 dark:border dark:border-[var(--l-border)] dark:bg-[var(--l-soft)]">
                        <div className="min-w-0 flex-[1_1_420px]">
                            <h2 className="mb-3 text-[clamp(1.9rem,3.8vw,3.1rem)] leading-[1.04] font-semibold tracking-[-0.04em]">
                                {t('Start with one server')}
                            </h2>
                            <p className="max-w-[480px] text-[17px] text-white/65">
                                {t(
                                    'Registration is open and setup takes a few minutes.',
                                )}
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {signedIn ? (
                                <Link
                                    href={dashboard()}
                                    className={cn(
                                        primary,
                                        'bg-white text-[#0e1110]',
                                    )}
                                >
                                    {t('Dashboard')}
                                </Link>
                            ) : (
                                <>
                                    {canRegister && (
                                        <Link
                                            href={register()}
                                            className={cn(
                                                primary,
                                                'bg-white text-[#0e1110]',
                                            )}
                                        >
                                            {t('Create account')}
                                        </Link>
                                    )}
                                    <Link
                                        href={login()}
                                        className={cn(
                                            primary,
                                            'border border-white/25 text-white hover:border-white/60',
                                        )}
                                    >
                                        {t('Log in')}
                                    </Link>
                                </>
                            )}
                        </div>
                        <div className="flex w-full gap-1.5" aria-hidden="true">
                            {[
                                'bg-[#2fbf7f]',
                                'bg-[#2fbf7f]',
                                'bg-[#2fbf7f]',
                                'bg-[#e8a020]',
                                'bg-[#2fbf7f]',
                                'bg-white/15',
                            ].map((color, index) => (
                                <span
                                    key={index}
                                    className={cn(
                                        'h-1 flex-1 rounded-full',
                                        color,
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </section>

                <footer className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 pb-9 text-sm text-[var(--l-muted)] sm:px-8">
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
                        <span>© {new Date().getFullYear()} RackAtlas</span>
                        <Link
                            href={privacy()}
                            className="underline-offset-4 hover:text-[var(--l-ink)] hover:underline"
                        >
                            {t('Privacy and cookies')}
                        </Link>
                        <button
                            type="button"
                            onClick={openCookieSettings}
                            className="underline-offset-4 hover:text-[var(--l-ink)] hover:underline"
                        >
                            {t('Cookie settings')}
                        </button>
                    </div>
                    <div
                        className="flex items-center gap-1 font-mono"
                        role="group"
                        aria-label={t('Language')}
                    >
                        {Object.keys(locales).map((code) => (
                            <button
                                key={code}
                                type="button"
                                aria-pressed={code === locale}
                                onClick={() =>
                                    router.put(
                                        LanguageController.update.url(),
                                        {
                                            locale: code,
                                            remember:
                                                consent?.preferences === true,
                                        },
                                        { preserveScroll: true },
                                    )
                                }
                                className={cn(
                                    'rounded-md px-2 py-1 uppercase transition-colors',
                                    code === locale
                                        ? 'bg-[var(--l-soft)] font-medium text-[var(--l-ink)]'
                                        : 'hover:text-[var(--l-ink)]',
                                )}
                            >
                                {code}
                            </button>
                        ))}
                    </div>
                </footer>
            </div>
        </>
    );
}
