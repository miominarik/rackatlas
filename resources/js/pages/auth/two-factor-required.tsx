import { Head, Link } from '@inertiajs/react';
import { ShieldAlert } from 'lucide-react';
import ManageTwoFactor from '@/components/manage-two-factor';
import { useTranslation } from '@/hooks/use-translation';
import { logout } from '@/routes';

type Props = {
    canManageTwoFactor: boolean;
    twoFactorEnabled: boolean;
    requiresConfirmation: boolean;
};

export default function TwoFactorRequired(props: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Two-factor authentication is required')} />

            <div
                role="alert"
                className="flex items-start gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm"
            >
                <ShieldAlert className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-400" />
                <p>
                    {t(
                        'An administrator made two-factor authentication mandatory for your account. Until you turn it on, the rest of the app is locked.',
                    )}
                </p>
            </div>

            <ManageTwoFactor {...props} />

            <div className="text-center text-sm text-muted-foreground">
                <Link
                    href={logout()}
                    as="button"
                    className="underline underline-offset-4"
                    data-test="logout-button"
                >
                    {t('Log out')}
                </Link>
            </div>
        </>
    );
}

TwoFactorRequired.layout = {
    title: 'Two-factor authentication is required',
    description: 'Set it up now, it takes a minute.',
};
