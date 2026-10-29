import { useCallback, useMemo, useSyncExternalStore } from 'react';

const STORAGE_KEY = 'ra_cookie_consent';
const OPEN_EVENT = 'ra:cookie-settings';
const CHANGE_EVENT = 'ra:cookie-consent';
const VERSION = 1;

export type CookieConsent = {
    preferences: boolean;
};

function readRaw(): string {
    if (typeof window === 'undefined') {
        return '';
    }

    try {
        return window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
        return '';
    }
}

function subscribe(callback: () => void): () => void {
    window.addEventListener(CHANGE_EVENT, callback);
    window.addEventListener('storage', callback);

    return () => {
        window.removeEventListener(CHANGE_EVENT, callback);
        window.removeEventListener('storage', callback);
    };
}

function parse(raw: string): CookieConsent | null {
    if (raw === '') {
        return null;
    }

    try {
        const data = JSON.parse(raw);

        return data?.v === VERSION
            ? { preferences: data.preferences === true }
            : null;
    } catch {
        return null;
    }
}

/**
 * The visitor's cookie choice, kept in localStorage so no extra cookie is needed to remember it.
 * `consent` is null until the visitor decides.
 */
export function useCookieConsent() {
    const raw = useSyncExternalStore(subscribe, readRaw, readRaw);
    const consent = useMemo(() => parse(raw), [raw]);

    const save = useCallback((choice: CookieConsent) => {
        try {
            window.localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify({
                    v: VERSION,
                    ...choice,
                    at: new Date().toISOString(),
                }),
            );
        } catch {
            // Storage is blocked: the banner shows again on the next visit, which is the safe default.
        }

        window.dispatchEvent(new Event(CHANGE_EVENT));
    }, []);

    return { consent, save };
}

/**
 * Whether preference cookies may outlive the browser session. Used by code that writes cookies itself.
 */
export function preferencesAllowed(): boolean {
    return parse(readRaw())?.preferences === true;
}

export function openCookieSettings(): void {
    window.dispatchEvent(new Event(OPEN_EVENT));
}

export const COOKIE_SETTINGS_EVENT = OPEN_EVENT;
