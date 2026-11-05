import { useHttp } from '@inertiajs/react';
import { useState } from 'react';
import SshKeyController from '@/actions/App/Http/Controllers/Servers/SshKeyController';
import InputError from '@/components/input-error';
import CopyField from '@/components/servers/copy-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import type { SshKey } from '@/types';

type Revealed = { private_key: string; passphrase: string | null };

/**
 * Shows the decrypted private key of a stored SSH key after the user confirmed their password.
 * The secret lives only in this component's state and disappears when the dialog closes.
 */
export default function RevealSshKey({
    sshKey,
    onClose,
}: {
    sshKey: SshKey;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [revealed, setRevealed] = useState<Revealed | null>(null);
    const form = useHttp<{ password: string }, Revealed>({ password: '' });

    const submit = () => {
        void form
            .post(SshKeyController.reveal.url(sshKey.id))
            .then((response) => {
                setRevealed(response);
                form.reset();
            })
            .catch(() => undefined);
    };

    if (revealed) {
        return (
            <div className="space-y-4">
                <p className="rounded-md border border-amber-300 bg-amber-50 p-3 text-sm dark:border-amber-500/30 dark:bg-amber-500/10">
                    {t(
                        'Keep this key secret. Anyone who has it can log in to your servers.',
                    )}
                </p>
                <CopyField
                    label={t('Private key')}
                    value={revealed.private_key}
                />
                {revealed.passphrase && (
                    <CopyField
                        label={t('Passphrase')}
                        value={revealed.passphrase}
                    />
                )}
                <Button type="button" onClick={onClose}>
                    {t('Done')}
                </Button>
            </div>
        );
    }

    return (
        <form
            className="space-y-4"
            onSubmit={(event) => {
                event.preventDefault();
                submit();
            }}
        >
            <div className="grid gap-2">
                <Label htmlFor="reveal-password">{t('Password')}</Label>
                <Input
                    id="reveal-password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    value={form.data.password}
                    onChange={(event) =>
                        form.setData('password', event.target.value)
                    }
                />
                <InputError message={form.errors.password} />
            </div>
            <div className="flex gap-2">
                <Button disabled={form.processing || !form.data.password}>
                    {form.processing && <Spinner />}
                    {t('Show private key')}
                </Button>
                <Button type="button" variant="ghost" onClick={onClose}>
                    {t('Cancel')}
                </Button>
            </div>
        </form>
    );
}
