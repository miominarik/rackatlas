import { router, usePage } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { decide } from '@/routes/login-approvals';

type PendingApproval = {
    id: number;
    choices: number[];
    ip_address: string | null;
    browser: string | null;
    platform: string | null;
    expires_at: string;
};

/**
 * On a device that approves sign-ins: asks whether the sign-in that is waiting should be allowed.
 * It looks for new requests every few seconds while the page is open.
 */
export function LoginApprovalDialog() {
    const { t } = useTranslation();
    const { loginApproval } = usePage<{
        loginApproval?: PendingApproval | null;
    }>().props;

    useEffect(() => {
        const timer = window.setInterval(() => {
            if (document.visibilityState === 'visible') {
                router.reload({
                    only: ['loginApproval'],
                    showProgress: false,
                } as Parameters<typeof router.reload>[0]);
            }
        }, 4000);

        return () => window.clearInterval(timer);
    }, []);

    if (!loginApproval) {
        return null;
    }

    const answer = (data: { choice?: number; deny?: boolean }) =>
        router.post(decide.url(loginApproval.id), data, {
            preserveScroll: true,
            preserveState: true,
        });

    const device =
        [loginApproval.browser, loginApproval.platform]
            .filter(Boolean)
            .join(' · ') || t('Unknown device');

    return (
        <Dialog open>
            <DialogContent
                className="[&>button:last-child]:hidden"
                onInteractOutside={(event) => event.preventDefault()}
                onEscapeKeyDown={(event) => event.preventDefault()}
                data-test="login-approval-dialog"
            >
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <ShieldAlert className="size-5 text-amber-500" />
                        {t('Is this you signing in?')}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            'Someone is signing in to your account from :device (:ip). Choose the number shown on that screen to allow it.',
                            {
                                device,
                                ip: loginApproval.ip_address ?? '—',
                            },
                        )}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-3 gap-3">
                    {loginApproval.choices.map((choice) => (
                        <Button
                            key={choice}
                            variant="outline"
                            className="h-16 text-2xl tabular-nums"
                            onClick={() => answer({ choice })}
                        >
                            {choice}
                        </Button>
                    ))}
                </div>

                <Button
                    variant="destructive"
                    onClick={() => answer({ deny: true })}
                >
                    {t('Deny, it is not me')}
                </Button>
            </DialogContent>
        </Dialog>
    );
}
