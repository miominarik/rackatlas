import { Link, usePage } from '@inertiajs/react';
import {
    Activity,
    BookOpen,
    Database,
    DatabaseBackup,
    KeyRound,
    Layers,
    LayoutGrid,
    Map as MapIcon,
    Map,
    MemoryStick,
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
import { index as applicationsIndex } from '@/routes/applications';
import { index as backupsIndex } from '@/routes/backups';
import { index as databasesIndex } from '@/routes/databases';
import { index as documentsIndex } from '@/routes/documents';
import { index as logsIndex } from '@/routes/logs';
import { index as metricsIndex } from '@/routes/metrics';
import { index as redisIndex } from '@/routes/redis';
import { index as serversIndex } from '@/routes/servers';
import { index as sshKeysIndex } from '@/routes/ssh-keys';
import { usePermissions } from '@/hooks/use-permissions';
import type { Auth, NavItem } from '@/types';

declare const __APP_VERSION__: string;

const databaseNavItems: NavItem[] = [
    {
        title: 'MySQL',
        permission: 'databases.view',
        href: databasesIndex(),
        icon: Database,
    },
    {
        title: 'Redis',
        permission: 'redis.view',
        href: redisIndex(),
        icon: MemoryStick,
    },
];

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Servers',
        permission: 'servers.view',
        href: serversIndex(),
        icon: Server,
    },
    {
        title: 'Map',
        permission: 'map.view',
        href: mapRoute(),
        icon: MapIcon,
    },
    {
        title: 'Terminal',
        permission: 'terminal.edit',
        href: terminal(),
        icon: SquareTerminal,
    },
    {
        title: 'Applications',
        permission: 'applications.view',
        href: applicationsIndex(),
        icon: Layers,
    },
    {
        title: 'Metrics',
        permission: 'metrics.view',
        href: metricsIndex(),
        icon: Activity,
    },
    {
        title: 'Logs',
        permission: 'logs.view',
        href: logsIndex(),
        icon: ScrollText,
    },
    {
        title: 'Backups',
        permission: 'backups.view',
        href: backupsIndex(),
        icon: DatabaseBackup,
    },
    {
        title: 'SSH keys',
        permission: 'ssh_keys.view',
        href: sshKeysIndex(),
        icon: KeyRound,
    },
    {
        title: 'Documentation',
        permission: 'docs.view',
        href: documentsIndex(),
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { props, url } = usePage<{ auth: Auth }>();
    const { can } = usePermissions();

    const allowed = (items: NavItem[]) =>
        items.filter((item) => !item.permission || can(item.permission));
    const visibleItems = allowed(mainNavItems);
    const visibleDatabaseItems = allowed(databaseNavItems);

    const items = props.auth.user.is_admin
        ? [
              ...visibleItems,
              {
                  title: 'Administration',
                  href: adminIndex(),
                  icon: Shield,
                  isActive: url.startsWith('/app/admin'),
              },
          ]
        : visibleItems;

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
                {visibleDatabaseItems.length > 0 && (
                    <NavMain items={visibleDatabaseItems} label="Database" />
                )}
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
