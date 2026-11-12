import { Head, router } from '@inertiajs/react';
import {
    Bell,
    Check,
    Fingerprint,
    LogOut,
    Pencil,
    Smartphone,
    Tablet,
    Laptop,
    X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import DeviceController from '@/actions/App/Http/Controllers/Settings/DeviceController';
import { SettingsSection } from '@/components/settings/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/hooks/use-translation';
import { timeAgo } from '@/lib/dashboard';
import {
    authenticateWithBiometrics,
    biometricsAvailable,
    isNativeApp,
} from '@/lib/native';
import { cn } from '@/lib/utils';
import { index } from '@/routes/devices';

type Device = {
    id: number;
    name: string | null;
    label: string;
    browser: string | null;
    platform: string | null;
    type: 'mobile' | 'tablet' | 'desktop';
    ip_address: string | null;
    last_active_at: string | null;
    created_at: string | null;
    is_current: boolean;
    has_push: boolean;
    biometrics_enabled: boolean;
};

const icons = { mobile: Smartphone, tablet: Tablet, desktop: Laptop } as const;

function Detail({ label, children }: { label: string; children: string }) {
    return (
        <div className="flex justify-between gap-4">
            <dt className="shrink-0 text-muted-foreground">{label}</dt>
            <dd className="min-w-0 truncate text-right">{children}</dd>
        </div>
    );
}

function DeviceCard({
    device,
    generatedAt,
}: {
    device: Device;
    generatedAt: string;
}) {
    const { t, locale } = useTranslation();
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(device.name ?? '');
    const Icon = icons[device.type];
    const [canUseBiometrics, setCanUseBiometrics] = useState(false);

    useEffect(() => {
        if (device.is_current && isNativeApp()) {
            void biometricsAvailable().then(setCanUseBiometrics);
        }
    }, [device.is_current]);

    const toggleBiometrics = async (enabled: boolean) => {
        if (
            enabled &&
            !(await authenticateWithBiometrics(t('Turn on biometric unlock')))
        ) {
            return;
        }

        router.put(
            DeviceController.updateBiometrics.url(),
            { enabled },
            { preserveScroll: true },
        );
    };
    const detail = [device.browser, device.platform]
        .filter(Boolean)
        .join(' · ');

    const save = () => {
        router.patch(
            DeviceController.update.url(device.id),
            { name },
            { preserveScroll: true, onSuccess: () => setEditing(false) },
        );
    };

    const signOut = () => {
        if (window.confirm(t('Sign out :device?', { device: device.label }))) {
            router.delete(DeviceController.destroy.url(device.id), {
                preserveScroll: true,
            });
        }
    };

    return (
        <li
            className={cn(
                'flex flex-col gap-4 rounded-xl border bg-card p-4',
                device.is_current && 'border-primary/40 bg-primary/[0.03]',
            )}
        >
            <div className="flex items-start gap-3">
                <div
                    className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-xl',
                        device.is_current
                            ? 'bg-primary/10 text-primary'
                            : 'bg-muted text-muted-foreground',
                    )}
                >
                    <Icon className="size-5" />
                </div>

                <div className="min-w-0 flex-1">
                    {editing ? (
                        <form
                            className="flex items-center gap-2"
                            onSubmit={(event) => {
                                event.preventDefault();
                                save();
                            }}
                        >
                            <Input
                                value={name}
                                onChange={(event) =>
                                    setName(event.target.value)
                                }
                                placeholder={detail || t('Name of the device')}
                                maxLength={100}
                                autoFocus
                                aria-label={t('Name of the device')}
                            />
                            <Button
                                type="submit"
                                size="icon"
                                aria-label={t('Save')}
                            >
                                <Check className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                size="icon"
                                variant="ghost"
                                onClick={() => setEditing(false)}
                                aria-label={t('Cancel')}
                            >
                                <X className="size-4" />
                            </Button>
                        </form>
                    ) : (
                        <>
                            <p className="truncate font-medium">
                                {device.label}
                            </p>
                            <div className="mt-1 flex flex-wrap gap-1.5">
                                {device.is_current && (
                                    <Badge variant="secondary">
                                        {t('This device')}
                                    </Badge>
                                )}
                                {device.has_push && (
                                    <Badge variant="outline">
                                        <Bell className="size-3" />
                                        {t('Notifications')}
                                    </Badge>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <dl className="space-y-1.5 border-t pt-3 text-sm">
                {detail && <Detail label={t('Browser')}>{detail}</Detail>}
                <Detail label={t('Last active')}>
                    {device.is_current
                        ? t('Active now')
                        : device.last_active_at
                          ? timeAgo(device.last_active_at, generatedAt, locale)
                          : t('Never active')}
                </Detail>
                {device.ip_address && (
                    <Detail label={t('IP address')}>{device.ip_address}</Detail>
                )}
                {device.created_at && (
                    <Detail label={t('Signed in')}>
                        {new Date(device.created_at).toLocaleDateString(locale)}
                    </Detail>
                )}
            </dl>

            {device.is_current && canUseBiometrics && (
                <div className="flex items-center justify-between gap-3 border-t pt-3">
                    <div className="flex min-w-0 items-center gap-2 text-sm">
                        <Fingerprint className="size-4 shrink-0 text-muted-foreground" />
                        <span>{t('Biometric unlock')}</span>
                    </div>
                    <Switch
                        checked={device.biometrics_enabled}
                        onCheckedChange={(enabled) =>
                            void toggleBiometrics(enabled)
                        }
                        aria-label={t('Biometric unlock')}
                    />
                </div>
            )}

            {!editing && (
                <div className="mt-auto flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditing(true)}
                    >
                        <Pencil className="size-4" />
                        {t('Rename')}
                    </Button>
                    {!device.is_current && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={signOut}
                        >
                            <LogOut className="size-4" />
                            {t('Sign out')}
                        </Button>
                    )}
                </div>
            )}
        </li>
    );
}

export default function Devices({
    devices,
    generated_at,
}: {
    devices: Device[];
    generated_at: string;
}) {
    const { t } = useTranslation();
    const current = devices.filter((device) => device.is_current);
    const others = devices.filter((device) => !device.is_current);

    return (
        <>
            <Head title={t('Devices')} />

            {current.length > 0 && (
                <SettingsSection
                    title={t('This device')}
                    description={t(
                        'A device is added here when you sign in on it. Each device has its own dashboard layout.',
                    )}
                >
                    <ul className="grid gap-4 xl:grid-cols-2">
                        {current.map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                generatedAt={generated_at}
                            />
                        ))}
                    </ul>
                </SettingsSection>
            )}

            <SettingsSection
                title={t('Other devices')}
                description={t('Where else you are signed in.')}
                action={
                    others.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        t('Sign out all other devices?'),
                                    )
                                ) {
                                    router.post(
                                        DeviceController.destroyOthers.url(),
                                        {},
                                        { preserveScroll: true },
                                    );
                                }
                            }}
                        >
                            <LogOut className="size-4" />
                            {t('Sign out all other devices')}
                        </Button>
                    )
                }
            >
                {others.length === 0 ? (
                    <p className="py-4 text-center text-sm text-muted-foreground">
                        {devices.length === 0
                            ? t('No devices yet.')
                            : t('You are not signed in anywhere else.')}
                    </p>
                ) : (
                    <ul className="grid gap-4 xl:grid-cols-2">
                        {others.map((device) => (
                            <DeviceCard
                                key={device.id}
                                device={device}
                                generatedAt={generated_at}
                            />
                        ))}
                    </ul>
                )}
            </SettingsSection>
        </>
    );
}

Devices.layout = {
    breadcrumbs: [{ title: 'Devices', href: index() }],
};
