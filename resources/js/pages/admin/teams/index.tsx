import { Head, Link, router, useForm } from '@inertiajs/react';
import { Plus, Search } from 'lucide-react';
import type { FormEvent } from 'react';
import { useState } from 'react';
import TeamController from '@/actions/App/Http/Controllers/Admin/TeamController';
import Pagination from '@/components/admin/pagination';
import type { Paginated } from '@/components/admin/pagination';
import InputError from '@/components/input-error';
import { SettingsSection } from '@/components/settings/section';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';

type AdminTeamRow = {
    id: number;
    name: string;
    owner: { id: number; name: string; email: string } | null;
    members_count: number;
    servers_count: number;
    created_at: string | null;
};

type Props = {
    adminTeams: Paginated<AdminTeamRow>;
    filters: { search: string };
    totals: { all: number };
};

export default function AdminTeams({
    adminTeams: teams,
    filters,
    totals,
}: Props) {
    const { t } = useTranslation();
    const [search, setSearch] = useState(filters.search);
    const [creating, setCreating] = useState(false);

    const form = useForm({ name: '', owner_email: '' });

    const create = (event: FormEvent) => {
        event.preventDefault();
        form.post(TeamController.store.url());
    };

    return (
        <>
            <Head title={t('Teams')} />

            <div className="space-y-6">
                {creating && (
                    <SettingsSection
                        title={t('New team')}
                        description={t(
                            'The owner has to be an existing user of the application.',
                        )}
                    >
                        <form onSubmit={create} className="space-y-6">
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
                                <InputError message={form.errors.name} />
                            </div>
                            <div className="grid gap-2">
                                <Label htmlFor="owner_email">
                                    {t('Owner email')}
                                </Label>
                                <Input
                                    id="owner_email"
                                    type="email"
                                    value={form.data.owner_email}
                                    onChange={(event) =>
                                        form.setData(
                                            'owner_email',
                                            event.target.value,
                                        )
                                    }
                                    required
                                />
                                <InputError message={form.errors.owner_email} />
                            </div>
                            <div className="flex gap-3">
                                <Button disabled={form.processing}>
                                    {form.processing && <Spinner />}
                                    {t('Create team')}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setCreating(false)}
                                >
                                    {t('Cancel')}
                                </Button>
                            </div>
                        </form>
                    </SettingsSection>
                )}

                <SettingsSection
                    flush
                    title={t('Teams')}
                    description={t(':count teams in total', {
                        count: totals.all,
                    })}
                    action={
                        !creating && (
                            <Button onClick={() => setCreating(true)}>
                                <Plus className="size-4" />
                                {t('New team')}
                            </Button>
                        )
                    }
                >
                    <form
                        className="relative border-b p-4 sm:px-6"
                        onSubmit={(event) => {
                            event.preventDefault();
                            router.get(
                                TeamController.index.url(),
                                { search },
                                { preserveState: true, replace: true },
                            );
                        }}
                    >
                        <Search className="absolute top-6.5 left-7 size-4 text-muted-foreground sm:left-9" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('Search by team or owner')}
                            className="pl-9"
                        />
                    </form>

                    {teams.data.length === 0 ? (
                        <p className="p-8 text-center text-sm text-muted-foreground">
                            {t('No teams found')}
                        </p>
                    ) : (
                        <ul className="divide-y">
                            {teams.data.map((team) => (
                                <li key={team.id}>
                                    <Link
                                        href={TeamController.show(team.id)}
                                        className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 hover:bg-muted/50 sm:px-6"
                                    >
                                        <div className="min-w-0 flex-1">
                                            <p className="truncate font-medium">
                                                {team.name}
                                            </p>
                                            <p className="truncate text-sm text-muted-foreground">
                                                {team.owner
                                                    ? `${team.owner.name} · ${team.owner.email}`
                                                    : '—'}
                                            </p>
                                        </div>
                                        <div className="flex gap-4 text-sm text-muted-foreground">
                                            <span>
                                                {t(':count members', {
                                                    count: team.members_count,
                                                })}
                                            </span>
                                            <span>
                                                {t(':count servers', {
                                                    count: team.servers_count,
                                                })}
                                            </span>
                                        </div>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}

                    <Pagination page={teams} />
                </SettingsSection>
            </div>
        </>
    );
}
