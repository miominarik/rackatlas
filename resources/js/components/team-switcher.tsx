import { Link, router, usePage } from '@inertiajs/react';
import { useEffect } from 'react';
import { Check, ChevronsUpDown, Plus, Settings2, Users } from 'lucide-react';
import CurrentTeamController from '@/actions/App/Http/Controllers/CurrentTeamController';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { index } from '@/routes/teams';
import type { SharedTeam } from '@/types';
import { useTranslation } from '@/hooks/use-translation';

const STORAGE_KEY = 'current-team-id';

function readStoredTeamId(): number | null {
    try {
        const value = window.localStorage.getItem(STORAGE_KEY);

        return value ? Number(value) : null;
    } catch {
        return null;
    }
}

function storeTeamId(id: number): void {
    try {
        window.localStorage.setItem(STORAGE_KEY, String(id));
    } catch {
        // Storage can be blocked; the server session still remembers the choice.
    }
}

function selectTeam(id: number): void {
    router.put(
        CurrentTeamController.update.url(),
        { team_id: id },
        { preserveScroll: true, preserveState: true },
    );
}

export function TeamSwitcher() {
    const { t } = useTranslation();
    const { teams, currentTeam } = usePage<{
        teams: SharedTeam[];
        currentTeam: SharedTeam | null;
    }>().props;

    // Restore the team remembered in this browser and keep the server session in sync.
    useEffect(() => {
        const storedId = readStoredTeamId();
        const stored = teams.find((team) => team.id === storedId);

        if (stored && stored.id !== currentTeam?.id) {
            selectTeam(stored.id);
        } else if (currentTeam) {
            storeTeamId(currentTeam.id);
        }
        // Only on first load of the app shell.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (teams.length === 0) {
        return (
            <Button variant="outline" size="sm" asChild>
                <Link href={index()}>
                    <Plus className="size-4" />
                    {t('Create team')}
                </Link>
            </Button>
        );
    }

    const switchTeam = (team: SharedTeam) => {
        if (team.id === currentTeam?.id) {
            return;
        }

        storeTeamId(team.id);
        selectTeam(team.id);
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    className="max-w-56 gap-2"
                    data-test="team-switcher"
                >
                    <Users className="size-4 shrink-0" />
                    <span className="truncate">{currentTeam?.name}</span>
                    <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-60">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                    {t('Teams')}
                </DropdownMenuLabel>
                {teams.map((team) => (
                    <DropdownMenuItem
                        key={team.id}
                        onSelect={() => switchTeam(team)}
                        className="gap-2"
                    >
                        <span className="flex-1 truncate">{team.name}</span>
                        {team.id === currentTeam?.id && (
                            <Check className="size-4" />
                        )}
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                    <Link href={index()} className="gap-2">
                        <Settings2 className="size-4" />
                        {t('Manage teams')}
                    </Link>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
