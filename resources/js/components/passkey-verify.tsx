import type { UrlMethodPair } from '@inertiajs/core';
import { router } from '@inertiajs/react';
import { usePasskeyVerify } from '@laravel/passkeys/react';
import { KeyRound } from 'lucide-react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    routes?: {
        options: UrlMethodPair;
        submit: UrlMethodPair;
    };
    label?: string;
    loadingLabel?: string;
    separator?: string;
    /** Shown under the form as a secondary option, instead of above it. */
    below?: boolean;
};

export default function PasskeyVerify({
    routes,
    label,
    loadingLabel,
    separator,
    below = false,
}: Props = {}) {
    const { t } = useTranslation();
    const { verify, isLoading, error, isSupported } = usePasskeyVerify({
        ...(routes && {
            routes: {
                options: routes.options.url,
                submit: routes.submit.url,
            },
        }),
        onSuccess: (response) => {
            router.visit(response.redirect ?? '/app');
        },
    });

    if (!isSupported) {
        return null;
    }

    const button = (
        <div className="grid gap-2">
            <Button
                type="button"
                variant="outline"
                className={below ? 'h-11 w-full rounded-xl' : 'w-full'}
                onClick={verify}
                disabled={isLoading}
            >
                {isLoading ? <Spinner /> : <KeyRound className="h-4 w-4" />}
                {isLoading
                    ? (loadingLabel ?? t('Authenticating...'))
                    : (label ?? t('Sign in with a passkey'))}
            </Button>
            {error && <InputError message={t(error)} className="text-center" />}
        </div>
    );

    const divider = (
        <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    {separator ?? t('Or continue with email')}
                </span>
            </div>
        </div>
    );

    return below ? (
        <>
            {divider}
            {button}
        </>
    ) : (
        <>
            {button}
            {divider}
        </>
    );
}
