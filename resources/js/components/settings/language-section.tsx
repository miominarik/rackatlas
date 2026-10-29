import { router, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import LanguageController from '@/actions/App/Http/Controllers/Settings/LanguageController';
import { SettingsSection } from '@/components/settings/section';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

export default function LanguageSection() {
    const { t, locale } = useTranslation();
    const { locales } = usePage<{ locales: Record<string, string> }>().props;

    return (
        <SettingsSection
            title={t('Language')}
            description={t('Choose the language of the application')}
        >
            <div
                className="grid gap-3 sm:grid-cols-3"
                role="radiogroup"
                aria-label={t('Language')}
            >
                {Object.entries(locales).map(([code, name]) => {
                    const active = code === locale;

                    return (
                        <button
                            key={code}
                            type="button"
                            role="radio"
                            aria-checked={active}
                            onClick={() =>
                                router.put(
                                    LanguageController.update.url(),
                                    { locale: code },
                                    { preserveScroll: true },
                                )
                            }
                            className={cn(
                                'flex items-center justify-between gap-3 rounded-xl border p-4 text-left transition-colors',
                                active
                                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                    : 'hover:bg-muted/50',
                            )}
                        >
                            <span>
                                <span className="block text-sm font-medium">
                                    {name}
                                </span>
                                <span className="block text-xs text-muted-foreground uppercase">
                                    {code}
                                </span>
                            </span>
                            {active && (
                                <Check className="size-4 text-primary" />
                            )}
                        </button>
                    );
                })}
            </div>
        </SettingsSection>
    );
}
