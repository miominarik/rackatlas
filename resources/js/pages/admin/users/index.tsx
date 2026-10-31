import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import UserController from '@/actions/App/Http/Controllers/Admin/UserController';
import Pagination from '@/components/admin/pagination';
import type { Paginated } from '@/components/admin/pagination';
import { SettingsSection } from '@/components/settings/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type AdminUserRow = {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    verified: boolean;
    two_factor: boolean;
    teams_count: number;
    created_at: string | null;
};

type Props = {
    users: Paginated<AdminUserRow>;
    filters: { search: string; filter: 'admins' | 'unverified' | null };
    totals: { all: number; admins: number; unverified: number };
};

export default function AdminUsers({ users, filters, totals }: Props) {
    const { t, locale } = useTranslation();
    const [search, setSearch] = useState(filters.search);

    const visit = (next: Partial<Props['filters']>) =>
        router.get(
            UserController.index.url(),
            { ...filters, ...next },
            { preserveState: true, replace: true },
        );

    const chips: {
        key: Props['filters']['filter'];
        label: string;
        count: number;
    }[] = [
        { key: null, label: t('All'), count: totals.all },
        { key: 'admins', label: t('Administrators'), count: totals.admins },
        { key: 'unverified', label: t('Unverified'), count: totals.unverified },
    ];

    return (
        <>
            <Head title={t('Users')} />

            <SettingsSection
                flush
                title={t('Users')}
                description={t(':count users in total', { count: totals.all })}
                action={
                    <Button asChild>
                        <Link href={UserController.create()}>
                            <Plus className="size-4" />
                            {t('New user')}
                        </Link>
                    </Button>
                }
            >
                <div className="flex flex-wrap items-center gap-3 border-b p-4 sm:px-6">
                    <form
                        className="relative min-w-56 flex-1"
                        onSubmit={(event) => {
                            event.preventDefault();
                            visit({ search });
                        }}
                    >
                        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                        <Input
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder={t('Search by name or email')}
                            className="pl-9"
                            data-test="admin-user-search"
                        />
                    </form>
                    <div className="flex gap-1.5">
                        {chips.map((chip) => (
                            <button
                                key={chip.label}
                                type="button"
                                onClick={() => visit({ filter: chip.key })}
                                className={cn(
                                    'rounded-full px-3 py-1.5 text-sm transition-colors',
                                    filters.filter === chip.key
                                        ? 'bg-primary/10 font-medium text-primary'
                                        : 'text-muted-foreground hover:bg-muted',
                                )}
                            >
                                {chip.label}{' '}
                                <span className="text-xs">{chip.count}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {users.data.length === 0 ? (
                    <p className="p-8 text-center text-sm text-muted-foreground">
                        {t('No users found')}
                    </p>
                ) : (
                    <ul className="divide-y">
                        {users.data.map((user) => (
                            <li key={user.id}>
                                <Link
                                    href={UserController.edit(user.id)}
                                    className="flex flex-wrap items-center gap-x-4 gap-y-2 p-4 hover:bg-muted/50 sm:px-6"
                                >
                                    <div className="min-w-0 flex-1">
                                        <p className="flex items-center gap-2 truncate font-medium">
                                            {user.name}
                                            {user.is_admin && (
                                                <ShieldCheck className="size-4 shrink-0 text-primary" />
                                            )}
                                        </p>
                                        <p className="truncate text-sm text-muted-foreground">
                                            {user.email}
                                        </p>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-xs">
                                        {user.is_admin && (
                                            <Badge>{t('Administrator')}</Badge>
                                        )}
                                        {!user.verified && (
                                            <Badge variant="outline">
                                                {t('Unverified')}
                                            </Badge>
                                        )}
                                        {user.two_factor && (
                                            <Badge variant="secondary">
                                                {t('2FA')}
                                            </Badge>
                                        )}
                                        <span className="text-muted-foreground">
                                            {t(':count teams', {
                                                count: user.teams_count,
                                            })}
                                        </span>
                                        {user.created_at && (
                                            <span className="text-muted-foreground">
                                                {new Date(
                                                    user.created_at,
                                                ).toLocaleDateString(locale)}
                                            </span>
                                        )}
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                )}

                <Pagination page={users} />
            </SettingsSection>
        </>
    );
}
