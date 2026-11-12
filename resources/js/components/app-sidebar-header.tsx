import { Link } from '@inertiajs/react';
import { ChevronLeft } from 'lucide-react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import { TeamSwitcher } from '@/components/team-switcher';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useTranslation } from '@/hooks/use-translation';
import { haptic } from '@/lib/native';
import type { BreadcrumbItem as BreadcrumbItemType } from '@/types';

/** Title bar of the mobile shell: frosted glass under the status bar, a back button, the page title. */
function NativeTopBar({ breadcrumbs }: { breadcrumbs: BreadcrumbItemType[] }) {
    const { t } = useTranslation();
    const title = breadcrumbs.at(-1)?.title;
    const parent = breadcrumbs.length > 1 ? breadcrumbs.at(-2) : undefined;

    return (
        <header className="sticky top-0 z-20 hidden shrink-0 border-b border-border/40 bg-background/70 pt-[env(safe-area-inset-top)] backdrop-blur-2xl backdrop-saturate-150 native:block">
            <div className="relative flex h-11 items-center justify-between px-2">
                <div className="flex min-w-0 basis-1/4 items-center">
                    {parent && (
                        <Link
                            href={parent.href}
                            onClick={() => haptic()}
                            data-native-press
                            className="-ml-1 flex min-w-0 items-center text-primary"
                        >
                            <ChevronLeft className="size-7 shrink-0" />
                            <span className="truncate text-[15px]">
                                {t(parent.title)}
                            </span>
                        </Link>
                    )}
                </div>
                <h1 className="pointer-events-none absolute inset-x-1/4 truncate text-center text-[17px] leading-none font-semibold">
                    {title ? t(title) : ''}
                </h1>
                <div className="flex min-w-0 basis-1/4 justify-end">
                    <TeamSwitcher />
                </div>
            </div>
        </header>
    );
}

export function AppSidebarHeader({
    breadcrumbs = [],
}: {
    breadcrumbs?: BreadcrumbItemType[];
}) {
    return (
        <>
            <NativeTopBar breadcrumbs={breadcrumbs} />
            <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-2 border-b border-sidebar-border/50 bg-background/95 px-4 backdrop-blur transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 native:hidden md:h-16 md:px-4">
                <div className="flex min-w-0 shrink items-center gap-2">
                    <SidebarTrigger className="-ml-1" />
                    <Breadcrumbs breadcrumbs={breadcrumbs} />
                </div>
                <div className="ml-auto min-w-0 shrink-0">
                    <TeamSwitcher />
                </div>
            </header>
        </>
    );
}
