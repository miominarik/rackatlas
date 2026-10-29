import { Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import AppLogoIcon from '@/components/app-logo-icon';
import LanguageController from '@/actions/App/Http/Controllers/Settings/LanguageController';
import { preferencesAllowed } from '@/hooks/use-privacy-choices';
import { cn } from '@/lib/utils';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

type Unit = {
    name: string;
    state: 'ok' | 'warn' | 'bad';
    cpu: number;
    ram: number;
};

// A rack of sample servers: the same picture the dashboard draws, so the sign-in page already shows the product.
const units: Unit[] = [
    { name: 'web-1', state: 'ok', cpu: 34, ram: 52 },
    { name: 'web-2', state: 'ok', cpu: 28, ram: 47 },
    { name: 'db-1', state: 'ok', cpu: 61, ram: 78 },
    { name: 'cache-1', state: 'ok', cpu: 12, ram: 33 },
    { name: 'backup-1', state: 'warn', cpu: 9, ram: 41 },
    { name: 'mail-1', state: 'ok', cpu: 18, ram: 36 },
    { name: 'proxy-1', state: 'ok', cpu: 22, ram: 29 },
    { name: 'ci-1', state: 'bad', cpu: 0, ram: 0 },
    { name: 'api-1', state: 'ok', cpu: 44, ram: 58 },
];

const dot = {
    ok: 'bg-emerald-400',
    warn: 'bg-amber-400',
    bad: 'bg-red-500',
} as const;

function LanguageLinks() {
    const { locales, locale } = usePage<{
        locales: Record<string, string>;
        locale: string;
    }>().props;

    return (
        <div
            className="flex items-center gap-0.5 text-xs"
            role="group"
            aria-label="Language"
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
                                remember: preferencesAllowed(),
                                silent: true,
                            },
                            { preserveScroll: true },
                        )
                    }
                    className={cn(
                        'rounded-md px-2 py-1 font-mono uppercase transition-colors',
                        code === locale
                            ? 'bg-muted font-medium text-foreground'
                            : 'text-muted-foreground hover:text-foreground',
                    )}
                >
                    {code}
                </button>
            ))}
        </div>
    );
}

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const { t } = useTranslation();

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-[#0e1110] p-12 text-white lg:flex">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:48px_48px]"
                />

                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-3 text-lg font-semibold tracking-tight"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-600">
                        <AppLogoIcon
                            className="size-5 fill-white"
                            style={
                                {
                                    '--logo-dot': '#059669',
                                } as React.CSSProperties
                            }
                        />
                    </span>
                    {name}
                </Link>

                <div className="relative z-10 max-w-lg space-y-9">
                    <div aria-hidden className="grid grid-cols-3 gap-3">
                        {units.map((unit) => (
                            <div
                                key={unit.name}
                                className={cn(
                                    'rounded-lg border border-l-[3px] bg-white/[0.04] p-3',
                                    unit.state === 'ok' &&
                                        'border-white/10 border-l-emerald-400',
                                    unit.state === 'warn' &&
                                        'border-white/10 border-l-amber-400',
                                    unit.state === 'bad' &&
                                        'border-red-500/30 border-l-red-500 bg-red-500/[0.07]',
                                )}
                            >
                                <p className="mb-2.5 flex items-center gap-2 font-mono text-[11px] text-zinc-300">
                                    <span
                                        className={cn(
                                            'size-1.5 rounded-full',
                                            dot[unit.state],
                                        )}
                                    />
                                    {unit.name}
                                </p>
                                {unit.state === 'bad' ? (
                                    <p className="font-mono text-[10px] text-red-300">
                                        offline
                                    </p>
                                ) : (
                                    <div className="space-y-1.5">
                                        {[unit.cpu, unit.ram].map(
                                            (value, index) => (
                                                <span
                                                    key={index}
                                                    className="block h-1 rounded-full bg-white/10"
                                                >
                                                    <span
                                                        className={cn(
                                                            'block h-1 rounded-full',
                                                            unit.state ===
                                                                'warn' &&
                                                                index === 1
                                                                ? 'bg-amber-400'
                                                                : 'bg-emerald-400/80',
                                                        )}
                                                        style={{
                                                            width: `${value}%`,
                                                        }}
                                                    />
                                                </span>
                                            ),
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-4xl leading-[1.05] font-semibold tracking-[-0.035em]">
                            {t('All your servers.')}
                            <br />
                            {t('One screen.')}
                        </h2>
                        <p className="max-w-sm text-[15px] leading-normal text-zinc-400">
                            {t(
                                'In 5 seconds you know whether everything is fine, without logging in to individual servers.',
                            )}
                        </p>
                    </div>
                </div>

                <p className="relative z-10 text-xs text-zinc-500">
                    © {new Date().getFullYear()} {name}
                </p>
            </div>

            <div className="flex flex-col px-6 py-6 sm:px-10">
                <div className="flex items-center justify-between">
                    <Link
                        href={home()}
                        className="flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" aria-hidden />
                        {t('Back to home')}
                    </Link>
                    <LanguageLinks />
                </div>
                <div className="flex flex-1 items-center justify-center py-10">
                    <div className="flex w-full max-w-sm flex-col gap-8">
                        <Link
                            href={home()}
                            className="flex items-center gap-2.5 font-semibold tracking-tight lg:hidden"
                        >
                            <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
                                <AppLogoIcon
                                    className="size-4.5 fill-primary-foreground"
                                    style={
                                        {
                                            '--logo-dot': 'var(--primary)',
                                        } as React.CSSProperties
                                    }
                                />
                            </span>
                            {name}
                        </Link>
                        <div className="space-y-1.5">
                            <h1 className="text-4xl leading-none font-semibold">
                                {t(title)}
                            </h1>
                            <p className="text-sm text-balance text-muted-foreground">
                                {t(description)}
                            </p>
                        </div>
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}
