import { Head, Link, router, useForm } from '@inertiajs/react';
import { DatabaseBackup, Pencil, Plus, RefreshCw, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import BackupController from '@/actions/App/Http/Controllers/BackupController';
import InputError from '@/components/input-error';
import CopyField from '@/components/servers/copy-field';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { index as teamsIndex } from '@/routes/teams';
import type { Backup } from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    servers: { id: number; name: string }[];
    backups: Backup[];
};

type FormData = {
    name: string;
    is_active: boolean;
    notes: string;
    server_id: string;
    expected_interval_hours: string;
};

const formatSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unit = 0;

    while (value >= 1024 && unit < units.length - 1) {
        value /= 1024;
        unit++;
    }

    return `${value.toFixed(unit === 0 ? 0 : 1)} ${units[unit]}`;
};

const fieldClass =
    'w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

function BackupDialog({
    backup,
    servers,
    open,
    onClose,
}: {
    backup: Backup | null;
    servers: Props['servers'];
    open: boolean;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const form = useForm<FormData>({
        name: backup?.name ?? '',
        is_active: backup?.is_active ?? true,
        notes: backup?.notes ?? '',
        server_id: backup?.server_id ? String(backup.server_id) : '',
        expected_interval_hours: backup?.expected_interval_hours
            ? String(backup.expected_interval_hours)
            : '',
    });

    const submit = (event: FormEvent) => {
        event.preventDefault();

        const options = {
            preserveScroll: true,
            onSuccess: () => onClose(),
        };

        if (backup) {
            form.put(BackupController.update.url(backup.id), options);
        } else {
            form.post(BackupController.store.url(), options);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(value) => !value && onClose()}>
            <DialogContent>
                <DialogTitle>
                    {backup ? t('Edit backup') : t('Add backup')}
                </DialogTitle>
                <DialogDescription>
                    {t(
                        'The webhook URL is generated after saving. Call it from your backup script when the backup finishes.',
                    )}
                </DialogDescription>

                <form onSubmit={submit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="backup-name">{t('Name')}</Label>
                        <Input
                            id="backup-name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            autoFocus
                        />
                        <InputError message={form.errors.name} />
                    </div>

                    <div className="flex items-start justify-between gap-4 rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label htmlFor="backup-active">{t('Active')}</Label>
                            <p className="text-xs text-muted-foreground">
                                {t(
                                    'A paused backup is not checked, sends no notifications and is hidden from the dashboard.',
                                )}
                            </p>
                        </div>
                        <Switch
                            id="backup-active"
                            checked={form.data.is_active}
                            onCheckedChange={(value) =>
                                form.setData('is_active', value)
                            }
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="backup-server">
                            {t('Server (optional)')}
                        </Label>
                        <select
                            id="backup-server"
                            className={fieldClass}
                            value={form.data.server_id}
                            onChange={(e) =>
                                form.setData('server_id', e.target.value)
                            }
                        >
                            <option value="">—</option>
                            {servers.map((server) => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={form.errors.server_id} />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="backup-interval">
                            {t('Expected every (hours)')}
                        </Label>
                        <Input
                            id="backup-interval"
                            type="number"
                            min={1}
                            placeholder="24"
                            value={form.data.expected_interval_hours}
                            onChange={(e) =>
                                form.setData(
                                    'expected_interval_hours',
                                    e.target.value,
                                )
                            }
                        />
                        <p className="text-xs text-muted-foreground">
                            {t(
                                'If no run is reported in this time, the backup is marked as overdue.',
                            )}
                        </p>
                        <InputError
                            message={form.errors.expected_interval_hours}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="backup-notes">{t('Notes')}</Label>
                        <textarea
                            id="backup-notes"
                            rows={3}
                            className={fieldClass}
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                        />
                        <InputError message={form.errors.notes} />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="ghost" onClick={onClose}>
                            {t('Cancel')}
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {t('Save')}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export default function Backups({ team, canManage, servers, backups }: Props) {
    const { t } = useTranslation();
    const [editing, setEditing] = useState<Backup | 'new' | null>(null);

    if (!team) {
        return (
            <>
                <Head title={t('Backups')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-xl font-semibold">
                        {t('Create a team first')}
                    </h1>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title={t('Backups')} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Backups')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Each backup has a webhook URL. Your script calls it when the backup finishes.',
                            )}
                        </p>
                    </div>
                    {canManage && (
                        <Button onClick={() => setEditing('new')}>
                            <Plus className="size-4" />
                            {t('Add backup')}
                        </Button>
                    )}
                </div>

                {backups.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <DatabaseBackup className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">{t('No backups yet')}</p>
                    </div>
                ) : (
                    <ul className="grid items-start gap-3 lg:grid-cols-2">
                        {backups.map((backup) => (
                            <li
                                key={backup.id}
                                className={cn(
                                    'space-y-3 rounded-xl border bg-card p-4',
                                    !backup.is_active && 'opacity-60',
                                )}
                            >
                                <div className="flex items-start gap-3">
                                    <DatabaseBackup className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate font-medium">
                                            {backup.name}
                                        </p>
                                        {backup.server_name && (
                                            <p className="truncate text-xs text-muted-foreground">
                                                {backup.server_name}
                                            </p>
                                        )}
                                    </div>
                                    {!backup.is_active ? (
                                        <Badge variant="outline">
                                            {t('Paused')}
                                        </Badge>
                                    ) : backup.last_status === 'failed' ? (
                                        <Badge variant="destructive">
                                            {t('Failed')}
                                        </Badge>
                                    ) : backup.overdue ? (
                                        <Badge variant="destructive">
                                            {t('Overdue')}
                                        </Badge>
                                    ) : backup.last_run_at ? (
                                        <Badge variant="secondary">
                                            {t('OK')}
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline">
                                            {t('Waiting for first run')}
                                        </Badge>
                                    )}
                                    {canManage && (
                                        <>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={t('Edit')}
                                                onClick={() =>
                                                    setEditing(backup)
                                                }
                                            >
                                                <Pencil className="size-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                aria-label={t('Delete :name', {
                                                    name: backup.name,
                                                })}
                                                onClick={() => {
                                                    if (
                                                        window.confirm(
                                                            t(
                                                                'Delete the backup :name?',
                                                                {
                                                                    name: backup.name,
                                                                },
                                                            ),
                                                        )
                                                    ) {
                                                        router.delete(
                                                            BackupController.destroy.url(
                                                                backup.id,
                                                            ),
                                                            {
                                                                preserveScroll: true,
                                                            },
                                                        );
                                                    }
                                                }}
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>

                                <dl className="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <dt className="text-xs text-muted-foreground">
                                            {t('Last run')}
                                        </dt>
                                        <dd>
                                            {backup.last_run_at
                                                ? new Date(
                                                      backup.last_run_at,
                                                  ).toLocaleString()
                                                : '—'}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-xs text-muted-foreground">
                                            {t('Size')}
                                        </dt>
                                        <dd>
                                            {backup.last_size_bytes !== null
                                                ? formatSize(
                                                      backup.last_size_bytes,
                                                  )
                                                : '—'}
                                        </dd>
                                    </div>
                                </dl>

                                {backup.last_message && (
                                    <p className="text-xs break-words text-muted-foreground">
                                        {backup.last_message}
                                    </p>
                                )}
                                {backup.notes && (
                                    <p className="text-sm whitespace-pre-line">
                                        {backup.notes}
                                    </p>
                                )}

                                {canManage && (
                                    <>
                                        <CopyField
                                            label={t('Webhook URL')}
                                            value={backup.webhook_url}
                                        />
                                        <CopyField
                                            value={`curl -fsS "${backup.webhook_url}?status=success"`}
                                        />
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => {
                                                if (
                                                    window.confirm(
                                                        t(
                                                            'Generate a new URL? The old one stops working.',
                                                        ),
                                                    )
                                                ) {
                                                    router.post(
                                                        BackupController.regenerate.url(
                                                            backup.id,
                                                        ),
                                                        {},
                                                        {
                                                            preserveScroll: true,
                                                        },
                                                    );
                                                }
                                            }}
                                        >
                                            <RefreshCw className="size-4" />
                                            {t('Regenerate URL')}
                                        </Button>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {editing !== null && (
                <BackupDialog
                    key={editing === 'new' ? 'new' : editing.id}
                    backup={editing === 'new' ? null : editing}
                    servers={servers}
                    open
                    onClose={() => setEditing(null)}
                />
            )}
        </>
    );
}
