import { Head, Link, router, usePoll } from '@inertiajs/react';
import {
    KeyRound,
    Lock,
    Pencil,
    Plus,
    Radio,
    Server,
    Tags,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import ServerController from '@/actions/App/Http/Controllers/Servers/ServerController';
import CategoryManager from '@/components/servers/category-manager';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { serverAddress } from '@/lib/server-address';
import { cn } from '@/lib/utils';
import { dotClass } from '@/lib/server-colors';
import { index as teamsIndex } from '@/routes/teams';
import { index } from '@/routes/servers';
import type { ServerCategory, ServerSummary } from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    categories: ServerCategory[];
    colors: string[];
    servers: ServerSummary[];
};

const ALL = 'all';
const NONE = 'none';

const statusDot: Record<string, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    unknown: 'bg-zinc-400',
};

function usageClass(percent: number): string {
    if (percent >= 90) {
        return 'text-red-600 dark:text-red-400';
    }

    if (percent >= 75) {
        return 'text-amber-600 dark:text-amber-400';
    }

    return 'text-muted-foreground';
}

function ServerRow({
    server,
    canManage,
}: {
    server: ServerSummary;
    canManage: boolean;
}) {
    const { t } = useTranslation();

    const statusLabel = {
        online: t('Online'),
        offline: t('Offline'),
        unknown: t('Not checked yet'),
    }[server.status];

    return (
        <li className="flex items-center gap-4 rounded-xl border bg-card p-4">
            <div className="relative flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Server className="size-5 text-muted-foreground" />
                <span
                    title={statusLabel}
                    className={cn(
                        'absolute -top-0.5 -right-0.5 size-3 rounded-full ring-2 ring-background',
                        statusDot[server.status],
                    )}
                >
                    <span className="sr-only">{statusLabel}</span>
                </span>
            </div>
            <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{server.name}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">
                    {serverAddress(server, t('Agent'))}
                </p>
                {server.metrics ? (
                    <p className="mt-1 flex flex-wrap gap-x-3 font-mono text-xs">
                        <span
                            className={usageClass(server.metrics.cpu_percent)}
                        >
                            CPU {Math.round(server.metrics.cpu_percent)}%
                        </span>
                        <span
                            className={usageClass(
                                server.metrics.memory_percent,
                            )}
                        >
                            RAM {Math.round(server.metrics.memory_percent)}%
                        </span>
                        <span
                            className={usageClass(server.metrics.disk_percent)}
                        >
                            {t('Disk')}{' '}
                            {Math.round(server.metrics.disk_percent)}%
                        </span>
                        <span className="text-muted-foreground">
                            {server.metrics.collected}
                        </span>
                    </p>
                ) : (
                    <p className="mt-1 text-xs text-muted-foreground">
                        {server.last_checked
                            ? t('No metrics yet. Last check :time.', {
                                  time: server.last_checked,
                              })
                            : t('Waiting for the first check…')}
                    </p>
                )}
            </div>
            <span className="hidden items-center gap-1.5 rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground ring-1 ring-border ring-inset sm:inline-flex">
                {server.auth_type === 'agent' ? (
                    <>
                        <Radio className="size-3" />
                        {server.agent_version
                            ? t('Agent :version', {
                                  version: server.agent_version,
                              })
                            : t('Agent')}
                    </>
                ) : server.auth_type === 'key' ? (
                    <>
                        <KeyRound className="size-3" />
                        {server.ssh_key_name}
                    </>
                ) : (
                    <>
                        <Lock className="size-3" />
                        {t('Password')}
                    </>
                )}
            </span>
            {canManage && (
                <div className="flex gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 md:size-9"
                        asChild
                    >
                        <Link
                            href={ServerController.edit(server.id)}
                            aria-label={t('Edit :name', { name: server.name })}
                        >
                            <Pencil className="size-4" />
                        </Link>
                    </Button>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 md:size-9"
                        aria-label={t('Delete :name', { name: server.name })}
                        onClick={() => {
                            if (
                                window.confirm(
                                    t('Delete the server :name?', {
                                        name: server.name,
                                    }),
                                )
                            ) {
                                router.delete(
                                    ServerController.destroy.url(server.id),
                                );
                            }
                        }}
                    >
                        <Trash2 className="size-4" />
                    </Button>
                </div>
            )}
        </li>
    );
}

