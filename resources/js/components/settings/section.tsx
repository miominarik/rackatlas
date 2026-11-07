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
                'lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-10 lg:overflow-visible lg:rounded-none lg:border-0 lg:bg-transparent lg:py-8 lg:shadow-none lg:first:pt-0',
                danger && 'border-red-200 dark:border-red-500/25',
                className,
            )}
        >
            <header
                className={cn(
                    'flex flex-wrap items-start justify-between gap-3 border-b px-4 py-4 sm:px-6',
                    'lg:sticky lg:top-24 lg:flex-col lg:justify-start lg:border-b-0 lg:p-0',
                    danger &&
                        'border-red-200 bg-red-50/60 lg:bg-transparent dark:border-red-500/25 dark:bg-red-500/[0.06] dark:lg:bg-transparent',
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
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
                {action}
            </header>
            <div
                className={cn(
                    !flush && 'space-y-6 px-4 py-5 sm:px-6',
                    'lg:overflow-hidden lg:rounded-xl lg:border lg:bg-card lg:shadow-xs',
                    danger && 'lg:border-red-200 dark:lg:border-red-500/25',
                )}
            >
                {children}
            </div>
        </section>
    );
}
