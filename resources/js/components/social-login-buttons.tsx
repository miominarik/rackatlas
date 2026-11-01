import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { redirect } from '@/routes/social';
import type { SocialProvider } from '@/types/social';

/**
 * Buttons that continue with an external provider. A plain link on purpose: the provider
 * is a different site, so the browser has to leave the app.
 */
export default function SocialLoginButtons({
    providers,
    label,
}: {
    providers: SocialProvider[];
    label: 'login' | 'register';
}) {
    const { t } = useTranslation();

    if (providers.length === 0) {
        return null;
    }

    return (
        <div className="grid gap-4">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="h-px flex-1 bg-border" />
                {t('or')}
                <span className="h-px flex-1 bg-border" />
            </div>
            {providers.map((provider) => (
                <Button
                    key={provider.id}
                    variant="outline"
                    className="w-full"
                    asChild
                >
                    <a
                        href={redirect.url(provider.id)}
                        data-test={`social-${label}-${provider.id}`}
                    >
                        {label === 'login'
                            ? t('Log in with :provider', {
                                  provider: provider.name,
                              })
                            : t('Sign up with :provider', {
                                  provider: provider.name,
                              })}
                    </a>
                </Button>
            ))}
        </div>
    );
}
