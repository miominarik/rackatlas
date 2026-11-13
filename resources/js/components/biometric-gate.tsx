import { router, usePage } from "@inertiajs/react";
import { Fingerprint } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import DeviceController from "@/actions/App/Http/Controllers/Settings/DeviceController";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import {
    BIOMETRIC_ASKED_KEY as ASKED_KEY,
    PUSH_ANSWERED_EVENT,
    PUSH_CHOICE_KEY,
    authenticateWithBiometrics,
    biometricsAvailable,
    isNativeApp,
} from "@/lib/native";

const RELOCK_AFTER_MS = 30_000;

/**
 * Inside the mobile app only: asks once whether to use biometrics, and when it is on, covers the app
 * with a lock screen at start and after it was in the background for a while.
 */
export function BiometricGate() {
    const { t } = useTranslation();
    const enabled = Boolean(
        usePage<{ biometrics?: boolean }>().props.biometrics,
    );
    const [locked, setLocked] = useState(enabled && isNativeApp());
    const [offer, setOffer] = useState(false);
    const [busy, setBusy] = useState(false);
    const [pushDecided, setPushDecided] = useState(() => {
        try {
            return localStorage.getItem(PUSH_CHOICE_KEY) !== null;
        } catch {
            return true;
        }
    });

    useEffect(() => {
        const onAnswered = () => setPushDecided(true);

        window.addEventListener(PUSH_ANSWERED_EVENT, onAnswered);

        return () =>
            window.removeEventListener(PUSH_ANSWERED_EVENT, onAnswered);
    }, []);
    const hiddenAt = useRef<number | null>(null);
    const prompting = useRef(false);

    const unlock = useCallback(async () => {
        if (prompting.current) {
            return;
        }

        prompting.current = true;

        try {
            if (await authenticateWithBiometrics(t("Unlock RackAtlas"))) {
                setLocked(false);
            }
        } finally {
            prompting.current = false;
        }
    }, [t]);

    useEffect(() => {
        if (locked) {
            void unlock();
        }
    }, [locked, unlock]);

    useEffect(() => {
        if (!enabled || !isNativeApp()) {
            return;
        }

        const onVisibility = () => {
            if (document.hidden) {
                hiddenAt.current = Date.now();

                return;
            }

            if (
                hiddenAt.current !== null &&
                Date.now() - hiddenAt.current > RELOCK_AFTER_MS
            ) {
                setLocked(true);
            }

            hiddenAt.current = null;
        };

        document.addEventListener("visibilitychange", onVisibility);

        return () =>
            document.removeEventListener("visibilitychange", onVisibility);
    }, [enabled]);

    useEffect(() => {
        if (enabled || !isNativeApp()) {
            return;
        }

        try {
            if (localStorage.getItem(ASKED_KEY)) {
                return;
            }
        } catch {
            return;
        }

        void biometricsAvailable().then(setOffer);
    }, [enabled]);

    const answer = (accepted: boolean) => {
        try {
            localStorage.setItem(ASKED_KEY, "1");
        } catch {
            // Asking again next start is acceptable.
        }

        if (!accepted) {
            setOffer(false);

            return;
        }

        setBusy(true);
        void authenticateWithBiometrics(t("Turn on biometric unlock")).then(
            (ok) => {
                if (!ok) {
                    setBusy(false);

                    return;
                }

                router.put(
                    DeviceController.updateBiometrics.url(),
                    { enabled: true },
                    {
                        preserveScroll: true,
                        onFinish: () => {
                            setBusy(false);
                            setOffer(false);
                        },
                    },
                );
            },
        );
    };

    return (
        <>
            {locked && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-background p-8 text-center">
                    <Fingerprint className="size-16 text-primary" />
                    <p className="text-lg font-medium">
                        {t("RackAtlas is locked")}
                    </p>
                    <Button onClick={() => void unlock()}>{t("Unlock")}</Button>
                </div>
            )}

            <Dialog
                open={offer && !locked && pushDecided}
                onOpenChange={(open) => !open && answer(false)}
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{t("Use biometric unlock?")}</DialogTitle>
                        <DialogDescription>
                            {t(
                                "Unlock the app with your fingerprint or face. You will stay signed in on this device.",
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => answer(false)}>
                            {t("Not now")}
                        </Button>
                        <Button disabled={busy} onClick={() => answer(true)}>
                            {t("Turn on")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
