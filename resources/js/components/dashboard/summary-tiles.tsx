import { useTranslation } from '@/hooks/use-translation';
import type { Evaluated } from '@/lib/dashboard';
import { cn } from '@/lib/utils';

function average(values: (number | null)[]): number | null {
    const present = values.filter((value): value is number => value !== null);

    return present.length
        ? present.reduce((sum, value) => sum + value, 0) / present.length
        : null;
}

export default function SummaryTiles({ items }: { items: Evaluated[] }) {
    const { t } = useTranslation();

    const count = (...levels: Evaluated['level'][]) =>
        items.filter((item) => levels.includes(item.level)).length;

    const cpu = average(items.map((item) => item.cpu));
    const ram = average(items.map((item) => item.ram));
    const critical = count('critical', 'offline');
    const warnings = count('warning', 'stale');

    const tiles = [
        { label: t('Servers'), value: String(items.length), tone: '' },
        {
            label: t('Healthy'),
            value: String(count('ok')),
            tone: 'text-emerald-600 dark:text-emerald-400',
        },
        {
            label: t('Warnings'),
            value: String(warnings),
            tone: warnings > 0 ? 'text-amber-600 dark:text-amber-400' : '',
        },
        {
            label: t('Critical'),
            value: String(critical),
            tone: critical > 0 ? 'text-red-600 dark:text-red-400' : '',
        },
        {
            label: t('Average CPU'),
            value: cpu === null ? '–' : `${Math.round(cpu)}%`,
            tone: '',
        },
        {
            label: t('Average memory'),
            value: ram === null ? '–' : `${Math.round(ram)}%`,
            tone: '',
        },
    ];

    return (
        <section
            aria-label={t('Summary')}
            className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6"
        >
            {tiles.map((tile) => (
                <div key={tile.label} className="rounded-xl border bg-card p-4">
                    <p className="text-xs text-muted-foreground">{tile.label}</p>
                    <p
                        className={cn(
                            'mt-1 text-2xl font-semibold tracking-tight',
                            tile.tone,
                        )}
                    >
                        {tile.value}
                    </p>
                </div>
            ))}
        </section>
    );
}
