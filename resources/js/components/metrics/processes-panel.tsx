import { useEffect, useState } from 'react';
import { useTranslation } from '@/hooks/use-translation';
import { formatBytes } from '@/lib/dashboard';
import { processes as processesRoute } from '@/routes/metrics';
import type { MetricsProcess, MetricsProcessSample } from '@/types';

type Props = {
    serverId: number;
    /** Start of the chart point to explain, unix seconds. Null while there is no data. */
    from: number | null;
    seconds: number;
    agentVersion: string | null;
    onShowPeak?: () => void;
    isPeak: boolean;
};

type Answer = {
    agent_version: string | null;
    cpu: MetricsProcessSample | null;
    memory: MetricsProcessSample | null;
};

/** The first agent that sends the processes. */
const MIN_AGENT = [1, 2, 0];

function agentSupportsProcesses(version: string | null): boolean {
    if (!version) {
        return false;
    }

    const parts = version.split('.').map((part) => parseInt(part, 10) || 0);

    for (let i = 0; i < MIN_AGENT.length; i++) {
        if ((parts[i] ?? 0) !== MIN_AGENT[i]) {
            return (parts[i] ?? 0) > MIN_AGENT[i];
        }
    }

    return true;
}

function Rows({
    rows,
    kind,
    memoryTotal,
}: {
    rows: MetricsProcess[];
    kind: 'cpu' | 'memory';
    memoryTotal: number;
}) {
    const { t } = useTranslation();
    const shown = rows
        .filter((row) => (kind === 'cpu' ? row.cpu > 0 : row.memory > 0))
        .slice(0, 5);

    if (shown.length === 0) {
        return (
            <p className="text-sm text-muted-foreground">
                {t('Nothing stood out.')}
            </p>
        );
    }

    return (
        <ul className="space-y-2.5">
            {shown.map((row) => {
                const share =
                    kind === 'cpu'
                        ? row.cpu
                        : memoryTotal > 0
                          ? (row.memory / memoryTotal) * 100
                          : 0;

                return (
                    <li key={row.name} className="space-y-1">
                        <div className="flex items-baseline justify-between gap-3 text-sm">
                            <span className="min-w-0 truncate font-mono">
                                {row.name}
                                {row.count > 1 && (
                                    <span className="ml-1.5 text-xs text-muted-foreground">
                                        ×{row.count}
                                    </span>
                                )}
                            </span>
                            <span className="shrink-0 font-mono text-xs text-muted-foreground">
                                {kind === 'cpu'
                                    ? `${Math.round(row.cpu * 10) / 10}%`
                                    : `${formatBytes(row.memory)} · ${Math.round(share * 10) / 10}%`}
                            </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                                className={
                                    kind === 'cpu'
                                        ? 'h-full rounded-full bg-blue-500'
                                        : 'h-full rounded-full bg-emerald-500'
                                }
                                style={{
                                    width: `${Math.max(2, Math.min(100, share))}%`,
                                }}
                            />
                        </div>
                    </li>
                );
            })}
        </ul>
    );
}

export default function ProcessesPanel({
    serverId,
    from,
    seconds,
    agentVersion,
    onShowPeak,
    isPeak,
}: Props) {
    const { t, locale } = useTranslation();
    const [answer, setAnswer] = useState<Answer | null>(null);
    const [failed, setFailed] = useState(false);

    useEffect(() => {
        if (from === null) {
            return;
        }

        const controller = new AbortController();

        setAnswer(null);
        setFailed(false);

        fetch(
            processesRoute.url({
                query: { server: serverId, from, to: from + seconds },
            }),
            {
                headers: {
                    Accept: 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                },
                credentials: 'same-origin',
                signal: controller.signal,
            },
        )
            .then((response) =>
                response.ok
                    ? response.json()
                    : Promise.reject(new Error(String(response.status))),
            )
            .then((data: Answer) => setAnswer(data))
            .catch((error: unknown) => {
                if (
                    !(
                        error instanceof DOMException &&
                        error.name === 'AbortError'
                    )
                ) {
                    setFailed(true);
                }
            });

        return () => controller.abort();
    }, [serverId, from, seconds]);

    const supported = agentSupportsProcesses(agentVersion);
    const time = (sample: MetricsProcessSample | null) =>
        sample
            ? new Date(sample.collected_at).toLocaleString(locale, {
                  day: 'numeric',
                  month: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
              })
            : null;

    return (
        <section className="min-w-0 space-y-4 rounded-xl border bg-card p-3 sm:p-4">
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <div>
                    <h2 className="text-sm font-medium">
                        {t('What used the resources')}
                    </h2>
                    <p className="text-xs text-muted-foreground">
                        {isPeak
                            ? t(
                                  'The busiest moment of the selected period. Click a point in the CPU or memory chart to see another moment.',
                              )
                            : t('The moment you picked in the chart.')}
                    </p>
                </div>
                {!isPeak && onShowPeak && (
                    <button
                        type="button"
                        onClick={onShowPeak}
                        className="text-xs text-primary underline-offset-4 hover:underline"
                    >
                        {t('Show the busiest moment')}
                    </button>
                )}
            </div>

            {!supported ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    {t(
                        'This server does not report processes. Install or update the agent to version :version or newer.',
                        { version: '1.2.0' },
                    )}
                </p>
            ) : failed ? (
                <p className="text-sm text-muted-foreground">
                    {t('The processes could not be loaded.')}
                </p>
            ) : answer === null ? (
                <div
                    className="grid animate-pulse gap-4 md:grid-cols-2"
                    aria-busy="true"
                >
                    <div className="h-28 rounded-lg bg-muted" />
                    <div className="h-28 rounded-lg bg-muted" />
                </div>
            ) : !answer.cpu && !answer.memory ? (
                <p className="text-sm text-muted-foreground">
                    {t('No process data for this moment.')}
                </p>
            ) : (
                <div className="grid gap-6 md:grid-cols-2">
                    <div className="min-w-0 space-y-3">
                        <div className="flex items-baseline justify-between gap-3">
                            <h3 className="text-sm font-medium">
                                {t('Most CPU')}
                            </h3>
                            {answer.cpu && (
                                <p className="text-xs text-muted-foreground">
                                    {time(answer.cpu)} ·{' '}
                                    {Math.round(answer.cpu.cpu_percent * 10) /
                                        10}
                                    %
                                </p>
                            )}
                        </div>
                        {answer.cpu && (
                            <Rows
                                rows={answer.cpu.processes}
                                kind="cpu"
                                memoryTotal={answer.cpu.memory_total}
                            />
                        )}
                    </div>
                    <div className="min-w-0 space-y-3">
                        <div className="flex items-baseline justify-between gap-3">
                            <h3 className="text-sm font-medium">
                                {t('Most memory')}
                            </h3>
                            {answer.memory && (
                                <p className="text-xs text-muted-foreground">
                                    {time(answer.memory)} ·{' '}
                                    {formatBytes(answer.memory.memory_used)} /{' '}
                                    {formatBytes(answer.memory.memory_total)}
                                </p>
                            )}
                        </div>
                        {answer.memory && (
                            <Rows
                                rows={answer.memory.processes}
                                kind="memory"
                                memoryTotal={answer.memory.memory_total}
                            />
                        )}
                    </div>
                </div>
            )}

            <p className="text-xs text-muted-foreground">
                {t(
                    'Processes with the same name are added up. CPU is the share of the whole server, memory counts shared pages fairly (PSS).',
                )}
            </p>
        </section>
    );
}
