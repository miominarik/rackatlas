import { router } from "@inertiajs/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import FcmTokenController from "@/actions/App/Http/Controllers/Settings/FcmTokenController";
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
    PUSH_ANSWERED_EVENT,
    PUSH_CHOICE_KEY,
    isNativeApp,
    startNativePush,
} from "@/lib/native";

const readChoice = (): string | null => {
    try {
        return localStorage.getItem(PUSH_CHOICE_KEY);
    } catch {
        return "0";
    }
};

/**
 * Inside the Android app only: asks after every sign-in whether to get push alerts, then registers
 * the phone and shows alerts that arrive while the app is open.
 */
export function NativePush() {
    const { t } = useTranslation();
    const [asking, setAsking] = useState(false);

    const start = () =>
        void startNativePush({
            tokenUrl: FcmTokenController.store.url(),
            deviceName: "RackAtlas app · Android",
            onNotification: ({ title, body }) =>
                toast(title ?? "RackAtlas", { description: body }),
            onOpen: (url) => router.visit(url),
        });

    useEffect(() => {
        if (!isNativeApp()) {
            return;
        }

        const choice = readChoice();

        if (choice === "1") {
            start();
        } else if (choice === null) {
            setAsking(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const answer = (accepted: boolean) => {
        try {
            localStorage.setItem(PUSH_CHOICE_KEY, accepted ? "1" : "0");
        } catch {
            // Asked again next start.
        }

        setAsking(false);
        window.dispatchEvent(new Event(PUSH_ANSWERED_EVENT));

        if (accepted) {
            start();
        }
    };

    return (
        <Dialog open={asking} onOpenChange={(open) => !open && answer(false)}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{t("Turn on notifications?")}</DialogTitle>
                    <DialogDescription>
                        {t(
                            "Get critical server alerts on this phone, even when the screen is off.",
                        )}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => answer(false)}>
                        {t("Not now")}
                    </Button>
                    <Button onClick={() => answer(true)}>{t("Turn on")}</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
