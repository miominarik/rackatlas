import { useEffect, useState } from 'react';

type InstallPromptEvent = Event & {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

let deferredPrompt: InstallPromptEvent | null = null;
const listeners = new Set<() => void>();

function notify(): void {
    listeners.forEach((listener) => listener());
}

if (typeof window !== 'undefined') {
    window.addEventListener('beforeinstallprompt', (event) => {
        event.preventDefault();
        deferredPrompt = event as InstallPromptEvent;
        notify();
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        notify();
    });
}

/**
 * Lets the app offer its own "Install app" action while the browser says it can be installed.
 */
export function useInstallPrompt(): {
    canInstall: boolean;
    install: () => Promise<void>;
} {
    const [canInstall, setCanInstall] = useState(deferredPrompt !== null);

    useEffect(() => {
        const update = () => setCanInstall(deferredPrompt !== null);

        listeners.add(update);
        update();

        return () => {
            listeners.delete(update);
        };
    }, []);

    const install = async () => {
        if (!deferredPrompt) {
            return;
        }

        const prompt = deferredPrompt;

        deferredPrompt = null;
        notify();
        await prompt.prompt();
        await prompt.userChoice;
    };

    return { canInstall, install };
}
