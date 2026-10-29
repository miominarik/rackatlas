import { Head, router, useForm } from '@inertiajs/react';
import { BellRing, Mail, Smartphone, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import NotificationController from '@/actions/App/Http/Controllers/Settings/NotificationController';
import PushSubscriptionController from '@/actions/App/Http/Controllers/Settings/PushSubscriptionController';
import Heading from '@/components/heading';
import { PushDiagnostics } from '@/components/notifications/push-diagnostics';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePushSubscription } from '@/hooks/use-push-subscription';
import { useTranslation } from '@/hooks/use-translation';
import { edit } from '@/routes/notifications';

type Preferences = {
    email_enabled: boolean;
    push_enabled: boolean;
    notify_offline: boolean;
    notify_resources: boolean;
    notify_services: boolean;
    notify_logs: boolean;
    notify_recovery: boolean;
};

type Device = {
    id: number;
    name: string | null;
    endpoint_hash: string;
    created_at: string | null;
    last_used_at: string | null;
};

type Props = {
    preferences: Preferences;
    email: string;
    emailVerified: boolean;
    pushAvailable: boolean;
    vapidPublicKey: string | null;
    devices: Device[];
};

function Row({
    id,
    icon,
    title,
    description,
    checked,
    onChange,
    disabled,
}: {
    id: string;
    icon?: ReactNode;
    title: string;
    description?: ReactNode;
    checked: boolean;
    onChange: (value: boolean) => void;
    disabled?: boolean;
}) {
    return (
        <div className="flex items-start gap-3 py-3">
            {icon && <div className="mt-0.5 text-muted-foreground">{icon}</div>}
            <div className="min-w-0 flex-1">
                <Label htmlFor={id} className="text-sm font-medium">
                    {title}
                </Label>
                {description && (
                    <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
                )}
            </div>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
                aria-label={title}
            />
        </div>
    );
}

