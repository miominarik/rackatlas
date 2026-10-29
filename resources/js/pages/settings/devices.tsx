import { Head, router } from '@inertiajs/react';
import {
    Check,
    LogOut,
    Pencil,
    Smartphone,
    Tablet,
    Laptop,
    X,
} from 'lucide-react';
import { useState } from 'react';
import DeviceController from '@/actions/App/Http/Controllers/Settings/DeviceController';
import { SettingsSection } from '@/components/settings/section';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { timeAgo } from '@/lib/dashboard';
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
};

const icons = { mobile: Smartphone, tablet: Tablet, desktop: Laptop } as const;

function DeviceRow({
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

    return (
        <li className="flex flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                <Icon className="size-5 text-muted-foreground" />
            </div>

            <div className="min-w-0 flex-1 basis-48">
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
                            onChange={(event) => setName(event.target.value)}
                            placeholder={detail || t('Name of the device')}
                            maxLength={100}
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
                        <p className="flex flex-wrap items-center gap-2 font-medium">
                            <span className="truncate">{device.label}</span>
                            {device.is_current && (
                                <Badge variant="secondary">
                                    {t('This device')}
                                </Badge>
                            )}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                            {device.name ? `${detail} · ` : ''}
                            {device.is_current
                                ? t('Active now')
                                : device.last_active_at
                                  ? t('Active :time', {
                                        time: timeAgo(
                                            device.last_active_at,
                                            generatedAt,
                                            locale,
                                        ),
                                    })
                                  : t('Never active')}
                            {device.ip_address ? ` · ${device.ip_address}` : ''}
                        </p>
                        {device.created_at && (
                            <p className="text-xs text-muted-foreground/80">
                                {t('Signed in :date', {
                                    date: new Date(
                                        device.created_at,
                                    ).toLocaleDateString(locale),
                                })}
                            </p>
                        )}
                    </>
                )}
            </div>

            {!editing && (
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="size-10 md:size-9"
                        onClick={() => setEditing(true)}
                        aria-label={t('Rename')}
                    >
                        <Pencil className="size-4" />
                    </Button>
                    {!device.is_current && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        t('Sign out :device?', {
                                            device: device.label,
                                        }),
                                    )
                                ) {
                                    router.delete(
                                        DeviceController.destroy.url(device.id),
                                        { preserveScroll: true },
                                    );
                                }
                            }}
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
    const others = devices.filter((device) => !device.is_current).length;

    return (
        <>
            <Head title={t('Devices')} />

            <SettingsSection
                flush
                title={t('Your devices')}
                description={t(
                    'A device is added here when you sign in on it. Each device has its own dashboard layout.',
                )}
                action={
                    others > 0 && (
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
                {devices.length === 0 ? (
                    <p className="p-6 text-center text-sm text-muted-foreground">
                        {t('No devices yet.')}
                    </p>
                ) : (
                    <ul className="divide-y">
                        {devices.map((device) => (
                            <DeviceRow
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
