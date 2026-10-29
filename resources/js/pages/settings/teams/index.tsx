import { Form, Head, Link } from '@inertiajs/react';
import { ChevronRight, Users } from 'lucide-react';
import TeamController from '@/actions/App/Http/Controllers/Settings/TeamController';
import { SettingsSection } from '@/components/settings/section';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index } from '@/routes/teams';
import type { TeamRole, TeamSummary } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

const roleLabel: Record<TeamRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    member: 'Member',
};

export default function Teams({ teams }: { teams: TeamSummary[] }) {
    const { t } = useTranslation();
    return (
        <>
            <Head title={t('Teams')} />

            <SettingsSection
                title={t('Your teams')}
                description={t('Teams you own or have been invited to')}
                flush={teams.length > 0}
            >
                {teams.length === 0 ? (
                    <p className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                        {t('You are not in any team yet. Create one below.')}
                    </p>
                ) : (
                    <ul className="divide-y">
                        {teams.map((team) => (
                            <li key={team.id}>
                                <Link
                                    href={TeamController.show(team.id)}
                                    className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/50"
                                >
                                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                        <Users className="size-5 text-muted-foreground" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">
                                            {team.name}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {team.members_count === 1
                                                ? t(':count member', {
                                                      count: team.members_count,
                                                  })
                                                : t(':count members', {
                                                      count: team.members_count,
                                                  })}
                                        </p>
                                    </div>
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset">
                                        {t(roleLabel[team.role])}
                                    </span>
                                    <ChevronRight className="size-4 text-muted-foreground" />
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}
            </SettingsSection>

            <SettingsSection
                title={t('Create team')}
                description={t('Group people and, later, servers that belong together')}
            >
                <Form
                    {...TeamController.store.form()}
                    options={{ preserveScroll: true }}
                    resetOnSuccess
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Team name')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    placeholder={t('e.g. Hetzner production')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <Button
                                disabled={processing}
                                data-test="create-team-button"
                            >
                                {processing && <Spinner />}
                                {t('Create team')}
                            </Button>
                        </>
                    )}
                </Form>
            </SettingsSection>
        </>
    );
}

Teams.layout = {
    breadcrumbs: [
        {
            title: 'Teams',
            href: index(),
        },
    ],
};
