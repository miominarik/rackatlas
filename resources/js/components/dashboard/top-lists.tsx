import UsageBar from '@/components/dashboard/usage-bar';
import { useTranslation } from '@/hooks/use-translation';
import { diskPercent, usageLevel } from '@/lib/dashboard';
import type { Evaluated } from '@/lib/dashboard';
import type { DashboardThresholds } from '@/types';

type Row = { key: string; label: string; value: number };

function TopCard({
    title,
    rows,
    limits,
}: {
    title: string;
    rows: Row[];
    limits: { warn: number; critical: number };
}) {
    const { t } = useTranslation();

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <h3 className="text-sm font-medium">{title}</h3>
            {rows.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                    {t('No data yet')}
                </p>
            ) : (
                <div className="space-y-2.5">
                    {rows.map((row) => (
                        <UsageBar
                            key={row.key}
                            label={row.label}
                            value={row.value}
                            level={usageLevel(row.value, limits)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

export default function TopLists({
    items,
    thresholds,
}: {
    items: Evaluated[];
    thresholds: DashboardThresholds;
}) {
    const { t } = useTranslation();

    const top = (value: (item: Evaluated) => number | null): Row[] =>
        items
            .map((item) => ({
                key: String(item.server.id),
                label: item.server.name,
                value: value(item),
            }))
            .filter((row): row is Row => row.value !== null)
            .sort((a, b) => b.value - a.value)
            .slice(0, 5);

    const disks: Row[] = items
        .flatMap((item) =>
            (item.server.metrics?.disks ?? []).map((disk) => ({
                key: `${item.server.id}-${disk.mount}`,
                label: `${item.server.name} ${disk.mount}`,
                value: diskPercent(disk),
            })),
        )
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    return (
        <section
            aria-label={t('Top usage')}
            className="grid gap-4 md:grid-cols-3"
        >
            <TopCard
                title={t('Highest CPU')}
                rows={top((item) => item.cpu)}
                limits={thresholds.cpu}
            />
            <TopCard
                title={t('Highest memory')}
                rows={top((item) => item.ram)}
                limits={thresholds.ram}
            />
            <TopCard
                title={t('Fullest disks')}
                rows={disks}
                limits={thresholds.disk}
            />
        </section>
    );
}
