import { Form, Head, router, usePage } from '@inertiajs/react';
import { Mail, RefreshCw, Trash2, UserMinus } from 'lucide-react';
import TeamController from '@/actions/App/Http/Controllers/Settings/TeamController';
import TeamInvitationController from '@/actions/App/Http/Controllers/Settings/TeamInvitationController';
import TeamMemberController from '@/actions/App/Http/Controllers/Settings/TeamMemberController';
import { SettingsSection } from '@/components/settings/section';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Spinner } from '@/components/ui/spinner';
import { index, show } from '@/routes/teams';
import type {
    Auth,
    TeamInvitation,
    TeamMember,
    TeamRole,
} from '@/types';
import { useTranslation } from '@/hooks/use-translation';

type Props = {
    team: { id: number; name: string; owner_id: number };
    role: TeamRole;
    canManage: boolean;
    canDelete: boolean;
    members: TeamMember[];
    invitations: TeamInvitation[];
    assignableRoles: TeamRole[];
};

const roleLabel: Record<TeamRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
};

export default function ShowTeam({
    team,
    canManage,
    canDelete,
    members,
    invitations,
    assignableRoles,
}: Props) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t, locale } = useTranslation();

    const changeRole = (member: TeamMember, role: string) => {
        router.patch(
            TeamMemberController.update.url({ team: team.id, member: member.id }),
            { role },
            { preserveScroll: true },
        );
    };

    const removeMember = (member: TeamMember) => {
        const leaving = member.id === auth.user.id;

        if (
            !window.confirm(
                leaving
                    ? t('Leave :team?', { team: team.name })
                    : t('Remove :member from :team?', {
                          member: member.name,
                          team: team.name,
                      }),
            )
        ) {
            return;
        }

        router.delete(
            TeamMemberController.destroy.url({
                team: team.id,
                member: member.id,
            }),
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title={team.name} />

            {canManage && (
                <SettingsSection
                    title={t('Team name')}
                    description={t('Rename the team')}
                >
                    <Form
                        {...TeamController.update.form(team.id)}
                        options={{ preserveScroll: true }}
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-2">
                                    <Label htmlFor="name">{t('Name')}</Label>
                                    <Input
                                        id="name"
                                        name="name"
                                        defaultValue={team.name}
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <Button disabled={processing}>{t('Save')}</Button>
                            </>
                        )}
                    </Form>
                </SettingsSection>
            )}

            <SettingsSection
                flush
                title={t('Members')}
                description={
                    canManage
                        ? t('People in this team and what they are allowed to do')
                        : team.name
                }
            >
                <ul className="divide-y">
                    {members.map((member) => {
                        const isSelf = member.id === auth.user.id;
                        const isOwner = member.role === 'owner';

                        return (
                            <li
                                key={member.id}
                                className="flex items-center gap-4 p-4"
                            >
                                <div className="min-w-0 flex-1">
                                    <p className="truncate font-medium">
                                        {member.name}
                                        {isSelf && (
                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                {t('(you)')}
                                            </span>
                                        )}
                                    </p>
                                    <p className="truncate text-sm text-muted-foreground">
                                        {member.email}
                                    </p>
                                </div>

                                {canManage && !isOwner ? (
                                    <Select
                                        value={member.role}
                                        onValueChange={(role) =>
                                            changeRole(member, role)
                                        }
                                    >
                                        <SelectTrigger className="w-28">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {assignableRoles.map((role) => (
                                                <SelectItem
                                                    key={role}
                                                    value={role}
                                                >
                                                    {t(roleLabel[role])}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset">
                                        {t(roleLabel[member.role])}
                                    </span>
                                )}

                                {!isOwner && (canManage || isSelf) && (
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeMember(member)}
                                        aria-label={
                                            isSelf
                                                ? t('Leave team')
                                                : t('Remove :member', {
                                                      member: member.name,
                                                  })
                                        }
                                    >
                                        <UserMinus className="size-4" />
                                    </Button>
                                )}
                            </li>
                        );
                    })}
                </ul>
            </SettingsSection>

            {canManage && (
                <SettingsSection
                    title={t('Invite people')}
                    description={t(
                        'They get an email with a link that is valid for 7 days. They have to use the invited email address.',
                    )}
                >
                    <Form
                        {...TeamInvitationController.store.form(team.id)}
                        options={{ preserveScroll: true }}
                        resetOnSuccess
                        className="space-y-6"
                    >
                        {({ processing, errors }) => (
                            <>
                                <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
                                    <div className="grid gap-2">
                                        <Label htmlFor="invite-email">
                                            {t('Email address')}
                                        </Label>
                                        <Input
                                            id="invite-email"
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="colleague@example.com"
                                        />
                                        <InputError message={errors.email} />
                                    </div>

                                    <div className="grid gap-2">
                                        <Label htmlFor="invite-role">
                                            {t('Role')}
                                        </Label>
                                        <Select
                                            name="role"
                                            defaultValue="member"
                                        >
                                            <SelectTrigger id="invite-role">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {assignableRoles.map(
                                                    (role) => (
                                                        <SelectItem
                                                            key={role}
                                                            value={role}
                                                        >
                                                            {t(roleLabel[role])}
                                                        </SelectItem>
                                                    ),
                                                )}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.role} />
                                    </div>
                                </div>

                                <Button
                                    disabled={processing}
                                    data-test="send-invitation-button"
                                >
                                    {processing && <Spinner />}
                                    {t('Send invitation')}
                                </Button>
                            </>
                        )}
                    </Form>

                    {invitations.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium">
                                {t('Pending invitations')}
                            </h3>
                            <ul className="divide-y rounded-lg border">
                                {invitations.map((invitation) => (
                                    <li
                                        key={invitation.id}
                                        className="flex items-center gap-4 p-4"
                                    >
                                        <Mail className="size-4 shrink-0 text-muted-foreground" />
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {invitation.email}
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                {t(roleLabel[invitation.role])} ·{' '}
                                                {invitation.expired
                                                    ? t('expired')
                                                    : t('expires :date', {
                                                          date: new Date(
                                                              invitation.expires_at,
                                                          ).toLocaleDateString(
                                                              locale,
                                                          ),
                                                      })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('Resend invitation to :email', {
                                                email: invitation.email,
                                            })}
                                            onClick={() =>
                                                router.post(
                                                    TeamInvitationController.resend.url(
                                                        {
                                                            team: team.id,
                                                            invitation:
                                                                invitation.id,
                                                        },
                                                    ),
                                                    {},
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <RefreshCw className="size-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            aria-label={t('Cancel invitation to :email', {
                                                email: invitation.email,
                                            })}
                                            onClick={() =>
                                                router.delete(
                                                    TeamInvitationController.destroy.url(
                                                        {
                                                            team: team.id,
                                                            invitation:
                                                                invitation.id,
                                                        },
                                                    ),
                                                    { preserveScroll: true },
                                                )
                                            }
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </SettingsSection>
            )}

            {canDelete && (
                <SettingsSection
                    danger
                    title={t('Delete team')}
                    description={t(
                        'Removes the team and all memberships and invitations',
                    )}
                >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {t('This cannot be undone.')}
                        </p>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        t('Delete :team permanently?', {
                                            team: team.name,
                                        }),
                                    )
                                ) {
                                    router.delete(
                                        TeamController.destroy.url(team.id),
                                    );
                                }
                            }}
                        >
                            {t('Delete team')}
                        </Button>
                    </div>
                </SettingsSection>
            )}
        </>
    );
}

ShowTeam.layout = (props: { team: { id: number; name: string } }) => ({
    breadcrumbs: [
        { title: 'Teams', href: index() },
        { title: props.team.name, href: show(props.team.id) },
    ],
});
