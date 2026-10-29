import { useCallback, useEffect, useState } from 'react';

export type PushState = 'unsupported' | 'denied' | 'idle' | 'subscribed';

function urlBase64ToUint8Array(value: string): Uint8Array<ArrayBuffer> {
    const padded = value.padEnd(value.length + ((4 - (value.length % 4)) % 4), '=');
    const raw = window.atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(new ArrayBuffer(raw.length));

    for (let i = 0; i < raw.length; i++) {
        bytes[i] = raw.charCodeAt(i);
    }

    return bytes;
}

function toBase64Url(buffer: ArrayBuffer | null): string {
    if (!buffer) {
        return '';
    }

    return window
        .btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/** A short label such as "Chrome on Android" for the device list. */
export function deviceLabel(): string {
    const ua = navigator.userAgent;
    const browser = /Edg\//.test(ua)
        ? 'Edge'
        : /OPR\//.test(ua)
          ? 'Opera'
          : /Firefox\//.test(ua)
            ? 'Firefox'
            : /Chrome\//.test(ua)
              ? 'Chrome'
              : /Safari\//.test(ua)
                ? 'Safari'
                : 'Browser';
    const os = /Android/.test(ua)
        ? 'Android'
        : /iPhone|iPad/.test(ua)
          ? 'iOS'
          : /Windows/.test(ua)
            ? 'Windows'
            : /Mac OS X/.test(ua)
              ? 'macOS'
              : /Linux/.test(ua)
                ? 'Linux'
                : '';

    return os ? `${browser} · ${os}` : browser;
}

function supported(): boolean {
    return (
        typeof window !== 'undefined' &&
        'serviceWorker' in navigator &&
        'PushManager' in window &&
        'Notification' in window
    );
}

/**
 * Registers this browser for push notifications and reports whether it already is.
 */
export function usePushSubscription(vapidPublicKey: string | null, subscribeUrl: string) {
    const [state, setState] = useState<PushState>('idle');
    const [endpointHash, setEndpointHash] = useState<string | null>(null);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const refresh = useCallback(async () => {
        if (!supported()) {
            setState('unsupported');

            return;
        }

        if (Notification.permission === 'denied') {
            setState('denied');

            return;
        }

        try {
            const registration = await navigator.serviceWorker.getRegistration('/');
            const subscription = await registration?.pushManager.getSubscription();

            if (subscription) {
                const digest = await crypto.subtle.digest(
                    'SHA-256',
                    new TextEncoder().encode(subscription.endpoint),
                );

                setEndpointHash(
                    Array.from(new Uint8Array(digest))
                        .map((b) => b.toString(16).padStart(2, '0'))
                        .join(''),
                );
                setState('subscribed');
            } else {
                setEndpointHash(null);
                setState('idle');
            }
        } catch {
            setState('idle');
        }
    }, []);

    useEffect(() => {
        void refresh();
    }, [refresh]);

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!vapidPublicKey) {
            return false;
        }

        setBusy(true);
        setError(null);

        try {
            const permission = await Notification.requestPermission();

            if (permission !== 'granted') {
                setState(permission === 'denied' ? 'denied' : 'idle');

                return false;
            }

            await navigator.serviceWorker.register('/sw.js');
            const registration = await navigator.serviceWorker.ready;
            const subscription =
                (await registration.pushManager.getSubscription()) ??
                (await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
                }));

            const response = await fetch(subscribeUrl, {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': xsrfToken(),
                },
                body: JSON.stringify({
                    endpoint: subscription.endpoint,
                    keys: {
                        p256dh: toBase64Url(subscription.getKey('p256dh')),
                        auth: toBase64Url(subscription.getKey('auth')),
                    },
                    contentEncoding: (
                        PushManager.supportedContentEncodings ?? ['aesgcm']
                    ).includes('aes128gcm')
                        ? 'aes128gcm'
                        : 'aesgcm',
                    name: deviceLabel(),
                }),
            });

            if (!response.ok) {
                const body = (await response.json().catch(() => null)) as { message?: string } | null;

                await subscription.unsubscribe();
                setError(body?.message ?? 'error');
                await refresh();

                return false;
            }

            await refresh();

            return true;
        } catch {
            setError('error');

            return false;
        } finally {
            setBusy(false);
        }
    }, [vapidPublicKey, subscribeUrl, refresh]);

    /** Drops the subscription of this browser (the server forgets it via the device list). */
    const unsubscribe = useCallback(async () => {
        const registration = await navigator.serviceWorker.getRegistration('/');
        const subscription = await registration?.pushManager.getSubscription();

        await subscription?.unsubscribe();
        await refresh();
    }, [refresh]);

    return { state, endpointHash, busy, error, subscribe, unsubscribe };
}
