import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    DatabaseBackup,
    KeyRound,
    LayoutGrid,
    Map as MapIcon,
    Map,
    ScrollText,
    Server,
    Shield,
    SquareTerminal,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard, map as mapRoute, terminal } from '@/routes';
import { index as adminIndex } from '@/routes/admin';
import { index as backupsIndex } from '@/routes/backups';
import { index as logsIndex } from '@/routes/logs';
import { index as metricsIndex } from '@/routes/metrics';
import { index as serversIndex } from '@/routes/servers';
import { index as sshKeysIndex } from '@/routes/ssh-keys';
import type { Auth, NavItem } from '@/types';

declare const __APP_VERSION__: string;

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Servers',
        href: serversIndex(),
        icon: Server,
    },
    {
        title: 'Map',
        href: mapRoute(),
        icon: MapIcon,
    },
    {
        title: 'Terminal',
        href: terminal(),
        icon: SquareTerminal,
    },
    {
        title: 'Metrics',
        href: metricsIndex(),
        icon: Activity,
    },
    {
        title: 'Logs',
        href: logsIndex(),
        icon: ScrollText,
    },
    {
        title: 'Backups',
        href: backupsIndex(),
        icon: DatabaseBackup,
    },
    {
        title: 'SSH keys',
        href: sshKeysIndex(),
        icon: KeyRound,
    },
];

export function AppSidebar() {
    const { props, url } = usePage<{ auth: Auth }>();

    const items = props.auth.user.is_admin
        ? [
              ...mainNavItems,
              {
                  title: 'Administration',
                  href: adminIndex(),
                  icon: Shield,
                  isActive: url.startsWith('/app/admin'),
              },
          ]
        : mainNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader className="p-3 pb-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="pt-2">
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter className="gap-2 p-3">
                <NavUser />
                <p className="px-2 text-center text-xs text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                    v{__APP_VERSION__}
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}
