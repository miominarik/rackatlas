import { Form, Head, router } from '@inertiajs/react';
import { useRef } from 'react';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { SettingsSection } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/security';
import type { Props as ManagePasskeysProps } from '@/components/manage-passkeys';
import ManagePasskeys from '@/components/manage-passkeys';
import type { Props as ManageTwoFactorProps } from '@/components/manage-two-factor';
import ManageTwoFactor from '@/components/manage-two-factor';
import { useTranslation } from '@/hooks/use-translation';

// oxfmt-ignore
type Props = {
    passwordRules: string;
    passwordLoginEnabled: boolean;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Security settings')} />

            <SettingsSection
                title={t('Update password')}
                description={t(
                    'Ensure your account is using a long, random password to stay secure',
                )}
            >
                <Form
                    {...SecurityController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    resetOnError={[
                        'password',
                        'password_confirmation',
                        'current_password',
                    ]}
                    resetOnSuccess
                    onError={(errors) => {
                        if (errors.password) {
                            passwordInput.current?.focus();
                        }

                        if (errors.current_password) {
                            currentPasswordInput.current?.focus();
                        }
                    }}
                    className="space-y-6"
                >
                    {({ errors, processing }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="current_password">
                                    {t('Current password')}
                                </Label>

                                <PasswordInput
                                    id="current_password"
                                    ref={currentPasswordInput}
                                    name="current_password"
                                    className="mt-1 block w-full"
                                    autoComplete="current-password"
                                    placeholder={t('Current password')}
                                />

                                <InputError message={errors.current_password} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t('New password')}
                                    </Label>

                                    <PasswordInput
                                        id="password"
                                        ref={passwordInput}
                                        name="password"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder={t('New password')}
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError message={errors.password} />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="password_confirmation">
                                        {t('Confirm password')}
                                    </Label>

                                    <PasswordInput
                                        id="password_confirmation"
                                        name="password_confirmation"
                                        className="mt-1 block w-full"
                                        autoComplete="new-password"
                                        placeholder={t('Confirm password')}
                                        passwordrules={props.passwordRules}
                                    />

                                    <InputError
                                        message={errors.password_confirmation}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-password-button"
                                >
                                    {t('Save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>

            <SettingsSection
                title={t('Sign in with password')}
                description={t(
                    'Turn this off to sign in only with a passkey. Removing your last passkey turns it back on.',
                )}
                action={
                    <Switch
                        checked={props.passwordLoginEnabled}
                        disabled={
                            props.passwordLoginEnabled &&
                            (props.passkeys ?? []).length === 0
                        }
                        aria-label={t('Sign in with password')}
                        data-test="password-login-switch"
                        onCheckedChange={(enabled) =>
                            router.put(
                                SecurityController.updatePasswordLogin.url(),
                                { enabled },
                                { preserveScroll: true },
                            )
                        }
                    />
                }
            >
                {props.passwordLoginEnabled &&
                (props.passkeys ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'Add a passkey first, otherwise you could not sign in.',
                        )}
                    </p>
                ) : null}
            </SettingsSection>

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />
        </>
    );
}

Security.layout = {
    breadcrumbs: [
        {
            title: 'Security settings',
            href: edit(),
        },
    ],
};
