import { Head, Link, router } from '@inertiajs/react';
import { KeyRound, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import SshKeyController from '@/actions/App/Http/Controllers/Servers/SshKeyController';
import CopyField from '@/components/servers/copy-field';
import SshKeyCreator from '@/components/servers/ssh-key-creator';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { useTranslation } from '@/hooks/use-translation';
import { index as teamsIndex } from '@/routes/teams';
import { index } from '@/routes/ssh-keys';
import type { SshKey } from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    sshKeys: SshKey[];
};

export default function SshKeys({ team, canManage, sshKeys }: Props) {
    const { t } = useTranslation();
    const [creating, setCreating] = useState(false);

    if (!team) {
        return (
            <>
                <Head title={t('SSH keys')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-lg font-semibold">{t('Create a team first')}</h1>
                    <p className="text-sm text-muted-foreground">
                        {t('Servers belong to a team, so you need one before you can add servers.')}
                    </p>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={t('SSH keys')} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:py-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight">
                            {t('SSH keys')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t('One key can be used by many servers of the team :team', {
                                team: team.name,
                            })}
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={() => setCreating(true)}>
                            <Plus className="size-4" />
                            {t('Add key')}
                        </Button>
                    )}
                </div>

                {sshKeys.length === 0 ? (
                    <div className="rounded-xl border border-dashed p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <KeyRound className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{t('No SSH keys yet')}</p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t('Generate a key here or while adding a server.')}
                        </p>
                    </div>
                ) : (
                    <ul className="divide-y rounded-xl border">
                        {sshKeys.map((key) => (
                            <li key={key.id} className="space-y-3 p-4">
                                <div className="flex items-center gap-3">
                                    <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">{key.name}</p>
                                        <p className="truncate font-mono text-xs text-muted-foreground">
                                            {key.fingerprint}
                                        </p>
                                    </div>
                                    <span className="rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium tracking-wide text-muted-foreground uppercase ring-1 ring-border ring-inset">
                                        {key.algorithm}
                                    </span>
                                    <span className="hidden text-xs text-muted-foreground sm:inline">
                                        {t(':count servers', {
                                            count: key.servers_count ?? 0,
                                        })}
                                    </span>
                                    {canManage && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={(key.servers_count ?? 0) > 0}
                                            title={
                                                (key.servers_count ?? 0) > 0
                                                    ? t('This key is used by a server. Change the server first.')
                                                    : undefined
                                            }
                                            aria-label={t('Delete :name', { name: key.name })}
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        t('Delete the key :name?', {
                                                            name: key.name,
                                                        }),
                                                    )
                                                ) {
                                                    router.delete(
                                                        SshKeyController.destroy.url(key.id),
                                                        { preserveScroll: true },
                                                    );
                                                }
                                            }}
                                        >
                                            <Trash2 className="size-4" />
                                        </Button>
                                    )}
                                </div>
                                <CopyField value={key.public_key} />
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <Dialog open={creating} onOpenChange={setCreating}>
                <DialogContent>
                    <DialogTitle>{t('Add an SSH key')}</DialogTitle>
                    <DialogDescription>
                        {t('Generate a new key or import one you already have.')}
                    </DialogDescription>
                    {creating && (
                        <SshKeyCreator
                            doneLabel={t('Done')}
                            onCreated={() => {
                                setCreating(false);
                                router.reload({ only: ['sshKeys'] });
                            }}
                            onCancel={() => setCreating(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}

SshKeys.layout = {
    breadcrumbs: [{ title: 'SSH keys', href: index() }],
};
