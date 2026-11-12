import { ChevronDown, Search, X } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import ServerCard from '@/components/dashboard/server-card';
import ServerRow from '@/components/dashboard/server-row';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { levelRank } from '@/lib/dashboard';
import type { Evaluated } from '@/lib/dashboard';
import { dotClass } from '@/lib/server-colors';
import { cn } from '@/lib/utils';
import type {
    DashboardHistory,
    DashboardServer,
    DashboardSettings,
} from '@/types';

type Status = 'all' | 'attention' | 'healthy';

type Group = {
    key: string;
    category: DashboardServer['category'];
    items: Evaluated[];
};

const ALL = 'all';
const STORAGE_KEY = 'rackatlas.dashboard.servers';

/** Below this the filters would only be in the way. */
const FILTER_FROM = 8;

const needsAttention = (item: Evaluated) =>
    item.level !== 'ok' && item.level !== 'unknown';

function sortItems(
    items: Evaluated[],
    sort: DashboardSettings['servers']['sort'],
) {
    const by = {
        name: (a: Evaluated, b: Evaluated) =>
            a.server.name.localeCompare(b.server.name),
        status: (a: Evaluated, b: Evaluated) =>
            levelRank[b.level] - levelRank[a.level] ||
            a.server.name.localeCompare(b.server.name),
        cpu: (a: Evaluated, b: Evaluated) => (b.cpu ?? -1) - (a.cpu ?? -1),
        ram: (a: Evaluated, b: Evaluated) => (b.ram ?? -1) - (a.ram ?? -1),
        disk: (a: Evaluated, b: Evaluated) => (b.disk ?? -1) - (a.disk ?? -1),
    }[sort];

    return [...items].sort(by);
}

function readStored(): { compact: boolean; collapsed: string[] } {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');

        return {
            compact: stored.compact !== false,
            collapsed: Array.isArray(stored.collapsed) ? stored.collapsed : [],
        };
    } catch {
        return { compact: true, collapsed: [] };
    }
}

