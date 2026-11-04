import { usePage } from '@inertiajs/react';

import AppLogoIcon from '@/components/app-logo-icon';

export default function AppLogo() {
    const { name } = usePage().props;

    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-sidebar-primary text-sidebar-primary-foreground shadow-sm">
                <AppLogoIcon
                    className="size-5 fill-current text-sidebar-primary-foreground"
                    style={
                        {
                            '--logo-dot': 'var(--sidebar-primary)',
                        } as React.CSSProperties
                    }
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="truncate text-base leading-tight font-semibold tracking-tight">
                    {name}
                </span>
            </div>
        </>
    );
}