export default function Notifications({
    preferences,
    email,
    emailVerified,
    pushAvailable,
    vapidPublicKey,
    devices,
}: Props) {
    const { t, locale } = useTranslation();
    const form = useForm<Preferences>(preferences);
    const push = usePushSubscription(
        vapidPublicKey,
        PushSubscriptionController.store.url(),
    );

    const set = (key: keyof Preferences) => (value: boolean) =>
        form.setData(key, value);

    const save = () =>
        form.put(NotificationController.update.url(), { preserveScroll: true });

    const registerDevice = async () => {
        if (await push.subscribe()) {
            router.reload({ only: ['devices'] });
        }
    };

    const removeDevice = async (device: Device) => {
        if (device.endpoint_hash === push.endpointHash) {
            await push.unsubscribe();
        }

        router.delete(PushSubscriptionController.destroy.url(device.id), {
            preserveScroll: true,
        });
    };

    const formatDate = (value: string | null) =>
        value ? new Date(value).toLocaleString(locale) : null;

    const currentRegistered = devices.some(
        (device) => device.endpoint_hash === push.endpointHash,
    );

    return (
        <>
            <Head title={t('Notifications')} />

            <h1 className="sr-only">{t('Notifications')}</h1>

            <div className="space-y-10">
                <section className="space-y-2">
                    <Heading
                        variant="small"
                        title={t('Notifications')}
                        description={t('Get a message when something is wrong on your servers.')}
                    />

                    <div className="divide-y rounded-xl border px-4">
                        <Row
                            id="email_enabled"
                            icon={<Mail className="size-5" />}
                            title={t('Email')}
                            description={
                                emailVerified
                                    ? t('Sent to :email', { email })
                                    : t('Verify your email address to receive notifications by email.')
                            }
                            checked={form.data.email_enabled}
                            onChange={set('email_enabled')}
                        />
                        <Row
                            id="push_enabled"
                            icon={<Smartphone className="size-5" />}
                            title={t('Push notifications')}
                            description={t('Instant messages on your phone or computer, even when the app is closed.')}
                            checked={form.data.push_enabled}
                            onChange={set('push_enabled')}
                        />
                    </div>
                </section>

                <section className="space-y-2">
                    <Heading
                        variant="small"
                        title={t('What to notify about')}
                        description={t('The same choice applies to email and push.')}
                    />

                    <div className="divide-y rounded-xl border px-4">
                        <Row
                            id="notify_offline"
                            title={t('Server is offline')}
                            description={t('The server did not respond for more than 3 minutes.')}
                            checked={form.data.notify_offline}
                            onChange={set('notify_offline')}
                        />
                        <Row
                            id="notify_resources"
                            title={t('Critical resource usage')}
                            description={t('CPU, memory or a disk above the critical limit.')}
                            checked={form.data.notify_resources}
                            onChange={set('notify_resources')}
                        />
                        <Row
                            id="notify_services"
                            title={t('A service failed')}
                            description={t('A systemd unit on the server is in the failed state.')}
                            checked={form.data.notify_services}
                            onChange={set('notify_services')}
                        />
                        <Row
                            id="notify_logs"
                            title={t('Critical errors in the log')}
                            description={t('At most one message every 15 minutes per server.')}
                            checked={form.data.notify_logs}
                            onChange={set('notify_logs')}
                        />
                        <Row
                            id="notify_recovery"
                            title={t('Also tell me when it is resolved')}
                            description={t('One more message when the problem is gone.')}
                            checked={form.data.notify_recovery}
                            onChange={set('notify_recovery')}
                        />
                    </div>

                    <div className="flex flex-wrap gap-2 pt-2">
                        <Button onClick={save} disabled={form.processing || !form.isDirty}>
                            {t('Save')}
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() =>
                                router.post(NotificationController.test.url(), {}, { preserveScroll: true })
                            }
                            disabled={form.isDirty}
                        >
                            <BellRing className="size-4" />
                            {t('Send a test')}
                        </Button>
                    </div>
                </section>

                <section className="space-y-3">
                    <Heading
                        variant="small"
                        title={t('Devices for push')}
                        description={t('Register this browser or phone to receive push notifications.')}
                    />

                    {!pushAvailable ? (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t('Push notifications are not set up on this server yet (VAPID keys are missing).')}
                        </p>
                    ) : push.state === 'unsupported' ? (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t('This browser does not support push notifications. On iPhone, add the app to the home screen first.')}
                        </p>
                    ) : push.state === 'denied' ? (
                        <p className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                            {t('Notifications are blocked for this site. Allow them in the browser settings and reload the page.')}
                        </p>
                    ) : (
                        !currentRegistered && (
                            <div className="space-y-2">
                                <Button onClick={() => void registerDevice()} disabled={push.busy}>
                                    <Smartphone className="size-4" />
                                    {t('Register this device')}
                                </Button>
                                {push.error && (
                                    <p className="text-sm text-destructive">
                                        {push.error === 'error'
                                            ? t('The device could not be registered.')
                                            : push.error}
                                    </p>
                                )}
                            </div>
                        )
                    )}

                    {devices.length > 0 && (
                        <ul className="divide-y rounded-xl border">
                            {devices.map((device) => (
                                <li key={device.id} className="flex items-center gap-3 px-4 py-3">
                                    <Smartphone className="size-5 shrink-0 text-muted-foreground" />
                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium">
                                            {device.name ?? t('Device')}
                                            {device.endpoint_hash === push.endpointHash && (
                                                <span className="ml-2 rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-normal text-primary">
                                                    {t('This device')}
                                                </span>
                                            )}
                                        </p>
                                        <p className="truncate text-xs text-muted-foreground">
                                            {device.last_used_at
                                                ? t('Last used :time', { time: formatDate(device.last_used_at) ?? '' })
                                                : t('Registered :time', { time: formatDate(device.created_at) ?? '' })}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-10 md:size-9"
                                        aria-label={t('Remove device')}
                                        onClick={() => void removeDevice(device)}
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                <PushDiagnostics
                    vapidPublicKey={vapidPublicKey}
                    registeredHashes={devices.map((device) => device.endpoint_hash)}
                    onReregister={async () => {
                        await push.unsubscribe();
                        await push.subscribe();
                        router.reload({ only: ['devices'] });
                    }}
                />
            </div>
        </>
    );
}

Notifications.layout = {
    breadcrumbs: [
        {
            title: 'Notifications',
            href: edit(),
        },
    ],
};