export default function ServerOverview({
    items,
    settings,
    history,
    generatedAt,
}: {
    items: Evaluated[];
    settings: DashboardSettings;
    history: DashboardHistory;
    generatedAt: string;
}) {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState<Status>('all');
    const [category, setCategory] = useState(ALL);
    const [compact, setCompact] = useState(true);
    const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

    useEffect(() => {
        const stored = readStored();
        setCompact(stored.compact);
        setCollapsed(new Set(stored.collapsed));
    }, []);

    const remember = (nextCompact: boolean, nextCollapsed: Set<string>) => {
        setCompact(nextCompact);
        setCollapsed(nextCollapsed);

        try {
            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    compact: nextCompact,
                    collapsed: [...nextCollapsed],
                }),
            );
        } catch {
            // The view still works, it is just not remembered.
        }
    };

    const categories = useMemo(
        () =>
            [
                ...new Map(
                    items
                        .filter((item) => item.server.category)
                        .map((item) => [
                            item.server.category!.id,
                            item.server.category!,
                        ]),
                ).values(),
            ].sort((a, b) => a.name.localeCompare(b.name)),
        [items],
    );

    const counts = {
        attention: items.filter(needsAttention).length,
        critical: items.filter(
            (item) => item.level === 'critical' || item.level === 'offline',
        ).length,
    };

    const showFilters = items.length > FILTER_FROM;
    const needle = query.trim().toLowerCase();
    const filtering = needle !== '' || status !== 'all' || category !== ALL;

    const filtered = items.filter((item) => {
        const { server } = item;

        if (status === 'attention' && !needsAttention(item)) {
            return false;
        }

        if (status === 'healthy' && needsAttention(item)) {
            return false;
        }

        if (
            category !== ALL &&
            String(server.category?.id ?? 'none') !== category
        ) {
            return false;
        }

        return (
            needle === '' ||
            [server.name, server.host ?? '', server.category?.name ?? '']
                .join(' ')
                .toLowerCase()
                .includes(needle)
        );
    });

    const sorted = sortItems(filtered, settings.servers.sort);
    const grouped = settings.servers.group_by_category;

    const groups: Group[] = grouped
        ? [
              ...categories
                  .map((cat) => ({
                      key: String(cat.id),
                      category: cat,
                      items: sorted.filter(
                          (item) => item.server.category?.id === cat.id,
                      ),
                  }))
                  .filter((group) => group.items.length > 0),
              ...(sorted.some((item) => !item.server.category)
                  ? [
                        {
                            key: 'none',
                            category: null,
                            items: sorted.filter(
                                (item) => !item.server.category,
                            ),
                        },
                    ]
                  : []),
          ]
        : [{ key: 'all', category: null, items: sorted }];

    const clearFilters = () => {
        setQuery('');
        setStatus('all');
        setCategory(ALL);
    };

    const toggleGroup = (key: string) => {
        const next = new Set(collapsed);

        if (!next.delete(key)) {
            next.add(key);
        }

        remember(compact, next);
    };

    const fixedColumns = (
        {
            1: 'grid-cols-1',
            2: 'grid-cols-1 sm:grid-cols-2',
            3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
            4: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4',
        } as Record<number, string>
    )[settings.servers.columns];

    const dense = settings.servers.density === 'compact';

    const grid = cn(
        'grid gap-4',
        fixedColumns ??
            (dense
                ? 'grid-cols-[repeat(auto-fill,minmax(14rem,1fr))] gap-3'
                : 'grid-cols-[repeat(auto-fill,minmax(17rem,1fr))]'),
        fixedColumns && dense && 'gap-3',
    );

    const cards = (list: Evaluated[]) => (
        <div className={grid}>
            {list.map((evaluated) => (
                <ServerCard
                    key={evaluated.server.id}
                    evaluated={evaluated}
                    settings={settings}
                    history={history[evaluated.server.id] ?? []}
                    generatedAt={generatedAt}
                />
            ))}
        </div>
    );

    const rows = (list: Evaluated[], twoColumns: boolean) => (
        <div className="overflow-hidden rounded-xl border bg-card">
            <ul
                className={cn(
                    '-mb-px grid',
                    twoColumns &&
                        'xl:grid-cols-2 xl:[&>li:nth-child(odd)]:border-r',
                )}
            >
                {list.map((evaluated) => (
                    <ServerRow
                        key={evaluated.server.id}
                        evaluated={evaluated}
                        settings={settings}
                        className="border-b"
                    />
                ))}
            </ul>
        </div>
    );

    const body = (list: Evaluated[]) => {
        if (settings.servers.layout === 'list') {
            return rows(list, false);
        }

        if (!compact) {
            return cards(list);
        }

        return rows(list, true);
    };

    return (
        <section aria-label={t('Server cards')} className="space-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h2 className="text-sm font-medium">
                    {t('Servers')}{' '}
                    <span className="text-muted-foreground">
                        {items.length}
                    </span>
                </h2>
                {counts.attention > 0 && (
                    <span
                        className={cn(
                            'text-xs font-medium',
                            counts.critical > 0
                                ? 'text-red-600 dark:text-red-400'
                                : 'text-amber-600 dark:text-amber-400',
                        )}
                    >
                        {t('Needs attention')}: {counts.attention}
                    </span>
                )}
            </div>

            {showFilters && (
                <div className="space-y-2 rounded-xl border bg-card p-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="relative min-w-48 flex-1 sm:max-w-sm">
                            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="search"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder={t('Search servers…')}
                                aria-label={t('Search servers…')}
                                className="pl-8"
                            />
                        </div>

                        {categories.length > 0 && (
                            <Select
                                value={category}
                                onValueChange={setCategory}
                            >
                                <SelectTrigger
                                    className="w-48"
                                    aria-label={t('Category')}
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value={ALL}>
                                        {t('All categories')}
                                    </SelectItem>
                                    {categories.map((cat) => (
                                        <SelectItem
                                            key={cat.id}
                                            value={String(cat.id)}
                                        >
                                            {cat.name}
                                        </SelectItem>
                                    ))}
                                    <SelectItem value="none">
                                        {t('No category')}
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        )}

                        {filtering && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                <X className="size-3.5" />
                                {t('Clear filters')}
                            </Button>
                        )}

                        <div className="ml-auto flex flex-wrap items-center gap-x-4 gap-y-2">
                            {settings.servers.layout === 'grid' && (
                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                    <Switch
                                        checked={compact}
                                        onCheckedChange={(value) =>
                                            remember(value, collapsed)
                                        }
                                    />
                                    {t('Compact view')}
                                </label>
                            )}
                            {grouped && groups.length > 1 && (
                                <button
                                    type="button"
                                    className="text-xs text-muted-foreground hover:text-foreground hover:underline"
                                    onClick={() =>
                                        remember(
                                            compact,
                                            collapsed.size === 0
                                                ? new Set(
                                                      groups.map((g) => g.key),
                                                  )
                                                : new Set(),
                                        )
                                    }
                                >
                                    {collapsed.size === 0
                                        ? t('Collapse all')
                                        : t('Expand all')}
                                </button>
                            )}
                        </div>
                    </div>

                    <div role="tablist" className="flex flex-wrap gap-1.5">
                        {(
                            [
                                ['all', t('All'), items.length],
                                ['attention', t('Problems'), counts.attention],
                                [
                                    'healthy',
                                    t('Healthy'),
                                    items.length - counts.attention,
                                ],
                            ] as [Status, string, number][]
                        ).map(([value, label, count]) => (
                            <button
                                key={value}
                                type="button"
                                role="tab"
                                aria-selected={status === value}
                                onClick={() => setStatus(value)}
                                className={cn(
                                    'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition-colors',
                                    status === value
                                        ? 'border-primary bg-primary text-primary-foreground'
                                        : 'hover:bg-muted',
                                )}
                            >
                                {label}
                                <span className="text-xs opacity-70">
                                    {count}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed p-10 text-center">
                    <p className="text-sm text-muted-foreground">
                        {t('No server matches the filters.')}
                    </p>
                    {filtering && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearFilters}
                        >
                            {t('Clear filters')}
                        </Button>
                    )}
                </div>
            ) : grouped ? (
                <div className="space-y-5">
                    {groups.map((group) => {
                        const open = filtering || !collapsed.has(group.key);
                        const bad = group.items.filter(needsAttention).length;

                        return (
                            <div key={group.key} className="space-y-3">
                                <button
                                    type="button"
                                    className="flex w-full items-center gap-2 text-left text-sm text-muted-foreground hover:text-foreground"
                                    onClick={() => toggleGroup(group.key)}
                                    aria-expanded={open}
                                >
                                    <ChevronDown
                                        className={cn(
                                            'size-4 transition-transform',
                                            !open && '-rotate-90',
                                        )}
                                    />
                                    {group.category && (
                                        <span
                                            className={cn(
                                                'size-2 rounded-full',
                                                dotClass(group.category.color),
                                            )}
                                        />
                                    )}
                                    <span className="font-medium text-foreground">
                                        {group.category?.name ??
                                            t('No category')}
                                    </span>
                                    <span className="text-xs">
                                        {group.items.length}
                                    </span>
                                    {bad > 0 && (
                                        <span className="text-xs font-medium text-red-600 dark:text-red-400">
                                            · {t('Needs attention')}: {bad}
                                        </span>
                                    )}
                                </button>
                                {open && body(group.items)}
                            </div>
                        );
                    })}
                </div>
            ) : (
                body(sorted)
            )}
        </section>
    );
}
