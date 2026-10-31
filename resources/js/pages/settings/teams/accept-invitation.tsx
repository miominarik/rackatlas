import { Form, Head } from '@inertiajs/react';
import AcceptTeamInvitationController from '@/actions/App/Http/Controllers/Settings/AcceptTeamInvitationController';
import { SettingsSection } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { index } from '@/routes/teams';
import type { TeamRole } from '@/types';

type Props = {
    token: string;
    team: string;
    role: TeamRole;
    email: string;
    expired: boolean;
    forThisAccount: boolean;
};

const roleLabel: Record<TeamRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
};

export default function AcceptInvitation({
    token,
    team,
    role,
    email,
    expired,
    forThisAccount,
}: Props) {
    const { t } = useTranslation();

    return (
        <>
            <Head title={t('Team invitation')} />

            <SettingsSection
                title={t('Join :team', { team })}
                description={`${t('Role')}: ${t(roleLabel[role])}`}
            >
                {expired ? (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'This invitation has expired. Ask the team to send a new one.',
                        )}
                    </p>
                ) : !forThisAccount ? (
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'This invitation was sent to a different email address.',
                        )}{' '}
                        {email}
                    </p>
                ) : (
                    <Form
                        {...AcceptTeamInvitationController.accept.form(token)}
                    >
                        {({ processing }) => (
                            <Button
                                disabled={processing}
                                data-test="accept-invitation-button"
                            >
                                {processing && <Spinner />}
                                {t('Accept invitation')}
                            </Button>
                        )}
                    </Form>
                )}
            </SettingsSection>
        </>
    );
}

AcceptInvitation.layout = {
    breadcrumbs: [
        {
            title: 'Teams',
            href: index(),
        },
    ],
};
