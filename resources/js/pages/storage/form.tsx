import { Form, Head, Link } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { dashboard } from '@/routes';
import { index, show, store, update } from '@/routes/storage';

type Props = {
    monitor: {
        id: number;
        name: string;
        account: string;
        container: string;
        check_interval: number;
    } | null;
};

export default function StorageForm({ monitor }: Props) {
    const { t } = useTranslation();
    const editing = monitor !== null;

    return (
        <>
            <Head title={editing ? t('Edit storage') : t('Add storage')} />

            <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:p-6">
                <div>
                    <h1 className="text-2xl font-semibold">
                        {editing ? t('Edit storage') : t('Add storage')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t(
                            'RackAtlas lists the container with a SAS token. The token is stored encrypted and is never shown again.',
                        )}
                    </p>
                </div>

                <Form
                    {...(editing ? update.form(monitor.id) : store.form())}
                    disableWhileProcessing
                    className="space-y-6"
                >
                    {({ processing, errors }) => (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Name')}</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    required
                                    defaultValue={monitor?.name}
                                    placeholder={t('Backups')}
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-6 md:grid-cols-2">
                                <div className="grid gap-2">
                                    <Label htmlFor="account">
                                        {t('Storage account')}
                                    </Label>
                                    <Input
                                        id="account"
                                        name="account"
                                        required
                                        autoCapitalize="none"
                                        defaultValue={monitor?.account}
                                        placeholder="mystorageaccount"
                                    />
                                    <InputError message={errors.account} />
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="container">
                                        {t('Container')}
                                    </Label>
                                    <Input
                                        id="container"
                                        name="container"
                                        required
                                        autoCapitalize="none"
                                        defaultValue={monitor?.container}
                                        placeholder="backups"
                                    />
                                    <InputError message={errors.container} />
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="sas_token">
                                    {t('SAS token')}
                                </Label>
                                <Input
                                    id="sas_token"
                                    name="sas_token"
                                    type="password"
                                    autoComplete="off"
                                    required={!editing}
                                    placeholder={
                                        editing
                                            ? t(
                                                  'Leave empty to keep the current token',
                                              )
                                            : 'sv=2024-11-04&sp=rl&sig=…'
                                    }
                                />
                                <InputError message={errors.sas_token} />
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'In the Azure portal open the storage account → Shared access signature (or the container → Shared access tokens). Allow only Read and List, and the Blob service. You can paste the whole token or URL.',
                                    )}
                                </p>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="check_interval">
                                    {t('Check every (minutes)')}
                                </Label>
                                <Input
                                    id="check_interval"
                                    name="check_interval"
                                    type="number"
                                    min={1}
                                    max={1440}
                                    required
                                    className="max-w-40"
                                    defaultValue={monitor?.check_interval ?? 5}
                                />
                                <InputError message={errors.check_interval} />
                                <p className="text-xs text-muted-foreground">
                                    {t(
                                        'From 1 to 1440 minutes. A shorter interval finds a problem sooner, but asks Azure more often.',
                                    )}
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button type="submit">
                                    {processing && <Spinner />}
                                    {editing ? t('Save') : t('Add storage')}
                                </Button>
                                <Button variant="ghost" asChild>
                                    <Link
                                        href={
                                            editing ? show(monitor.id) : index()
                                        }
                                    >
                                        {t('Cancel')}
                                    </Link>
                                </Button>
                            </div>
                        </>
                    )}
                </Form>
            </div>
        </>
    );
}

StorageForm.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard() },
        { title: 'Storage', href: index() },
    ],
};
