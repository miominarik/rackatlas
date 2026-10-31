import { Head, Link, router, useForm } from '@inertiajs/react';
import { ArrowLeft, Crown, UserMinus } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import TeamController from '@/actions/App/Http/Controllers/Admin/TeamController';
import InputError from '@/components/input-error';
import { SettingsSection } from '@/components/settings/section';
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
import { useTranslation } from '@/hooks/use-translation';
import { edit as editUser } from '@/routes/admin/users';
import type { TeamMember, TeamRole } from '@/types';

type Props = {
    team: {
        id: number;
        name: string;
        owner_id: number;
        servers_count: number;
        ssh_keys_count: number;
        invitations_count: number;
        created_at: string | null;
    };
    members: (Omit<TeamMember, 'role'> & { role: TeamRole })[];
    assignableRoles: TeamRole[];
};

const roleLabel: Record<TeamRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
};

export default function AdminTeam({ team, members, assignableRoles }: Props) {
    const { t } = useTranslation();
    const [newOwner, setNewOwner] = useState('');

    const rename = useForm({ name: team.name });
    const add = useForm({
        email: '',
        role: (assignableRoles.at(-1) ?? 'member') as string,
    });
    const addErrors = add.errors as Record<string, string | undefined>;

    const submitRename = (event: FormEvent) => {
        event.preventDefault();
        rename.put(TeamController.update.url(team.id), {
            preserveScroll: true,
        });
    };

    const submitAdd = (event: FormEvent) => {
        event.preventDefault();
        add.post(TeamController.addMember.url(team.id), {
            preserveScroll: true,
            onSuccess: () => add.setData('email', ''),
        });
    };

    const nonOwners = members.filter((member) => member.id !== team.owner_id);

    return (
        <>
            <Head title={team.name} />

            <div className="max-w-4xl space-y-6">
                <Link
                    href={TeamController.index()}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    {t('Teams')}
                </Link>

                <SettingsSection
                    title={team.name}
                    description={t(
                        ':servers servers, :keys SSH keys, :invitations pending invitations',
                        {
                            servers: team.servers_count,
                            keys: team.ssh_keys_count,
                            invitations: team.invitations_count,
                        },
                    )}
                >
                    <form onSubmit={submitRename} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('Team name')}</Label>
                            <Input
                                id="name"
                                value={rename.data.name}
                                onChange={(event) =>
                                    rename.setData('name', event.target.value)
                                }
                                required
                            />
                            <InputError message={rename.errors.name} />
                        </div>
                        <Button disabled={rename.processing}>
                            {t('Save')}
                        </Button>
                    </form>
                </SettingsSection>

                <SettingsSection
                    flush
                    title={t('Members')}
                    description={t(
                        'The owner is changed with a transfer of ownership below.',
                    )}
                >
                    <ul className="divide-y">
                        {members.map((member) => {
                            const isOwner = member.id === team.owner_id;

                            return (
                                <li
                                    key={member.id}
                                    className="flex flex-wrap items-center gap-3 p-4 sm:px-6"
                                >
                                    <div className="min-w-0 flex-1">
                                        <Link
                                            href={editUser(member.id)}
                                            className="flex items-center gap-2 truncate font-medium hover:underline"
                                        >
                                            {member.name}
                                            {isOwner && (
                                                <Crown className="size-4 shrink-0 text-amber-500" />
                                            )}
                                        </Link>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {member.email}
                                        </p>
                                    </div>

                                    {isOwner ? (
                                        <span className="text-sm text-muted-foreground">
                                            {t(roleLabel.owner)}
                                        </span>
                                    ) : (
                                        <>
                                            <Select
                                                value={member.role}
                                                onValueChange={(role) =>
                                                    router.put(
                                                        TeamController.updateMember.url(
                                                            {
                                                                team: team.id,
                                                                member: member.id,
                                                            },
                                                        ),
                                                        { role },
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-36">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent avoidCollisions>
                                                    {assignableRoles.map(
                                                        (role) => (
                                                            <SelectItem
                                                                key={role}
                                                                value={role}
                                                            >
                                                                {t(
                                                                    roleLabel[
                                                                        role
                                                                    ],
                                                                )}
                                                            </SelectItem>
                                                        ),
                                                    )}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={t('Remove member')}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            t(
                                                                'Remove :member from :team?',
                                                                {
                                                                    member: member.name,
                                                                    team: team.name,
                                                                },
                                                            ),
                                                        )
                                                    ) {
                                                        router.delete(
                                                            TeamController.removeMember.url(
                                                                {
                                                                    team: team.id,
                                                                    member: member.id,
                                                                },
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }
                                                }}
                                            >
                                                <UserMinus className="size-4" />
                                            </Button>
                                        </>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </SettingsSection>

                <SettingsSection
                    title={t('Add member')}
                    description={t(
                        'The user has to have an account already. No invitation is sent.',
                    )}
                >
                    <form
                        onSubmit={submitAdd}
                        className="grid gap-4 sm:grid-cols-[1fr_10rem_auto] sm:items-end"
                    >
                        <div className="grid gap-2">
                            <Label htmlFor="member_email">{t('Email')}</Label>
                            <Input
                                id="member_email"
                                type="email"
                                value={add.data.email}
                                onChange={(event) =>
                                    add.setData('email', event.target.value)
                                }
                                required
                            />
                            <InputError message={addErrors.email} />
                        </div>
                        <div className="grid gap-2">
                            <Label>{t('Role')}</Label>
                            <Select
                                value={add.data.role}
                                onValueChange={(role) =>
                                    add.setData('role', role)
                                }
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent avoidCollisions>
                                    {assignableRoles.map((role) => (
                                        <SelectItem key={role} value={role}>
                                            {t(roleLabel[role])}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <Button disabled={add.processing}>
                            {add.processing && <Spinner />}
                            {t('Add')}
                        </Button>
                    </form>
                </SettingsSection>

                <SettingsSection
                    title={t('Transfer ownership')}
                    description={t(
                        'The new owner has to be a member. The previous owner becomes an administrator.',
                    )}
                >
                    <div className="flex flex-wrap items-center gap-3">
                        <Select value={newOwner} onValueChange={setNewOwner}>
                            <SelectTrigger className="w-64">
                                <SelectValue
                                    placeholder={t('Choose a member')}
                                />
                            </SelectTrigger>
                            <SelectContent avoidCollisions>
                                {nonOwners.map((member) => (
                                    <SelectItem
                                        key={member.id}
                                        value={String(member.id)}
                                    >
                                        {member.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button
                            variant="outline"
                            disabled={newOwner === ''}
                            onClick={() =>
                                router.put(
                                    TeamController.transferOwnership.url(
                                        team.id,
                                    ),
                                    { user_id: Number(newOwner) },
                                    {
                                        preserveScroll: true,
                                        onSuccess: () => setNewOwner(''),
                                    },
                                )
                            }
                        >
                            {t('Transfer')}
                        </Button>
                    </div>
                </SettingsSection>

                <SettingsSection
                    danger
                    title={t('Delete team')}
                    description={t(
                        'All servers, metrics and SSH keys of the team are deleted. This cannot be undone.',
                    )}
                >
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
                </SettingsSection>
            </div>
        </>
    );
}
