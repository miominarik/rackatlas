import { AlertTriangle, CheckCircle2, OctagonAlert } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { sortProblems } from '@/lib/dashboard';
import type { Problem } from '@/lib/dashboard';
import { cn } from '@/lib/utils';

const LIMIT = 8;

export default function ProblemsList({ problems }: { problems: Problem[] }) {
    const { t } = useTranslation();
    const [expanded, setExpanded] = useState(false);
    const sorted = sortProblems(problems);
    const visible = expanded ? sorted : sorted.slice(0, LIMIT);

    if (sorted.length === 0) {
        return (
            <section
                aria-label={t('Problems')}
                className="flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4"
            >
                <CheckCircle2 className="size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                <div>
                    <p className="font-medium">{t('Everything looks fine')}</p>
                    <p className="text-sm text-muted-foreground">
                        {t('No server is over its limits right now.')}
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section aria-label={t('Problems')} className="space-y-2">
            <h2 className="text-sm font-medium">
                {t('Problems')}{' '}
                <span className="text-muted-foreground">{sorted.length}</span>
            </h2>
            <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                {visible.map((problem, index) => {
                    const critical = problem.severity === 'critical';
                    const Icon = critical ? OctagonAlert : AlertTriangle;

                    return (
                        <li
                            key={`${problem.serverId}-${problem.kind}-${index}`}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm"
                        >
                            <Icon
                                className={cn(
                                    'size-4 shrink-0',
                                    critical
                                        ? 'text-red-500'
                                        : 'text-amber-500',
                                )}
                                aria-label={
                                    critical ? t('Critical') : t('Warning')
                                }
                            />
                            <span className="min-w-0 flex-1 truncate">
                                <span className="font-medium">
                                    {problem.serverName}
                                </span>
                                <span className="text-muted-foreground">
                                    {' '}
                                    · {problem.message}
                                </span>
                            </span>
                        </li>
                    );
                })}
            </ul>
            {sorted.length > LIMIT && (
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded(!expanded)}
                >
                    {expanded
                        ? t('Show fewer')
                        : t('Show all :count', { count: sorted.length })}
                </Button>
            )}
        </section>
    );
}
