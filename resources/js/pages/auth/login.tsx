import { Form, Head } from '@inertiajs/react';
import { Lock, Mail } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { register } from '@/routes';
import { store } from '@/routes/login';
import { request } from '@/routes/password';
import PasskeyVerify from '@/components/passkey-verify';
import { TurnstileField, useTurnstile } from '@/hooks/use-turnstile';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    status?: string;
    canResetPassword: boolean;
};

export default function Login({ status, canResetPassword }: Props) {
    const { t } = useTranslation();
    const turnstile = useTurnstile('login');
    return (
        <>
            <Head title={t('Log in')} />

            <Form
                {...store.form()}
                resetOnSuccess={['password']}
                onFinish={turnstile.reset}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('Email address')}
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        name="email"
                                        required
                                        tabIndex={1}
                                        autoComplete="username"
                                        placeholder="email@example.com"
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">
                                        {t('Password')}
                                    </Label>
                                    {canResetPassword && (
                                        <TextLink
                                            href={request()}
                                            className="ml-auto text-sm"
                                            tabIndex={5}
                                        >
                                            {t('Forgot your password?')}
                                        </TextLink>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <PasswordInput
                                        id="password"
                                        name="password"
                                        required
                                        tabIndex={2}
                                        autoComplete="current-password"
                                        placeholder={t('Password')}
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember">
                                    {t('Remember me')}
                                </Label>
                            </div>

                            <TurnstileField
                                turnstile={turnstile}
                                error={errors.turnstile_token}
                            />

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl text-[15px] font-medium"
                                tabIndex={4}
                                disabled={processing || !turnstile.ready}
                                data-test="login-button"
                            >
                                {processing && <Spinner />}
                                {t('Log in')}
                            </Button>
                        </div>
                    </>
                )}
            </Form>

            <PasskeyVerify below separator={t('Or')} />

            <div className="mt-6 text-center text-sm text-muted-foreground">
                {t("Don't have an account?")}{' '}
                <TextLink href={register()} tabIndex={5}>
                    {t('Sign up')}
                </TextLink>
            </div>

            {status && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    {status}
                </div>
            )}
        </>
    );
}

Login.layout = {
    title: 'Log in to your account',
    description: 'Enter your email and password below to log in',
};
