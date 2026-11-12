/**
 * Bridge to the Capacitor mobile shell (/mobile). The app loads this site remotely, so the native
 * plugins are reached through window.Capacitor instead of imports. Everything is a no-op on the web.
 */
type NativePlugins = {
    SystemBars?: {
        setStyle(options: { style: 'DARK' | 'LIGHT' }): Promise<void>;
    };
};

const plugins = (): NativePlugins | undefined =>
    (window as unknown as { Capacitor?: { Plugins?: NativePlugins } })
        .Capacitor?.Plugins;

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
        void plugins()
            ?.SystemBars?.setStyle({
                style: root.classList.contains('dark') ? 'DARK' : 'LIGHT',
            })
            ?.catch(() => {});
    };

    syncStatusBar();
    new MutationObserver(syncStatusBar).observe(root, {
        attributes: true,
        attributeFilter: ['class'],
    });
}

type BiometricPlugin = {
    checkBiometry(): Promise<{ isAvailable: boolean }>;
    internalAuthenticate(options: {
        reason?: string;
        allowDeviceCredential?: boolean;
    }): Promise<void>;
};

let biometricPlugin: BiometricPlugin | null | undefined;

/** The biometric plugin is registered on demand because the remote site has no bundled plugin imports. */
function biometric(): BiometricPlugin | null {
    if (biometricPlugin !== undefined) {
        return biometricPlugin;
    }

    const capacitor = (
        window as unknown as {
            Capacitor?: {
                registerPlugin?: (name: string) => BiometricPlugin;
            };
        }
    ).Capacitor;

    try {
        biometricPlugin =
            isNativeApp() && capacitor?.registerPlugin
                ? capacitor.registerPlugin('BiometricAuthNative')
                : null;
    } catch {
        biometricPlugin = null;
    }

    return biometricPlugin;
}

/** True only inside the app on a device that has biometrics (or a device passcode) set up. */
export async function biometricsAvailable(): Promise<boolean> {
    try {
        return (await biometric()?.checkBiometry())?.isAvailable ?? false;
    } catch {
        return false;
    }
}

/** Shows the system fingerprint / face prompt. Resolves false when cancelled or failed. */
export async function authenticateWithBiometrics(
    reason: string,
): Promise<boolean> {
    try {
        await biometric()?.internalAuthenticate({
            reason,
            allowDeviceCredential: true,
        });

        return biometric() !== null;
    } catch {
        return false;
    }
}
