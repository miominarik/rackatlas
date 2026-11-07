import { Form, Head, usePage } from '@inertiajs/react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import {
    index as confirmOptions,
    store as confirmStore,
} from '@/actions/Laravel/Passkeys/Http/Controllers/PasskeyConfirmationController';
import InputError from '@/components/input-error';
import PasskeyVerify from '@/components/passkey-verify';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { UserInfo } from '@/components/user-info';
import { useTranslation } from '@/hooks/use-translation';
import { store } from '@/routes/password/confirm';
import type { Auth } from '@/types';

export default function ConfirmPassword() {
    const { t } = useTranslation();
    const { auth } = usePage<{ auth: Auth }>().props;

    return (
        <>
            <Head title={t('Confirm password')} />

            <div className="mx-auto flex w-full max-w-md flex-col gap-6 p-4 pt-8 md:p-6 md:pt-16">
                <div className="space-y-3 text-center">
                    <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ShieldCheck className="size-7" />
                    </div>
                    <h1 className="text-2xl font-semibold">
                        {t('Confirm it is you')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'This is a secure area of the application. Please confirm your password before continuing.',
                        )}
                    </p>
                </div>

                <div className="space-y-5 rounded-xl border bg-card p-5">
                    <div className="flex items-center gap-2 rounded-lg bg-muted/60 p-2.5">
                        <UserInfo user={auth.user} showEmail />
                    </div>

                    <Form {...store.form()} resetOnSuccess={['password']}>
                        {({ processing, errors }) => (
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t('Password')}
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        placeholder={t('Password')}
                                        autoComplete="current-password"
                                        autoFocus
                                    />
                                    <InputError message={errors.password} />
                                </div>

                                <Button
                                    className="w-full"
                                    disabled={processing}
                                    data-test="confirm-password-button"
                                >
                                    {processing && <Spinner />}
                                    {t('Confirm password')}
                                </Button>
                            </div>
                        )}
                    </Form>

                    <PasskeyVerify
                        below
                        routes={{
                            options: confirmOptions(),
                            submit: confirmStore(),
                        }}
                        label={t('Confirm with passkey')}
                        loadingLabel={t('Confirming...')}
                        separator={t('Or')}
                    />
                </div>

                <button
                    type="button"
                    onClick={() => window.history.back()}
                    className="mx-auto inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    {t('Go back')}
                </button>
            </div>
        </>
    );
}
