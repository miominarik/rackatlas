import type { LucideIcon } from 'lucide-react';
import { Check, Monitor, Moon, Sun } from 'lucide-react';
import { SettingsSection } from '@/components/settings/section';
import type { Appearance as AppearanceMode } from '@/hooks/use-appearance';
import { useAppearance } from '@/hooks/use-appearance';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

const options: { value: AppearanceMode; icon: LucideIcon; label: string; preview: string }[] = [
    { value: 'light', icon: Sun, label: 'Light', preview: 'bg-white border-zinc-200' },
    { value: 'dark', icon: Moon, label: 'Dark', preview: 'bg-zinc-900 border-zinc-700' },
    {
        value: 'system',
        icon: Monitor,
        label: 'System',
        preview: 'bg-gradient-to-r from-white from-50% to-zinc-900 to-50% border-zinc-300',
    },
];

export default function AppearanceSection() {
    const { t } = useTranslation();
    const { appearance, updateAppearance } = useAppearance();

    return (
        <SettingsSection
            title={t('Appearance')}
            description={t('Choose how the application looks. System follows your device.')}
        >
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label={t('Appearance')}>
                {options.map(({ value, icon: Icon, label, preview }) => {
                    const active = appearance === value;

                    return (
                        <button
                            key={value}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() => updateAppearance(value)}
                            className={cn(
                                'flex items-center gap-3 rounded-xl border p-3 text-left transition-colors sm:flex-col sm:items-stretch',
                                active ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'hover:bg-muted/50',
                            )}
                        >
                            <div
                                className={cn(
                                    'flex h-12 w-20 shrink-0 items-center justify-center rounded-lg border sm:h-20 sm:w-full',
                                    preview,
                                )}
                                aria-hidden
                            >
                                <div className="h-1.5 w-8 rounded-full bg-emerald-500/80" />
                            </div>
                            <div className="flex flex-1 items-center justify-between gap-2">
                                <span className="flex items-center gap-2 text-sm font-medium">
                                    <Icon className="size-4 text-muted-foreground" />
                                    {t(label)}
                                </span>
                                {active && <Check className="size-4 text-primary" />}
                            </div>
                        </button>
                    );
                })}
            </div>
        </SettingsSection>
    );
}
