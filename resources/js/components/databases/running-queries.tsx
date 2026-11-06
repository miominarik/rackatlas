import { useHttp } from '@inertiajs/react';
import { ChevronsDownUp, ChevronsUpDown, OctagonX } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import DatabaseProcessController from '@/actions/App/Http/Controllers/DatabaseProcessController';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type RunningQuery = {
    id: number;
    user: string;
    host: string;
    db: string | null;
    time: number;
    state: string | null;
    query: string;
};

type ProcessList = {
    success: boolean;
    queries: RunningQuery[];
    message?: string;
};

type KillResult = { success: boolean; message?: string };

const REFRESH_MS = 5000;

export default function RunningQueries({
    serverId,
    canManage,
}: {
    serverId: number;
    canManage: boolean;
}) {
    const { t } = useTranslation();
    const list = useHttp<Record<string, never>, ProcessList>({});
    const killer = useHttp<Record<string, never>, KillResult>({});
    const [queries, setQueries] = useState<RunningQuery[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [killing, setKilling] = useState<number | null>(null);
    const [expanded, setExpanded] = useState<Set<number>>(new Set());

    const toggle = (id: number) =>
        setExpanded((current) => {
            const next = new Set(current);

            if (!next.delete(id)) {
                next.add(id);
            }

            return next;
        });
    const busy = useRef(false);

    const load = useCallback(() => {
        if (busy.current) {
            return;
        }

        busy.current = true;

        list.get(DatabaseProcessController.index.url(serverId))
            .then((response) => {
                setQueries(response.queries);
                setError(response.success ? null : (response.message ?? ''));
            })
            .catch(() => setError(t('Could not load the running queries.')))
            .finally(() => {
                busy.current = false;
            });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverId]);

    useEffect(() => {
        load();

        const timer = window.setInterval(load, REFRESH_MS);

        return () => window.clearInterval(timer);
    }, [load]);

    const kill = (query: RunningQuery) => {
        if (
            !window.confirm(
                t('Kill the query of connection :id?', { id: query.id }),
            )
        ) {
            return;
        }

        setKilling(query.id);

        killer
            .post(
                DatabaseProcessController.kill.url({
                    server: serverId,
                    process: query.id,
                }),
            )
            .then((response) => {
                setError(response.success ? null : (response.message ?? ''));
                load();
            })
            .catch(() => setError(t('Could not kill the query.')))
            .finally(() => setKilling(null));
    };

    return (
        <section className="space-y-2">
            <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-sm font-medium">
                    {t('Running queries')}
                    {queries && (
                        <span className="ml-2 text-xs text-muted-foreground">
                            {queries.length}
                        </span>
                    )}
                </h2>
                <span className="text-xs text-muted-foreground">
                    {t('Refreshes every 5 seconds')}
                </span>
            </div>

            {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-700 dark:text-red-300">
                    {error}
                </p>
            )}

            {queries === null ? (
                <div className="h-16 animate-pulse rounded-lg border bg-muted" />
            ) : queries.length === 0 ? (
                <p className="rounded-lg border border-dashed bg-card p-6 text-center text-sm text-muted-foreground">
                    {t('No query is running right now.')}
                </p>
            ) : (
                <ul className="divide-y rounded-lg border bg-card text-sm">
                    {queries.map((query) => (
                        <li key={query.id} className="space-y-1.5 px-4 py-3">
                            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs text-muted-foreground">
                                <span>#{query.id}</span>
                                <span>
                                    {query.user}@{query.host}
                                </span>
                                {query.db && <span>{query.db}</span>}
                                <span
                                    className={cn(
                                        query.time >= 10 &&
                                            'text-amber-600 dark:text-amber-400',
                                        query.time >= 60 &&
                                            'text-red-600 dark:text-red-400',
                                    )}
                                >
                                    {t(':seconds s', { seconds: query.time })}
                                </span>
                                {query.state && <span>{query.state}</span>}
                            </div>
                            <div className="flex items-center gap-3">
                                <pre
                                    className={cn(
                                        'min-w-0 flex-1 overflow-auto rounded-md bg-muted p-2 font-mono text-xs break-words whitespace-pre-wrap',
                                        expanded.has(query.id)
                                            ? 'max-h-[80vh] resize-y'
                                            : 'max-h-24',
                                    )}
                                >
                                    {query.query}
                                </pre>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="size-8 shrink-0"
                                    aria-label={
                                        expanded.has(query.id)
                                            ? t('Collapse query')
                                            : t('Expand query')
                                    }
                                    title={
                                        expanded.has(query.id)
                                            ? t('Collapse query')
                                            : t('Expand query')
                                    }
                                    onClick={() => toggle(query.id)}
                                >
                                    {expanded.has(query.id) ? (
                                        <ChevronsDownUp className="size-4" />
                                    ) : (
                                        <ChevronsUpDown className="size-4" />
                                    )}
                                </Button>
                                {canManage && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="shrink-0"
                                        disabled={killing === query.id}
                                        onClick={() => kill(query)}
                                    >
                                        <OctagonX className="size-4" />
                                        {t('Kill')}
                                    </Button>
                                )}
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}
