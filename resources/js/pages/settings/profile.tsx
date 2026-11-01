import { Form, Head, usePage } from '@inertiajs/react';
import { Link } from '@inertiajs/react';
import ProfileController from '@/actions/App/Http/Controllers/Settings/ProfileController';
import DeleteUser from '@/components/delete-user';
import InputError from '@/components/input-error';
import AppearanceSection from '@/components/settings/appearance-section';
import LanguageSection from '@/components/settings/language-section';
import { SettingsSection } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { edit } from '@/routes/profile';
import type { Auth } from '@/types';
import { send } from '@/routes/verification';
import { destroy as disconnectAccount } from '@/routes/connected-accounts';
import { redirect as connectAccount } from '@/routes/social';
import type { ConnectedSocialProvider } from '@/types/social';
import { useTranslation } from '@/hooks/use-translation';

type PageProps = {
    auth: Auth;
};

export default function Profile({
    mustVerifyEmail,
    status,
    socialProviders,
}: {
    mustVerifyEmail: boolean;
    status?: string;
    socialProviders: ConnectedSocialProvider[];
}) {
    const { auth } = usePage<PageProps>().props;
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Profile settings')} />

            <SettingsSection
                title={t('Profile')}
                description={t('Update your name and email address')}
            >
                <Form
                    {...ProfileController.update.form()}
                    options={{
                        preserveScroll: true,
                    }}
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('Name')}</Label>

                                    <Input
                                        id="name"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.name}
                                        name="name"
                                        required
                                        autoComplete="name"
                                        placeholder={t('Full name')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.name}
                                    />
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="email">
                                        {t('Email address')}
                                    </Label>

                                    <Input
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        defaultValue={auth.user.email}
                                        name="email"
                                        required
                                        autoComplete="username"
                                        placeholder={t('Email address')}
                                    />

                                    <InputError
                                        className="mt-2"
                                        message={errors.email}
                                    />
                                </div>
                            </div>

                            {mustVerifyEmail &&
                                auth.user.email_verified_at === null && (
                                    <div>
                                        <p className="-mt-4 text-sm text-muted-foreground">
                                            {t(
                                                'Your email address is unverified.',
                                            )}{' '}
                                            <Link
                                                href={send()}
                                                as="button"
                                                className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                            >
                                                {t(
                                                    'Click here to re-send the verification email.',
                                                )}
                                            </Link>
                                        </p>

                                        {status ===
                                            'verification-link-sent' && (
                                            <div className="mt-2 text-sm font-medium text-green-600">
                                                {t(
                                                    'A new verification link has been sent to your email address.',
                                                )}
                                            </div>
                                        )}
                                    </div>
                                )}

                            <div className="flex items-center gap-4">
                                <Button
                                    disabled={processing}
                                    data-test="update-profile-button"
                                >
                                    {t('Save')}
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </SettingsSection>

            {socialProviders.length > 0 && (
                <SettingsSection
                    title={t('Connected accounts')}
                    description={t(
                        'Sign in faster with an account from another service.',
                    )}
                >
                    <div className="space-y-4">
                        {socialProviders.map((provider) => (
                            <div
                                key={provider.id}
                                className="flex items-center justify-between gap-4"
                            >
                                <div>
                                    <p className="text-sm font-medium">
                                        {provider.name}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {provider.connected
                                            ? (provider.connected_email ??
                                              t('Connected'))
                                            : t('Not connected')}
                                    </p>
                                </div>
                                {provider.connected ? (
                                    <Button
                                        variant="outline"
                                        asChild
                                        data-test={`social-disconnect-${provider.id}`}
                                    >
                                        <Link
                                            href={disconnectAccount(provider.id)}
                                            as="button"
                                            preserveScroll
                                        >
                                            {t('Disconnect')}
                                        </Link>
                                    </Button>
                                ) : (
                                    <Button asChild>
                                        <a
                                            href={connectAccount.url(
                                                provider.id,
                                            )}
                                            data-test={`social-connect-${provider.id}`}
                                        >
                                            {t('Connect')}
                                        </a>
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </SettingsSection>
            )}

            <AppearanceSection />

            <LanguageSection />

            <DeleteUser />
        </>
    );
}

Profile.layout = {
    breadcrumbs: [
        {
            title: 'Profile settings',
            href: edit(),
        },
    ],
};
