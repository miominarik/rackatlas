import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import type { FormEvent } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import InputError from '@/components/input-error';
import { SettingsSection } from '@/components/settings/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { show as showTeam } from '@/routes/admin/teams';
import type { Auth, TeamRole } from '@/types';

type Member = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    verified: boolean;
    two_factor: boolean;
    passkeys: number;
    devices: number;
    created_at: string | null;
    teams: {
        id: number;
        name: string;
        role: TeamRole;
        owned: boolean;
        servers_count: number;
    }[];
};

export default function EditUser({ member }: { member: Member | null }) {
    const { auth } = usePage<{ auth: Auth }>().props;
    const { t } = useTranslation();
    const isSelf = member?.id === auth.user.id;

    const form = useForm({
        name: member?.name ?? '',
        email: member?.email ?? '',
        password: '',
        is_admin: member?.is_admin ?? false,
        email_verified: member?.verified ?? true,
    });

    const errors = form.errors as Record<string, string | undefined>;

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (member) {
            form.put(UserController.update.url(member.id), {
                preserveScroll: true,
                onSuccess: () => form.setData('password', ''),
            });
        } else {
            form.post(UserController.store.url());
        }
    };

    const act = (message: string, run: () => void) => {
        if (window.confirm(message)) {
            run();
        }
    };

    const ownedTeams = member?.teams.filter((team) => team.owned) ?? [];

    return (
        <>
            <Head title={member?.name ?? t('New user')} />

            <div className="max-w-4xl space-y-6">
                <Link
                    href={UserController.index()}
                    className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    {t('Users')}
                </Link>

                <SettingsSection
                    title={member ? member.name : t('New user')}
                    description={
                        member
                            ? member.email
                            : t('The account is created immediately.')
                    }
                >
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="name">{t('Name')}</Label>
                            <Input
                                id="name"
                                value={form.data.name}
                                onChange={(event) =>
                                    form.setData('name', event.target.value)
                                }
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="email">{t('Email')}</Label>
                            <Input
                                id="email"
                                type="email"
                                value={form.data.email}
                                onChange={(event) =>
                                    form.setData('email', event.target.value)
                                }
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="password">
                                {member
                                    ? t('New password (leave empty to keep)')
                                    : t('Password')}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                value={form.data.password}
                                onChange={(event) =>
                                    form.setData('password', event.target.value)
                                }
                                required={!member}
                            />
                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                            <div>
                                <Label htmlFor="is_admin">
                                    {t('Administrator')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Can manage all users and teams of the application.',
                                    )}
                                </p>
                                <InputError message={errors.is_admin} />
                            </div>
                            <Switch
                                id="is_admin"
                                checked={form.data.is_admin}
                                onCheckedChange={(value) =>
                                    form.setData('is_admin', value)
                                }
                                data-test="admin-switch"
                            />
                        </div>

                        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
                            <div>
                                <Label htmlFor="email_verified">
                                    {t('Email verified')}
                                </Label>
                                <p className="text-sm text-muted-foreground">
                                    {t(
                                        'Unverified users cannot open the application.',
                                    )}
                                </p>
                            </div>
                            <Switch
                                id="email_verified"
                                checked={form.data.email_verified}
                                onCheckedChange={(value) =>
                                    form.setData('email_verified', value)
                                }
                            />
                        </div>

                        <Button disabled={form.processing}>
                            {form.processing && <Spinner />}
                            {member ? t('Save') : t('Create user')}
                        </Button>
                    </form>
                </SettingsSection>

                {member && (
                    <>
                        <SettingsSection
                            flush
                            title={t('Teams')}
                            description={t(
                                'Teams this user belongs to (click to manage)',
                            )}
                        >
                            {member.teams.length === 0 ? (
                                <p className="p-6 text-sm text-muted-foreground">
                                    {t('Not a member of any team.')}
                                </p>
                            ) : (
                                <ul className="divide-y">
                                    {member.teams.map((team) => (
                                        <li key={team.id}>
                                            <Link
                                                href={showTeam(team.id)}
                                                className="flex items-center justify-between gap-3 p-4 hover:bg-muted/50 sm:px-6"
                                            >
                                                <span className="font-medium">
                                                    {team.name}
                                                </span>
                                                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                                                    {t(':count servers', {
                                                        count: team.servers_count,
                                                    })}
                                                    <Badge variant="secondary">
                                                        {t(
                                                            team.role ===
                                                                'owner'
                                                                ? 'Owner'
                                                                : team.role ===
                                                                    'admin'
                                                                  ? 'Admin'
                                                                  : 'Member',
                                                        )}
                                                    </Badge>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </SettingsSection>

                        <SettingsSection
                            title={t('Security')}
                            description={t(
                                ':passkeys passkeys, :devices active devices',
                                {
                                    passkeys: member.passkeys,
                                    devices: member.devices,
                                },
                            )}
                        >
                            <div className="flex flex-wrap gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() =>
                                        act(
                                            t(
                                                'Sign :name out on all devices?',
                                                { name: member.name },
                                            ),
                                            () =>
                                                router.post(
                                                    UserController.signOut.url(
                                                        member.id,
                                                    ),
                                                    {},
                                                    { preserveScroll: true },
                                                ),
                                        )
                                    }
                                >
                                    {t('Sign out everywhere')}
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={!member.two_factor}
                                    onClick={() =>
                                        act(
                                            t(
                                                'Turn off two-factor authentication for :name?',
                                                { name: member.name },
                                            ),
                                            () =>
                                                router.delete(
                                                    UserController.resetTwoFactor.url(
                                                        member.id,
                                                    ),
                                                    { preserveScroll: true },
                                                ),
                                        )
                                    }
                                >
                                    {member.two_factor
                                        ? t('Reset two-factor authentication')
                                        : t('Two-factor authentication is off')}
                                </Button>
                            </div>
                        </SettingsSection>

                        <SettingsSection
                            danger
                            title={t('Delete user')}
                            description={
                                ownedTeams.length > 0
                                    ? t(
                                          'The teams owned by this user (:teams) are deleted with all their servers.',
                                          {
                                              teams: ownedTeams
                                                  .map((team) => team.name)
                                                  .join(', '),
                                          },
                                      )
                                    : t('This cannot be undone.')
                            }
                        >
                            <InputError message={errors.delete} />
                            <Button
                                variant="destructive"
                                disabled={isSelf}
                                onClick={() =>
                                    act(
                                        t('Delete :name permanently?', {
                                            name: member.name,
                                        }),
                                        () =>
                                            router.delete(
                                                UserController.destroy.url(
                                                    member.id,
                                                ),
                                            ),
                                    )
                                }
                                data-test="admin-delete-user"
                            >
                                {t('Delete user')}
                            </Button>
                        </SettingsSection>
                    </>
                )}
            </div>
        </>
    );
}
