import { usePage } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import InputError from '@/components/input-error';
import { useTranslation } from '@/hooks/use-translation';

type TurnstileApi = {
    render: (
        container: HTMLElement,
        options: Record<string, unknown>,
    ) => string;
    reset: (widgetId: string) => void;
    remove: (widgetId: string) => void;
};

declare global {
    interface Window {
        turnstile?: TurnstileApi;
    }
}

const SCRIPT_URL =
    'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

let scriptPromise: Promise<void> | null = null;

function loadTurnstile(): Promise<void> {
    if (window.turnstile) {
        return Promise.resolve();
    }

    scriptPromise ??= new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = SCRIPT_URL;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => {
            scriptPromise = null;
            reject(new Error('Turnstile could not be loaded'));
        };
        document.head.appendChild(script);
    });

    return scriptPromise;
}

export type TurnstileState = ReturnType<typeof useTurnstile>;

/**
 * Cloudflare Turnstile (Invisible widget). The `action` has to match what the
 * server expects for this form. The token is single use, so call `reset` after
 * every submit.
 */
export function useTurnstile(action: string) {
    const { siteKey } = usePage<{ turnstile: { siteKey: string | null } }>()
        .props.turnstile;
    const container = useRef<HTMLDivElement>(null);
    const widgetId = useRef<string | null>(null);
    const [token, setToken] = useState('');

    useEffect(() => {
        if (!siteKey) {
            return;
        }

        let cancelled = false;

        loadTurnstile()
            .then(() => {
                if (cancelled || !container.current || !window.turnstile) {
                    return;
                }

                widgetId.current = window.turnstile.render(container.current, {
                    sitekey: siteKey,
                    action,
                    callback: (value: string) => setToken(value),
                    'expired-callback': () => setToken(''),
                    'error-callback': () => setToken(''),
                    'refresh-expired': 'auto',
                });
            })
            .catch(() => undefined);

        return () => {
            cancelled = true;

            if (widgetId.current && window.turnstile) {
                window.turnstile.remove(widgetId.current);
            }

            widgetId.current = null;
        };
    }, [siteKey, action]);

    const reset = useCallback(() => {
        setToken('');

        if (widgetId.current && window.turnstile) {
            window.turnstile.reset(widgetId.current);
        }
    }, []);

    return {
        enabled: Boolean(siteKey),
        token,
        /** True when the form may be submitted: no check is configured or the token arrived. */
        ready: !siteKey || token !== '',
        reset,
        container,
    };
}

/** The hidden token field and the (invisible) widget. Put it inside the form. */
export function TurnstileField({
    turnstile,
    error,
}: {
    turnstile: TurnstileState;
    error?: string;
}) {
    const { t } = useTranslation();

    if (!turnstile.enabled) {
        return null;
    }

    return (
        <div>
            <div ref={turnstile.container} />
            <input
                type="hidden"
                name="turnstile_token"
                value={turnstile.token}
            />
            <InputError message={error} />
            {!turnstile.ready && (
                <p
                    className="text-center text-xs text-muted-foreground"
                    role="status"
                >
                    {t('Running the security check…')}
                </p>
            )}
        </div>
    );
}
