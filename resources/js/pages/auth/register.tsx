import { Form, Head } from '@inertiajs/react';
import { Lock, Mail, User } from 'lucide-react';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { login, privacy } from '@/routes';
import { store } from '@/routes/register';
import { TurnstileField, useTurnstile } from '@/hooks/use-turnstile';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    passwordRules: string;
};

export default function Register({ passwordRules }: Props) {
    const { t } = useTranslation();
    const turnstile = useTurnstile('register');
    return (
        <>
            <Head title={t('Register')} />
            <Form
                {...store.form()}
                resetOnSuccess={['password', 'password_confirmation']}
                disableWhileProcessing
                onFinish={turnstile.reset}
                className="flex flex-col gap-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-5">
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Name')}</Label>
                                <div className="relative">
                                    <User className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="name"
                                        type="text"
                                        required
                                        tabIndex={1}
                                        autoComplete="name"
                                        name="name"
                                        placeholder={t('Full name')}
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError
                                    message={errors.name}
                                    className="mt-2"
                                />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="email">
                                    {t('Email address')}
                                </Label>
                                <div className="relative">
                                    <Mail className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        required
                                        tabIndex={2}
                                        autoComplete="email"
                                        name="email"
                                        placeholder="email@example.com"
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password">
                                    {t('Password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <PasswordInput
                                        id="password"
                                        required
                                        tabIndex={3}
                                        autoComplete="new-password"
                                        name="password"
                                        placeholder={t('Password')}
                                        passwordrules={passwordRules}
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError message={errors.password} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="password_confirmation">
                                    {t('Confirm password')}
                                </Label>
                                <div className="relative">
                                    <Lock className="pointer-events-none absolute top-1/2 left-3.5 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
                                    <PasswordInput
                                        id="password_confirmation"
                                        required
                                        tabIndex={4}
                                        autoComplete="new-password"
                                        name="password_confirmation"
                                        placeholder={t('Confirm password')}
                                        passwordrules={passwordRules}
                                        className="h-11 rounded-xl pl-10"
                                    />
                                </div>
                                <InputError
                                    message={errors.password_confirmation}
                                />
                            </div>

                            <TurnstileField
                                turnstile={turnstile}
                                error={errors.turnstile_token}
                            />

                            <Button
                                type="submit"
                                className="mt-2 h-11 w-full rounded-xl text-[15px] font-medium"
                                tabIndex={5}
                                disabled={!turnstile.ready}
                                data-test="register-user-button"
                            >
                                {processing && <Spinner />}
                                {t('Create account')}
                            </Button>
                        </div>

                        <p className="text-center text-xs text-muted-foreground">
                            {t('By registering you acknowledge our')}{' '}
                            <TextLink href={privacy()} tabIndex={7}>
                                {t('privacy policy')}
                            </TextLink>
                            .
                        </p>

                        <div className="text-center text-sm text-muted-foreground">
                            {t('Already have an account?')}{' '}
                            <TextLink href={login()} tabIndex={6}>
                                {t('Log in')}
                            </TextLink>
                        </div>
                    </>
                )}
            </Form>
        </>
    );
}

Register.layout = {
    title: 'Create an account',
    description: 'Enter your details below to create your account',
};
