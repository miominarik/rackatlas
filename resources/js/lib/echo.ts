import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

declare global {
    interface Window {
        Pusher: typeof Pusher;
    }
}

let instance: Echo<'reverb'> | null = null;

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/**
 * The shared connection to Laravel Reverb. It is opened on first use, so pages that do not need
 * realtime never open a socket. Private channels are authorised with the session cookie.
 */
export function echo(): Echo<'reverb'> {
    if (instance === null) {
        window.Pusher = Pusher;

        const scheme = import.meta.env.VITE_REVERB_SCHEME ?? 'https';
        const port = Number(
            import.meta.env.VITE_REVERB_PORT ??
                (scheme === 'https' ? 443 : 80),
        );

        instance = new Echo({
            broadcaster: 'reverb',
            key: import.meta.env.VITE_REVERB_APP_KEY,
            wsHost: import.meta.env.VITE_REVERB_HOST,
            wsPort: port,
            wssPort: port,
            forceTLS: scheme === 'https',
            enabledTransports: ['ws', 'wss'],
            channelAuthorization: {
                endpoint: '/broadcasting/auth',
                transport: 'ajax',
                headersProvider: () => ({
                    'X-XSRF-TOKEN': xsrfToken(),
                    Accept: 'application/json',
                }),
            },
        } as ConstructorParameters<typeof Echo<'reverb'>>[0]);
    }

    return instance;
}
