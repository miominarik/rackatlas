import {
    DatabaseBackup,
    FileText,
    Layers,
    Network,
    Rocket,
    Server,
    Siren,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useTranslation } from '@/hooks/use-translation';
import type { DocumentStatus } from '@/types';

const icons: Record<string, LucideIcon> = {
    server: Server,
    layers: Layers,
    'database-backup': DatabaseBackup,
    rocket: Rocket,
    siren: Siren,
    network: Network,
    'file-text': FileText,
};

export const templateIcon = (name: string): LucideIcon =>
    icons[name] ?? FileText;

/** A page not reviewed for this many days is probably out of date. */
export const STALE_AFTER_DAYS = 180;

export const isStale = (reviewedAt: string | null): boolean =>
    reviewedAt !== null &&
    Date.now() - new Date(reviewedAt).getTime() > STALE_AFTER_DAYS * 86400000;

export function StatusBadge({ status }: { status: DocumentStatus }) {
    const { t } = useTranslation();

    if (status === 'current') {
        return <Badge variant="secondary">{t('Up to date')}</Badge>;
    }

    if (status === 'outdated') {
        return <Badge variant="destructive">{t('Outdated')}</Badge>;
    }

    return <Badge variant="outline">{t('Draft')}</Badge>;
}