export default function Servers({
    team,
    canManage,
    categories,
    colors,
    servers,
}: Props) {
    const { t } = useTranslation();
    const [filter, setFilter] = useState<string>(ALL);

    usePoll(30000, { only: ['servers'] });

    if (!team) {
        return (
            <>
                <Head title={t('Servers')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-muted">
                        <Server className="size-7 text-muted-foreground" />
                    </div>
                    <h1 className="text-xl font-semibold">
                        {t('Create a team first')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'Servers belong to a team, so you need one before you can add servers.',
                        )}
                    </p>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const groups = [
        ...categories.map((category) => ({
            key: String(category.id),
            category,
            items: servers.filter((s) => s.server_category_id === category.id),
        })),
        {
            key: NONE,
            category: null,
            items: servers.filter((s) => s.server_category_id === null),
        },
    ].filter(
        (group) =>
            group.items.length > 0 && (filter === ALL || filter === group.key),
    );

    return (
        <>
            <Head title={t('Servers')} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Servers')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Servers of the team :team', {
                                team: team.name,
                            })}
                        </p>
                    </div>
                    {canManage && (
                        <div className="flex gap-2">
                            <CategoryManager
                                categories={categories}
                                colors={colors}
                                trigger={
                                    <Button variant="outline">
                                        <Tags className="size-4" />
                                        {t('Categories')}
                                    </Button>
                                }
                            />
                            <Button asChild data-test="add-server-button">
                                <Link href={ServerController.create()}>
                                    <Plus className="size-4" />
                                    {t('Add server')}
                                </Link>
                            </Button>
                        </div>
                    )}
                </div>

                {servers.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <Server className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{t('No servers yet')}</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                'Add your first server. It takes less than a minute.',
                            )}
                        </p>
                        {canManage && (
                            <Button asChild className="mt-4">
                                <Link href={ServerController.create()}>
                                    <Plus className="size-4" />
                                    {t('Add server')}
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        {categories.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { key: ALL, label: t('All'), color: null },
                                    ...categories.map((c) => ({
                                        key: String(c.id),
                                        label: c.name,
                                        color: c.color,
                                    })),
                                    {
                                        key: NONE,
                                        label: t('No category'),
                                        color: null,
                                    },
                                ].map((chip) => (
                                    <button
                                        key={chip.key}
                                        type="button"
                                        onClick={() => setFilter(chip.key)}
                                        className={cn(
                                            'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-colors',
                                            filter === chip.key
                                                ? 'border-primary bg-primary/10 font-medium'
                                                : 'text-muted-foreground hover:bg-muted',
                                        )}
                                    >
                                        {chip.color && (
                                            <span
                                                className={cn(
                                                    'size-2 rounded-full',
                                                    dotClass(chip.color),
                                                )}
                                            />
                                        )}
                                        {chip.label}
                                    </button>
                                ))}
                            </div>
                        )}

                        <div className="space-y-6">
                            {groups.map((group) => (
                                <section key={group.key} className="space-y-2">
                                    <h2 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                                        {group.category && (
                                            <span
                                                className={cn(
                                                    'size-2 rounded-full',
                                                    dotClass(
                                                        group.category.color,
                                                    ),
                                                )}
                                            />
                                        )}
                                        {group.category?.name ??
                                            t('No category')}
                                        <span className="text-xs">
                                            {group.items.length}
                                        </span>
                                    </h2>
                                    <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                                        {group.items.map((server) => (
                                            <ServerRow
                                                key={server.id}
                                                server={server}
                                                canManage={canManage}
                                            />
                                        ))}
                                    </ul>
                                </section>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
}

Servers.layout = {
    breadcrumbs: [{ title: 'Servers', href: index() }],
};
