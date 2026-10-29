import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
    title: string;
    description?: ReactNode;
    /** Something at the right end of the header, for example a button. */
    action?: ReactNode;
    /** Red header and border for destructive actions. */
    danger?: boolean;
    /** No padding around the content, for lists that run from edge to edge. */
    flush?: boolean;
    children: ReactNode;
    className?: string;
};

/**
 * One block of a settings page: a card with a header (title and explanation) and the content.
 */
export function SettingsSection({
    title,
    description,
    action,
    danger = false,
    flush = false,
    children,
    className,
}: Props) {
    return (
        <section
            className={cn(
                'overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs',
                danger && 'border-red-200 dark:border-red-500/25',
                className,
            )}
        >
            <header
                className={cn(
                    'flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 sm:px-6',
                    danger && 'border-red-200 bg-red-50/60 dark:border-red-500/25 dark:bg-red-500/[0.06]',
                )}
            >
                <div className="min-w-0 space-y-1">
                    <h2
                        className={cn(
                            'text-base leading-none font-semibold tracking-tight',
                            danger && 'text-red-700 dark:text-red-300',
                        )}
                    >
                        {title}
                    </h2>
                    {description && (
                        <p className="text-sm text-muted-foreground">{description}</p>
                    )}
                </div>
                {action}
            </header>
            <div className={cn(!flush && 'space-y-6 px-4 py-5 sm:px-6')}>{children}</div>
        </section>
    );
}
