/**
 * Bridge to the Capacitor mobile shell (/mobile). The app loads this site remotely, so the native
 * plugins are reached through window.Capacitor instead of imports. Everything is a no-op on the web.
 */
type NativePlugins = {
    SystemBars?: {
        setStyle(options: { style: 'DARK' | 'LIGHT' }): Promise<void>;
    };
    Haptics?: {
        impact(options: { style: 'LIGHT' | 'MEDIUM' | 'HEAVY' }): Promise<void>;
        selectionChanged?(): Promise<void>;
    };
};

const plugins = (): NativePlugins | undefined =>
    (window as unknown as { Capacitor?: { Plugins?: NativePlugins } })
        .Capacitor?.Plugins;

export const isNativeApp = (): boolean =>
    typeof document !== 'undefined' &&
    document.documentElement.classList.contains('native-app');

export function haptic(): void {
    if (!isNativeApp()) {
        return;
    }

    void plugins()?.Haptics?.impact({ style: 'LIGHT' })?.catch(() => {});
}

/** Light text on the status bar in dark mode, dark text in light mode; follows the theme toggle. */
export function initNative(): void {
    if (!isNativeApp()) {
        return;
    }

    const root = document.documentElement;
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
