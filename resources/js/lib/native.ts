/**
 * Bridge to the Capacitor mobile shell (/mobile). The app loads this site remotely, so the native
 * plugins are reached through window.Capacitor instead of imports. Everything is a no-op on the web.
 */
type NativeBridge = {
    nativePromise?: (
        plugin: string,
        method: string,
        options?: Record<string, unknown>,
    ) => Promise<unknown>;
};

/**
 * The remote page only gets the raw native bridge (no bundled Capacitor runtime), so plugins are called
 * by name through nativePromise instead of registerPlugin().
 */
function callNative<T = unknown>(
    plugin: string,
    method: string,
    options: Record<string, unknown> = {},
): Promise<T> {
    const bridge = (window as unknown as { Capacitor?: NativeBridge })
        .Capacitor;

    if (!bridge?.nativePromise) {
        return Promise.reject(new Error('Native bridge unavailable'));
    }

    return bridge.nativePromise(plugin, method, options) as Promise<T>;
}

const USER_AGENT_TOKEN = 'RackAtlasApp';

/** The shell appends a token to the WebView user agent; this is the reliable signal inside the page. */
export const isNativeApp = (): boolean =>
    typeof navigator !== 'undefined' &&
    navigator.userAgent.includes(USER_AGENT_TOKEN);

/**
 * The service worker re-fetches every page with its own user agent, which lacks the token, so the server
 * would serve the plain website. The app needs no service worker (it has native push), so remove it and
 * reload once to get the app layout.
 */
function dropServiceWorker(): void {
    if (!('serviceWorker' in navigator)) {
        return;
    }

    void navigator.serviceWorker
        .getRegistrations()
        .then(async (registrations) => {
            await Promise.all(registrations.map((r) => r.unregister()));

            const missingLayout =
                !document.documentElement.classList.contains('native-app');

            if (registrations.length > 0 && missingLayout) {
                try {
                    if (sessionStorage.getItem('native-reloaded')) {
                        return;
                    }

                    sessionStorage.setItem('native-reloaded', '1');
                } catch {
                    return;
                }

                window.location.reload();
            }
        })
        .catch(() => {});
}

/** Light text on the status bar in dark mode, dark text in light mode; follows the theme toggle. */
export function initNative(): void {
    if (!isNativeApp()) {
        return;
    }

    const root = document.documentElement;

    root.classList.add('native-app');
    dropServiceWorker();

    const syncStatusBar = () => {
        callNative('SystemBars', 'setStyle', {
            style: root.classList.contains('dark') ? 'DARK' : 'LIGHT',
        }).catch(() => {});
    };

    syncStatusBar();
    new MutationObserver(syncStatusBar).observe(root, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

/** True only inside the app on a device that has biometrics (or a device passcode) set up. */
export async function biometricsAvailable(): Promise<boolean> {
    if (!isNativeApp()) {
        return false;
    }

    try {
        const result = await callNative<{
            isAvailable?: boolean;
            deviceIsSecure?: boolean;
        }>('BiometricAuthNative', 'checkBiometry');

        return Boolean(result?.isAvailable || result?.deviceIsSecure);
    } catch {
        return false;
    }
}

/** Shows the system fingerprint / face prompt. Resolves false when cancelled or failed. */
export async function authenticateWithBiometrics(
    reason: string,
): Promise<boolean> {
    try {
        await callNative('BiometricAuthNative', 'internalAuthenticate', {
            reason,
            allowDeviceCredential: true,
        });

        return true;
    } catch {
        return false;
    }
}

type PushEvent<T> = (data: T) => void;

type PushNotificationData = {
    title?: string;
    body?: string;
    data?: { url?: string };
};

function listenNative<T>(
    plugin: string,
    eventName: string,
    callback: PushEvent<T>,
): void {
    const bridge = (
        window as unknown as {
            Capacitor?: {
                nativeCallback?: (
                    plugin: string,
                    method: string,
                    options: Record<string, unknown>,
                    callback: PushEvent<T>,
                ) => void;
            };
        }
    ).Capacitor;

    bridge?.nativeCallback?.(plugin, 'addListener', { eventName }, callback);
}

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

let pushStarted = false;

/**
 * Android only: asks for the notification permission, creates the high-importance "alerts" channel
 * (sound, shows on the lock screen), and sends the Firebase token to the server so critical alerts
 * arrive even when the screen is off and the app is closed.
 */
export async function startNativePush(options: {
    tokenUrl: string;
    deviceName: string;
    onNotification: (notification: PushNotificationData) => void;
    onOpen: (url: string) => void;
}): Promise<void> {
    if (pushStarted || !isNativeApp()) {
        return;
    }

    pushStarted = true;

    try {
        let { receive } = await callNative<{ receive: string }>(
            'PushNotifications',
            'checkPermissions',
        );

        if (receive === 'prompt' || receive === 'prompt-with-rationale') {
            ({ receive } = await callNative<{ receive: string }>(
                'PushNotifications',
                'requestPermissions',
            ));
        }

        if (receive !== 'granted') {
            pushStarted = false;

            return;
        }

        await callNative('PushNotifications', 'createChannel', {
            id: 'alerts',
            name: 'Critical alerts',
            description: 'Servers going offline, failed services and other critical problems.',
            importance: 5,
            visibility: 1,
            sound: 'default',
            vibration: true,
            lights: true,
        });

        listenNative<{ value: string }>(
            'PushNotifications',
            'registration',
            ({ value }) => {
                void fetch(options.tokenUrl, {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': xsrfToken(),
                    },
                    body: JSON.stringify({
                        token: value,
                        name: options.deviceName,
                    }),
                }).catch(() => {});
            },
        );
        listenNative<PushNotificationData>(
            'PushNotifications',
            'pushNotificationReceived',
            options.onNotification,
        );
        listenNative<{ notification?: PushNotificationData }>(
            'PushNotifications',
            'pushNotificationActionPerformed',
            ({ notification }) => {
                const url = notification?.data?.url;

                if (url?.startsWith('/')) {
                    options.onOpen(url);
                }
            },
        );

        await callNative('PushNotifications', 'register');
    } catch {
        pushStarted = false;
    }
}
