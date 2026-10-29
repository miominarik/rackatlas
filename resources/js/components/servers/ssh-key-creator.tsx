import { useHttp } from '@inertiajs/react';
import { KeyRound, Sparkles, Upload } from 'lucide-react';
import { useState } from 'react';
import SshKeyController from '@/actions/App/Http/Controllers/Servers/SshKeyController';
import CopyField from '@/components/servers/copy-field';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import type { SshKey } from '@/types';

type Mode = 'generate' | 'import';

type Props = {
    suggestedName?: string;
    onCreated: (key: SshKey) => void;
    onCancel?: () => void;
    doneLabel?: string;
};

export default function SshKeyCreator({
    suggestedName = '',
    onCreated,
    onCancel,
    doneLabel,
}: Props) {
    const { t } = useTranslation();
    const [created, setCreated] = useState<SshKey | null>(null);
    const form = useHttp<
        { mode: Mode; name: string; private_key: string; passphrase: string },
        { key: SshKey }
    >({
        mode: 'generate',
        name: suggestedName,
        private_key: '',
        passphrase: '',
    });

    const submit = () => {
        void form
            .post(SshKeyController.store.url())
            .then((response) => setCreated(response.key))
            .catch(() => undefined);
    };

    if (created) {
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                    <KeyRound className="size-4" />
                    {t('Key ":name" is ready.', { name: created.name })}
                </div>
                <CopyField label={t('Public key')} value={created.public_key} />
                <p className="text-sm text-muted-foreground">
                    {t(
                        'Add this public key to the ~/.ssh/authorized_keys file of the user you connect as. The private key stays encrypted in RackAtlas.',
                    )}
                </p>
                <Button type="button" onClick={() => onCreated(created)}>
                    {doneLabel ?? t('Use this key')}
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted p-1">
                {(
                    [
                        ['generate', t('Generate new key'), Sparkles],
                        ['import', t('Import existing key'), Upload],
                    ] as const
                ).map(([value, label, Icon]) => (
                    <button
                        key={value}
                        type="button"
                        onClick={() => {
                            form.setData('mode', value);
                            form.clearErrors();
                        }}
                        className={cn(
                            'flex items-center justify-center gap-2 rounded-md px-3 py-1.5 text-sm transition-colors',
                            form.data.mode === value
                                ? 'bg-background font-medium shadow-xs'
                                : 'text-muted-foreground hover:text-foreground',
                        )}
                    >
                        <Icon className="size-4" />
                        {label}
                    </button>
                ))}
            </div>

            <div className="grid gap-2">
                <Label htmlFor="key-name">{t('Key name')}</Label>
                <Input
                    id="key-name"
                    value={form.data.name}
                    onChange={(e) => form.setData('name', e.target.value)}
                    placeholder={t('e.g. Hetzner deploy key')}
                />
                <InputError message={form.errors.name} />
            </div>

            {form.data.mode === 'generate' ? (
                <p className="text-sm text-muted-foreground">
                    {t(
                        'We create a secure Ed25519 key pair. You only need to copy the public key to your server.',
                    )}
                </p>
            ) : (
                <>
                    <div className="grid gap-2">
                        <Label htmlFor="private-key">{t('Private key')}</Label>
                        <textarea
                            id="private-key"
                            rows={6}
                            value={form.data.private_key}
                            onChange={(e) =>
                                form.setData('private_key', e.target.value)
                            }
                            placeholder="-----BEGIN OPENSSH PRIVATE KEY-----"
                            className="w-full rounded-md border border-input bg-transparent px-3 py-2 font-mono text-xs shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                            spellCheck={false}
                        />
                        <InputError message={form.errors.private_key} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="passphrase">
                            {t('Passphrase (optional)')}
                        </Label>
                        <PasswordInput
                            id="passphrase"
                            value={form.data.passphrase}
                            onChange={(e) =>
                                form.setData('passphrase', e.target.value)
                            }
                            autoComplete="off"
                        />
                        <InputError message={form.errors.passphrase} />
                    </div>
                </>
            )}

            <div className="flex gap-2">
                <Button
                    type="button"
                    onClick={submit}
                    disabled={form.processing}
                    data-test="create-ssh-key-button"
                >
                    {form.processing && <Spinner />}
                    {form.data.mode === 'generate'
                        ? t('Generate key')
                        : t('Import key')}
                </Button>
                {onCancel && (
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        {t('Cancel')}
                    </Button>
                )}
            </div>
        </div>
    );
}
