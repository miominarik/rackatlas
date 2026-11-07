import { Form, Head, router } from '@inertiajs/react';
import { KeyRound, ShieldCheck, ShieldAlert, Lock } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRef } from 'react';
import { cn } from '@/lib/utils';
import SecurityController from '@/actions/App/Http/Controllers/Settings/SecurityController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { SettingsSection } from '@/components/settings/section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
    twoFactorRequired: boolean;
} & ManagePasskeysProps &
    ManageTwoFactorProps;

function Status({
    icon: Icon,
    label,
    value,
    good,
}: {
    icon: LucideIcon;
    label: string;
    value: string;
    good: boolean;
}) {
    return (
        <li className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <span
                className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-lg',
                    good
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                        : 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
                )}
            >
                <Icon className="size-5" />
            </span>
            <span className="min-w-0">
                <span className="block text-xs text-muted-foreground">
                    {label}
                </span>
                <span className="block truncate font-medium">{value}</span>
            </span>
        </li>
    );
}

export default function Security(props: Props) {
    const passwordInput = useRef<HTMLInputElement>(null);
    const currentPasswordInput = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Security settings')} />

            <ul className="grid gap-3 pb-4 sm:grid-cols-3 lg:pb-8">
                {props.canManageTwoFactor && (
                    <Status
                        icon={
                            props.twoFactorEnabled ? ShieldCheck : ShieldAlert
                        }
                        label={t('Two-factor authentication')}
                        value={
                            props.twoFactorEnabled
                                ? t('Enabled')
                                : t('Disabled')
                        }
                        good={!!props.twoFactorEnabled}
                    />
                )}
                {props.canManagePasskeys && (
                    <Status
                        icon={KeyRound}
                        label={t('Passkeys')}
                        value={String((props.passkeys ?? []).length)}
                        good={(props.passkeys ?? []).length > 0}
                    />
                )}
                <Status
                    icon={Lock}
                    label={t('Sign in with password')}
                    value={props.passwordLoginEnabled ? t('On') : t('Off')}
                    good
                />
            </ul>

            {props.twoFactorRequired && !props.twoFactorEnabled && (
                <Alert className="mb-4 lg:mb-8">
                    <AlertTitle>
                        {t('Two-factor authentication is required')}
                    </AlertTitle>
                    <AlertDescription>
                        {t(
                            'An administrator made it mandatory for your account. Turn it on below to continue using the application.',
                        )}
                    </AlertDescription>
                </Alert>
            )}

            <ManageTwoFactor
                canManageTwoFactor={props.canManageTwoFactor}
                requiresConfirmation={props.requiresConfirmation}
                twoFactorEnabled={props.twoFactorEnabled}
            />

            <ManagePasskeys
                canManagePasskeys={props.canManagePasskeys}
                passkeys={props.passkeys}
            />

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
                            <div className="grid gap-6 md:grid-cols-3">
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

                                    <InputError
                                        message={errors.current_password}
                                    />
                                </div>

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
            >
                <div className="flex items-center justify-between gap-4">
                    <Label htmlFor="password-login">
                        {props.passwordLoginEnabled ? t('On') : t('Off')}
                    </Label>
                    <Switch
                        id="password-login"
                        checked={props.passwordLoginEnabled}
                        disabled={
                            props.passwordLoginEnabled &&
                            (props.passkeys ?? []).length === 0
                        }
                        data-test="password-login-switch"
                        onCheckedChange={(enabled) =>
                            router.put(
                                SecurityController.updatePasswordLogin.url(),
                                { enabled },
                                { preserveScroll: true },
                            )
                        }
                    />
                </div>
                {props.passwordLoginEnabled &&
                (props.passkeys ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'Add a passkey first, otherwise you could not sign in.',
                        )}
                    </p>
                ) : null}
            </SettingsSection>
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
