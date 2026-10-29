import { cn } from '@/lib/utils';

const fill = {
    ok: 'bg-emerald-500',
    warning: 'bg-amber-500',
    critical: 'bg-red-500',
} as const;

const text = {
    ok: 'text-muted-foreground',
    warning: 'text-amber-600 dark:text-amber-400',
    critical: 'text-red-600 dark:text-red-400',
} as const;

export default function UsageBar({
    label,
    value,
    level,
    detail,
}: {
    label: string;
    value: number;
    level: 'ok' | 'warning' | 'critical';
    detail?: string;
}) {
    const width = Math.max(0, Math.min(100, value));

    return (
        <div className="space-y-1">
            <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate text-muted-foreground">{label}</span>
                <span className={cn('shrink-0 font-mono', text[level])}>
                    {detail && (
                        <span className="mr-1.5 text-muted-foreground/70">
                            {detail}
                        </span>
                    )}
                    {Math.round(value)}%
                </span>
            </div>
            <div
                className="h-1.5 overflow-hidden rounded-full bg-muted"
                role="progressbar"
                aria-valuenow={Math.round(value)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={label}
            >
                <div
                    className={cn(
                        'h-full rounded-full transition-all',
                        fill[level],
                    )}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    );
}
