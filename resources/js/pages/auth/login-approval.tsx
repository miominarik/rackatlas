import { Form, Head, router, setLayoutProps } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { logout } from '@/routes';
import { code, renew, status as statusRoute } from '@/routes/login-approval';

type Props = {
    number: number | null;
    status: 'pending' | 'approved' | 'denied' | 'expired';
    canUseCode: boolean;
};

export default function LoginApproval(props: Props) {
    const { t } = useTranslation();
    const [status, setStatus] = useState(props.status);
    const [recovery, setRecovery] = useState(false);

    setLayoutProps({
        title: t('Approve the sign-in'),
        description: t(
            'We sent a request to your approving device. Open the app there and choose the number below.',
        ),
    });

    useEffect(() => {
        setStatus(props.status);
    }, [props.status]);

    useEffect(() => {
        if (status !== 'pending') {
            return;
        }

        const timer = window.setInterval(async () => {
            try {
                const response = await fetch(statusRoute.url(), {
                    headers: { Accept: 'application/json' },
                    credentials: 'same-origin',
                });
                const body = (await response.json()) as {
                    status: Props['status'];
                };

                setStatus(body.status);

                if (body.status === 'approved') {
                    router.visit('/app');
                }
            } catch {
                // The next round tries again.
            }
        }, 2000);

        return () => window.clearInterval(timer);
    }, [status]);

    useEffect(() => {
        if (status === 'denied') {
            router.post(logout().url);
        }
    }, [status]);

    return (
        <>
            <Head title={t('Approve the sign-in')} />

            <div className="space-y-6 text-center">
                {status === 'pending' && props.number !== null && (
                    <div className="space-y-2">
                        <p
                            className="text-6xl font-semibold tracking-wider tabular-nums"
                            data-test="approval-number"
                        >
                            {props.number}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {t('Waiting for your approval…')}
                        </p>
                    </div>
                )}

                {status === 'expired' && (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            {t('The request ran out.')}
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => router.post(renew().url)}
                        >
                            {t('Send a new request')}
                        </Button>
                    </div>
                )}

                {status === 'denied' && (
                    <p className="text-sm text-muted-foreground">
                        {t('The sign-in was denied.')}
                    </p>
                )}

                {props.canUseCode && status !== 'denied' && (
                    <Form
                        {...code.form()}
                        className="space-y-3 text-left"
                        resetOnError
                    >
                        {({ errors, processing }) => (
                            <>
                                <p className="text-center text-sm text-muted-foreground">
                                    {recovery
                                        ? t('Enter one of your recovery codes.')
                                        : t(
                                              'No access to your device? Enter the code of your authenticator app.',
                                          )}
                                </p>
                                <Input
                                    key={recovery ? 'recovery' : 'code'}
                                    name={recovery ? 'recovery_code' : 'code'}
                                    inputMode={recovery ? 'text' : 'numeric'}
                                    autoComplete="one-time-code"
                                    placeholder={
                                        recovery
                                            ? t('Enter recovery code')
                                            : t('Authentication code')
                                    }
                                    required
                                />
                                <InputError
                                    message={
                                        recovery
                                            ? errors.recovery_code
                                            : errors.code
                                    }
                                />
                                <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full"
                                    disabled={processing}
                                >
                                    {t('Continue')}
                                </Button>
                                <button
                                    type="button"
                                    className="block w-full cursor-pointer text-center text-sm text-muted-foreground underline underline-offset-4"
                                    onClick={() => setRecovery(!recovery)}
                                >
                                    {recovery
                                        ? t('use an authentication code')
                                        : t('use a recovery code')}
                                </button>
                            </>
                        )}
                    </Form>
                )}

                <button
                    type="button"
                    className="cursor-pointer text-sm text-muted-foreground underline underline-offset-4"
                    onClick={() => router.post(logout().url)}
                >
                    {t('Cancel and log out')}
                </button>
            </div>
        </>
    );
}
