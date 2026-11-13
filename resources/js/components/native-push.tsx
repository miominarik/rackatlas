import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import FcmTokenController from '@/actions/App/Http/Controllers/Settings/FcmTokenController';
import { isNativeApp, startNativePush } from '@/lib/native';

/** Inside the Android app only: registers the phone for push and shows alerts that arrive while it is open. */
export function NativePush() {
    useEffect(() => {
        if (!isNativeApp()) {
            return;
        }

        void startNativePush({
            tokenUrl: FcmTokenController.store.url(),
            deviceName: 'RackAtlas app · Android',
            onNotification: ({ title, body }) =>
                toast(title ?? 'RackAtlas', { description: body }),
            onOpen: (url) => router.visit(url),
        });
    }, []);

    return null;
}
