import { Link, router } from '@inertiajs/react';
import { Cookie } from 'lucide-react';
import { useEffect, useState } from 'react';
import LanguageController from '@/actions/App/Http/Controllers/Settings/LanguageController';
import {
    COOKIE_SETTINGS_EVENT,
    useCookieConsent,
} from '@/hooks/use-privacy-choices';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { privacy } from '@/routes';

const button =
    'inline-flex items-center justify-center rounded-full px-5 py-2.5 text-[14.5px] font-medium whitespace-nowrap transition-colors';

function Toggle({
    checked,
    disabled,
    label,
    onChange,
}: {
    checked: boolean;
    disabled?: boolean;
    label: string;
    onChange?: (value: boolean) => void;
}) {
    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            aria-label={label}
            disabled={disabled}
            onClick={() => onChange?.(!checked)}
            className={cn(
                'relative h-6 w-10 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-60',
                checked ? 'bg-[var(--l-accent)]' : 'bg-[var(--l-border)]',
            )}
        >
            <span
                className={cn(
                    'absolute top-0.5 left-0.5 size-5 rounded-full bg-white shadow transition-transform',
                    checked && 'translate-x-4',
                )}
            />
        </button>
    );
}

/**
 * GDPR / ePrivacy cookie notice for the public pages. Necessary cookies are always on, everything else
 * is off until the visitor opts in, and "Necessary only" is as easy to pick as "Accept all".
 */
export default function CookieConsent() {
    const { t, locale } = useTranslation();
    const { consent, save } = useCookieConsent();
    const [mounted, setMounted] = useState(false);
    const [reopened, setReopened] = useState(false);
    const [customizing, setCustomizing] = useState(false);
    const [preferences, setPreferences] = useState(false);

    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const open = () => {
            setPreferences(consent?.preferences ?? false);
            setCustomizing(true);
            setReopened(true);
        };

        window.addEventListener(COOKIE_SETTINGS_EVENT, open);

        return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
    }, [consent]);

    if (!mounted) {
        return null;
    }

    if (consent !== null && !reopened) {
        return (
            <button
                type="button"
                onClick={() => {
                    setPreferences(consent.preferences);
                    setCustomizing(true);
                    setReopened(true);
                }}
                aria-label={t('Cookie settings')}
                title={t('Cookie settings')}
                className="landing fixed right-4 bottom-4 z-40 flex size-11 items-center justify-center rounded-full border border-[var(--l-border)] bg-[var(--l-card)] text-[var(--l-ink)] shadow-[0_10px_30px_-12px_rgba(15,25,20,0.45)] transition-transform hover:-translate-y-px"
            >
                <Cookie className="size-5" aria-hidden="true" />
            </button>
        );
    }

    const decide = (value: boolean) => {
        const withdrawn = consent?.preferences === true && !value;

        save({ preferences: value });
        setReopened(false);
        setCustomizing(false);

        if (withdrawn) {
            // Turns the stored language cookie into a browser-session cookie.
            router.put(
                LanguageController.update.url(),
                { locale, remember: false, silent: true },
                { preserveScroll: true, preserveState: true },
            );
        }
    };

    return (
        <div
            role="dialog"
            aria-labelledby="privacy-choices-title"
            aria-describedby="privacy-choices-text"
            className="landing fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[640px] rounded-2xl border border-[var(--l-border)] bg-[var(--l-card)] p-5 text-[var(--l-ink)] shadow-[0_24px_60px_-20px_rgba(15,25,20,0.45)] sm:inset-x-auto sm:right-5 sm:bottom-5 sm:left-5 sm:mx-0 sm:ml-auto sm:p-6"
        >
            <h2
                id="privacy-choices-title"
                className="mb-1.5 text-[17px] font-semibold tracking-tight"
            >
                {t('Cookies')}
            </h2>
            <p
                id="privacy-choices-text"
                className="text-[14.5px] leading-normal text-[var(--l-body)]"
            >
                {t(
                    'We use the cookies the site needs to work. With your consent we also remember your preferences, such as language. We use no advertising or tracking cookies.',
                )}{' '}
                <Link
                    href={privacy()}
                    className="underline underline-offset-4 hover:text-[var(--l-ink)]"
                >
                    {t('Privacy and cookies')}
                </Link>
            </p>

            {customizing && (
                <ul className="mt-4 divide-y divide-[var(--l-border)] rounded-xl border border-[var(--l-border)]">
                    <li className="flex items-start gap-4 p-3.5">
                        <div className="min-w-0 flex-1">
                            <p className="text-[14.5px] font-medium">
                                {t('Necessary')}
                            </p>
                            <p className="text-[13.5px] leading-snug text-[var(--l-body)]">
                                {t(
                                    'Session, form protection and sign-in security. The site cannot work without them.',
                                )}
                            </p>
                        </div>
                        <Toggle checked disabled label={t('Necessary')} />
                    </li>
                    <li className="flex items-start gap-4 p-3.5">
                        <div className="min-w-0 flex-1">
                            <p className="text-[14.5px] font-medium">
                                {t('Preferences')}
                            </p>
                            <p className="text-[13.5px] leading-snug text-[var(--l-body)]">
                                {t(
                                    'Remembers your chosen language between visits.',
                                )}
                            </p>
                        </div>
                        <Toggle
                            checked={preferences}
                            label={t('Preferences')}
                            onChange={setPreferences}
                        />
                    </li>
                </ul>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
                {customizing ? (
                    <>
                        <button
                            type="button"
                            onClick={() => decide(preferences)}
                            className={cn(
                                button,
                                'bg-[var(--l-ink)] text-[var(--l-bg)] hover:opacity-90',
                            )}
                        >
                            {t('Save choice')}
                        </button>
                        {reopened && (
                            <button
                                type="button"
                                onClick={() => {
                                    setReopened(false);
                                    setCustomizing(false);
                                }}
                                className={cn(
                                    button,
                                    'border border-[var(--l-border)] hover:border-[var(--l-muted)]',
                                )}
                            >
                                {t('Cancel')}
                            </button>
                        )}
                    </>
                ) : (
                    <>
                        <button
                            type="button"
                            onClick={() => decide(false)}
                            className={cn(
                                button,
                                'bg-[var(--l-ink)] text-[var(--l-bg)] hover:opacity-90',
                            )}
                        >
                            {t('Necessary only')}
                        </button>
                        <button
                            type="button"
                            onClick={() => decide(true)}
                            className={cn(
                                button,
                                'bg-[var(--l-ink)] text-[var(--l-bg)] hover:opacity-90',
                            )}
                        >
                            {t('Accept all')}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setPreferences(false);
                                setCustomizing(true);
                            }}
                            className={cn(
                                button,
                                'border border-[var(--l-border)] hover:border-[var(--l-muted)]',
                            )}
                        >
                            {t('Customize')}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
