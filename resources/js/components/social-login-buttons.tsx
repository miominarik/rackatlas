import { useTranslation } from '@/hooks/use-translation';
import { redirect } from '@/routes/social';
import type { SocialProvider } from '@/types/social';

/** The four squares of the Microsoft logo, in the colours of its brand guidelines. */
function MicrosoftLogo() {
    return (
        <svg
            width="21"
            height="21"
            viewBox="0 0 21 21"
            aria-hidden="true"
            className="shrink-0"
        >
            <rect x="1" y="1" width="9" height="9" fill="#f25022" />
            <rect x="11" y="1" width="9" height="9" fill="#7fba00" />
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef" />
            <rect x="11" y="11" width="9" height="9" fill="#ffb900" />
        </svg>
    );
}

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
                <a
                    key={provider.id}
                    href={redirect.url(provider.id)}
                    data-test={`social-${label}-${provider.id}`}
                    className="flex h-[41px] w-full items-center justify-center gap-3 border border-[#8c8c8c] bg-white px-3 font-['Segoe_UI',system-ui,sans-serif] text-[15px] font-semibold text-[#5e5e5e] transition-colors hover:bg-[#f3f2f1] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0067b8] dark:border-transparent dark:bg-[#2f2f2f] dark:text-white dark:hover:bg-[#3a3a3a]"
                >
                    {provider.id === 'microsoft' && <MicrosoftLogo />}
                    {label === 'login'
                        ? t('Log in with :provider', { provider: provider.name })
                        : t('Sign up with :provider', {
                              provider: provider.name,
                          })}
                </a>
            ))}
        </div>
    );
}
