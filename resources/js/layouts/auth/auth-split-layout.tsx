import { Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { login } from '@/routes';
import type { AuthLayoutProps } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

const tiles = [
    'ok', 'ok', 'ok', 'ok', 'ok',
    'ok', 'warn', 'ok', 'ok', 'ok',
    'ok', 'ok', 'ok', 'bad', 'ok',
];

const tileColor = {
    ok: 'bg-emerald-400/80',
    warn: 'bg-amber-400/90',
    bad: 'bg-red-500/90',
} as const;

export default function AuthSplitLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    const { name } = usePage().props;
    const { t } = useTranslation();

    return (
        <div className="relative grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
            <div className="relative hidden flex-col justify-between overflow-hidden bg-zinc-950 p-12 text-white lg:flex">
                <div
                    aria-hidden
                    className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:48px_48px]"
                />
                <div
                    aria-hidden
                    className="absolute -top-40 -left-40 size-[32rem] rounded-full bg-emerald-500/20 blur-3xl"
                />

                <Link
                    href={login()}
                    className="relative z-10 flex items-center gap-3 text-lg font-semibold tracking-tight"
                >
                    <span className="flex size-9 items-center justify-center rounded-lg bg-emerald-600">
                        <AppLogoIcon
                            className="size-5 fill-white"
                            style={{ '--logo-dot': '#059669' } as React.CSSProperties}
                        />
                    </span>
                    {name}
                </Link>

                <div className="relative z-10 max-w-md space-y-8">
                    <div className="grid grid-cols-5 gap-3">
                        {tiles.map((status, i) => (
                            <div
                                key={i}
                                className="flex aspect-[4/3] items-end rounded-md border border-white/10 bg-white/5 p-2"
                            >
                                <span
                                    className={`h-1.5 w-full rounded-full ${tileColor[status as keyof typeof tileColor]}`}
                                />
                            </div>
                        ))}
                    </div>
                    <div className="space-y-3">
                        <h2 className="text-3xl leading-tight font-semibold tracking-tight">
                            {t('All your servers.')}
                            <br />
                            {t('One screen.')}
                        </h2>
                        <p className="text-sm text-zinc-400">
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

            <div className="flex items-center justify-center px-6 py-12 sm:px-10">
                <div className="flex w-full max-w-sm flex-col gap-8">
                    <Link
                        href={login()}
                        className="flex items-center gap-2.5 font-semibold tracking-tight lg:hidden"
                    >
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
                            <AppLogoIcon
                                className="size-4.5 fill-primary-foreground"
                                style={{ '--logo-dot': 'var(--primary)' } as React.CSSProperties}
                            />
                        </span>
                        {name}
                    </Link>
                    <div className="space-y-1.5">
                        <h1 className="text-2xl font-semibold tracking-tight">
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
    );
}
