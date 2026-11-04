import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
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
            <SidebarHeader>
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

            <SidebarContent>
                <NavMain items={items} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
                <p className="px-2 text-center text-xs text-muted-foreground/70 group-data-[collapsible=icon]:hidden">
                    v{__APP_VERSION__}
                </p>
            </SidebarFooter>
        </Sidebar>
    );
}
