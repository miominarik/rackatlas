import { Link } from '@inertiajs/react';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export type Paginated<T> = {
    data: T[];
    current_page: number;
    last_page: number;
    total: number;
    prev_page_url: string | null;
    next_page_url: string | null;
};

export default function Pagination({ page }: { page: Paginated<unknown> }) {
    const { t } = useTranslation();

    if (page.last_page <= 1) {
        return null;
    }

    const link = (href: string | null, label: string) =>
        href ? (
            <Link
                href={href}
                preserveScroll
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-muted"
            >
                {label}
            </Link>
        ) : (
            <span
                className={cn(
                    'rounded-md border px-3 py-1.5 text-sm text-muted-foreground opacity-50',
                )}
            >
                {label}
            </span>
        );

    return (
        <div className="flex items-center justify-between gap-3 border-t px-4 py-3 text-sm text-muted-foreground sm:px-6">
            <span>
                {t('Page :page of :pages', {
                    page: page.current_page,
                    pages: page.last_page,
                })}
            </span>
            <div className="flex gap-2">
                {link(page.prev_page_url, t('Previous'))}
                {link(page.next_page_url, t('Next'))}
            </div>
        </div>
    );
}
