import { Link, router } from '@inertiajs/react';
import { ArrowDown, ArrowUp, Copy, RotateCcw, Smartphone } from 'lucide-react';
import { useState } from 'react';
import DashboardController from '@/actions/App/Http/Controllers/DashboardController';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
} from '@/components/ui/sheet';
import { Spinner } from '@/components/ui/spinner';
import { useTranslation } from '@/hooks/use-translation';
import { index as devicesIndex } from '@/routes/devices';
import type {
    DashboardMetricId,
    DashboardSettings,
    DashboardWidgetId,
} from '@/types';

type Props = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    settings: DashboardSettings;
    device: { id: number; label: string } | null;
    otherDevices: { id: number; label: string }[];
};

const THRESHOLD_KEYS = ['cpu', 'ram', 'disk'] as const;

function Choice({
    id,
    label,
    value,
    options,
    onChange,
}: {
    id: string;
    label: string;
    value: string | number;
    options: [string | number, string][];
    onChange: (value: string) => void;
}) {
    return (
        <div className="grid gap-2">
            <Label htmlFor={id}>{label}</Label>
            <Select value={String(value)} onValueChange={onChange}>
                <SelectTrigger id={id} className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent avoidCollisions>
                    {options.map(([optionValue, optionLabel]) => (
                        <SelectItem
                            key={optionValue}
                            value={String(optionValue)}
                        >
                            {optionLabel}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
}

function Form({
    settings,
    onClose,
}: {
    settings: DashboardSettings;
    onClose: () => void;
}) {
    const { t } = useTranslation();
    const [draft, setDraft] = useState<DashboardSettings>(settings);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [processing, setProcessing] = useState(false);

    const widgetLabel: Record<DashboardWidgetId, string> = {
        summary: t('Summary'),
        problems: t('Problems'),
        servers: t('Server cards'),
        top: t('Top usage'),
        logs: t('Server logs'),
        errors: t('Collection errors'),
    };

    const metricLabel: Record<DashboardMetricId, string> = {
        cpu: t('CPU'),
        ram: t('Memory'),
        disk: t('Disks'),
        load: t('Load average'),
        uptime: t('Uptime'),
    };

    const sortLabel: Record<DashboardSettings['servers']['sort'], string> = {
        status: t('Worst first'),
        name: t('Name'),
        cpu: t('CPU usage'),
        ram: t('Memory usage'),
        disk: t('Disk usage'),
    };

    const setServers = (patch: Partial<DashboardSettings['servers']>) =>
        setDraft((current) => ({
            ...current,
            servers: { ...current.servers, ...patch },
        }));

    const setList = (
        key: 'logs' | 'errors',
        patch: Partial<DashboardSettings['logs'] & DashboardSettings['errors']>,
    ) =>
        setDraft((current) => ({
            ...current,
            [key]: { ...current[key], ...patch },
        }));

    const limitOptions: [number, string][] = [5, 10, 20].map((count) => [
        count,
        t(':count entries', { count }),
    ]);

    const hoursOptions: [number, string][] = [
        [6, t('Last 6 hours')],
        [24, t('Last 24 hours')],
        [168, t('Last 7 days')],
    ];

    const moveWidget = (index: number, delta: number) =>
        setDraft((current) => {
            const widgets = [...current.widgets];
            const target = index + delta;

            if (target < 0 || target >= widgets.length) {
                return current;
            }

            [widgets[index], widgets[target]] = [
                widgets[target],
                widgets[index],
            ];

            return { ...current, widgets };
        });

    const toggleMetric = (metric: DashboardMetricId, checked: boolean) =>
        setServers({
            metrics: checked
                ? [...draft.servers.metrics, metric]
                : draft.servers.metrics.filter((item) => item !== metric),
        });

    const setThreshold = (
        key: (typeof THRESHOLD_KEYS)[number],
        level: 'warn' | 'critical',
        value: string,
    ) =>
        setDraft((current) => ({
            ...current,
            thresholds: {
                ...current.thresholds,
                [key]: { ...current.thresholds[key], [level]: Number(value) },
            },
        }));

    const save = () => {
        router.put(DashboardController.update.url(), draft, {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: onClose,
            onError: (e) => setErrors(e),
        });
    };

    const reset = () => {
        router.delete(DashboardController.reset.url(), {
            preserveScroll: true,
            onStart: () => setProcessing(true),
            onFinish: () => setProcessing(false),
            onSuccess: onClose,
        });
    };

    const firstThresholdError = Object.entries(errors).find(([key]) =>
        key.startsWith('thresholds'),
    )?.[1];

    return (
        <>
            <div className="flex-1 space-y-8 overflow-y-auto px-4 pb-4">
                <section className="space-y-3">
                    <h3 className="text-sm font-medium">{t('Sections')}</h3>
                    <p className="text-xs text-muted-foreground">
                        {t(
                            'Show, hide and reorder the parts of the dashboard.',
                        )}
                    </p>
                    <ul className="divide-y rounded-lg border">
                        {draft.widgets.map((widget, index) => (
                            <li
                                key={widget.id}
                                className="flex items-center gap-3 px-3 py-2"
                            >
                                <Checkbox
                                    id={`widget-${widget.id}`}
                                    checked={widget.visible}
                                    onCheckedChange={(checked) =>
                                        setDraft((current) => ({
                                            ...current,
                                            widgets: current.widgets.map(
                                                (item) =>
                                                    item.id === widget.id
                                                        ? {
                                                              ...item,
                                                              visible:
                                                                  checked ===
                                                                  true,
                                                          }
                                                        : item,
                                            ),
                                        }))
                                    }
                                />
                                <Label
                                    htmlFor={`widget-${widget.id}`}
                                    className="flex-1 font-normal"
                                >
                                    {widgetLabel[widget.id]}
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    disabled={index === 0}
                                    onClick={() => moveWidget(index, -1)}
                                    aria-label={t('Move up')}
                                >
                                    <ArrowUp className="size-4" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                    disabled={
                                        index === draft.widgets.length - 1
                                    }
                                    onClick={() => moveWidget(index, 1)}
                                    aria-label={t('Move down')}
                                >
                                    <ArrowDown className="size-4" />
                                </Button>
                            </li>
                        ))}
                    </ul>
                </section>

                <section className="space-y-4">
                    <h3 className="text-sm font-medium">{t('Server cards')}</h3>

                    <div className="grid gap-2">
                        <Label htmlFor="sort">{t('Sort by')}</Label>
                        <Select
                            value={draft.servers.sort}
                            onValueChange={(value) =>
                                setServers({
                                    sort: value as DashboardSettings['servers']['sort'],
                                })
                            }
                        >
                            <SelectTrigger id="sort" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent avoidCollisions>
                                {Object.entries(sortLabel).map(
                                    ([value, label]) => (
                                        <SelectItem key={value} value={value}>
                                            {label}
                                        </SelectItem>
                                    ),
                                )}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="density">{t('Card size')}</Label>
                        <Select
                            value={draft.servers.density}
                            onValueChange={(value) =>
                                setServers({
                                    density:
                                        value as DashboardSettings['servers']['density'],
                                })
                            }
                        >
                            <SelectTrigger id="density" className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent avoidCollisions>
                                <SelectItem value="comfortable">
                                    {t('Detailed')}
                                </SelectItem>
                                <SelectItem value="compact">
                                    {t('Compact')}
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Choice
                        id="layout"
                        label={t('Layout')}
                        value={draft.servers.layout}
                        options={[
                            ['grid', t('Cards')],
                            ['list', t('List')],
                        ]}
                        onChange={(value) =>
                            setServers({
                                layout: value as DashboardSettings['servers']['layout'],
                            })
                        }
                    />

                    {draft.servers.layout === 'grid' && (
                        <Choice
                            id="columns"
                            label={t('Columns')}
                            value={draft.servers.columns}
                            options={[
                                [0, t('Automatic')],
                                [1, t(':count column', { count: 1 })],
                                [2, t(':count columns', { count: 2 })],
                                [3, t(':count columns', { count: 3 })],
                                [4, t(':count columns', { count: 4 })],
                            ]}
                            onChange={(value) =>
                                setServers({
                                    columns: Number(
                                        value,
                                    ) as DashboardSettings['servers']['columns'],
                                })
                            }
                        />
                    )}

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="group"
                            checked={draft.servers.group_by_category}
                            onCheckedChange={(checked) =>
                                setServers({
                                    group_by_category: checked === true,
                                })
                            }
                        />
                        <Label htmlFor="group" className="font-normal">
                            {t('Group servers by category')}
                        </Label>
                    </div>

                    <div className="flex items-center gap-3">
                        <Checkbox
                            id="history"
                            checked={draft.servers.show_history}
                            onCheckedChange={(checked) =>
                                setServers({ show_history: checked === true })
                            }
                        />
                        <Label htmlFor="history" className="font-normal">
                            {t('Show the CPU chart')}
                        </Label>
                    </div>

                    {draft.servers.show_history && (
                        <Choice
                            id="history-range"
                            label={t('Chart range')}
                            value={draft.servers.history_minutes}
                            options={[
                                [60, t('Last hour')],
                                [360, t('Last 6 hours')],
                                [1440, t('Last 24 hours')],
                            ]}
                            onChange={(value) =>
                                setServers({
                                    history_minutes: Number(
                                        value,
                                    ) as DashboardSettings['servers']['history_minutes'],
                                })
                            }
                        />
                    )}

                    <div className="space-y-2">
                        <p className="text-sm">{t('Shown on each card')}</p>
                        <div className="grid grid-cols-2 gap-2">
                            {(
                                Object.keys(metricLabel) as DashboardMetricId[]
                            ).map((metric) => (
                                <div
                                    key={metric}
                                    className="flex items-center gap-3"
                                >
                                    <Checkbox
                                        id={`metric-${metric}`}
                                        checked={draft.servers.metrics.includes(
                                            metric,
                                        )}
                                        onCheckedChange={(checked) =>
                                            toggleMetric(
                                                metric,
                                                checked === true,
                                            )
                                        }
                                    />
                                    <Label
                                        htmlFor={`metric-${metric}`}
                                        className="font-normal"
                                    >
                                        {metricLabel[metric]}
                                    </Label>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="space-y-3">
                    <h3 className="text-sm font-medium">
                        {t('Alert thresholds')}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                        {t(
                            'From these values (in %) a server is shown as a warning or as critical.',
                        )}
                    </p>
                    <div className="grid grid-cols-[1fr_5rem_5rem] items-center gap-x-3 gap-y-2 text-sm">
                        <span />
                        <span className="text-xs text-muted-foreground">
                            {t('Warning')}
                        </span>
                        <span className="text-xs text-muted-foreground">
                            {t('Critical')}
                        </span>
                        {THRESHOLD_KEYS.map((key) => (
                            <div key={key} className="contents">
                                <Label
                                    htmlFor={`${key}-warn`}
                                    className="font-normal"
                                >
                                    {metricLabel[key]}
                                </Label>
                                {(['warn', 'critical'] as const).map(
                                    (level) => (
                                        <Input
                                            key={level}
                                            id={`${key}-${level}`}
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={draft.thresholds[key][level]}
                                            onChange={(e) =>
                                                setThreshold(
                                                    key,
                                                    level,
                                                    e.target.value,
                                                )
                                            }
                                            aria-label={`${metricLabel[key]} ${level}`}
                                        />
                                    ),
                                )}
                            </div>
                        ))}
                    </div>
                    <InputError message={firstThresholdError} />
                </section>

                <section className="space-y-3">
                    <h3 className="text-sm font-medium">{t('Server logs')}</h3>
                    <Choice
                        id="logs-level"
                        label={t('Show')}
                        value={draft.logs.level}
                        options={[
                            ['error', t('Errors and critical')],
                            ['critical', t('Only critical')],
                        ]}
                        onChange={(value) =>
                            setList('logs', {
                                level: value as DashboardSettings['logs']['level'],
                            })
                        }
                    />
                    <Choice
                        id="logs-limit"
                        label={t('Number of entries')}
                        value={draft.logs.limit}
                        options={limitOptions}
                        onChange={(value) =>
                            setList('logs', {
                                limit: Number(
                                    value,
                                ) as DashboardSettings['logs']['limit'],
                            })
                        }
                    />
                    <Choice
                        id="logs-hours"
                        label={t('Period')}
                        value={draft.logs.hours}
                        options={hoursOptions}
                        onChange={(value) =>
                            setList('logs', {
                                hours: Number(
                                    value,
                                ) as DashboardSettings['logs']['hours'],
                            })
                        }
                    />
                </section>

                <section className="space-y-3">
                    <h3 className="text-sm font-medium">
                        {t('Collection errors')}
                    </h3>
                    <Choice
                        id="errors-limit"
                        label={t('Number of entries')}
                        value={draft.errors.limit}
                        options={limitOptions}
                        onChange={(value) =>
                            setList('errors', {
                                limit: Number(
                                    value,
                                ) as DashboardSettings['errors']['limit'],
                            })
                        }
                    />
                    <Choice
                        id="errors-hours"
                        label={t('Period')}
                        value={draft.errors.hours}
                        options={hoursOptions}
                        onChange={(value) =>
                            setList('errors', {
                                hours: Number(
                                    value,
                                ) as DashboardSettings['errors']['hours'],
                            })
                        }
                    />
                </section>

                <section className="space-y-3">
                    <h3 className="text-sm font-medium">{t('Refresh')}</h3>
                    <Select
                        value={String(draft.refresh_seconds)}
                        onValueChange={(value) =>
                            setDraft((current) => ({
                                ...current,
                                refresh_seconds: Number(value),
                            }))
                        }
                    >
                        <SelectTrigger
                            className="w-full"
                            aria-label={t('Refresh')}
                        >
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent avoidCollisions>
                            <SelectItem value="15">
                                {t('Every 15 seconds')}
                            </SelectItem>
                            <SelectItem value="30">
                                {t('Every 30 seconds')}
                            </SelectItem>
                            <SelectItem value="60">
                                {t('Every minute')}
                            </SelectItem>
                            <SelectItem value="0">
                                {t('Never, I will reload myself')}
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </section>
            </div>

            <SheetFooter className="flex-row justify-between border-t">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={reset}
                    disabled={processing}
                >
                    <RotateCcw className="size-4" />
                    {t('Reset to defaults')}
                </Button>
                <Button
                    type="button"
                    onClick={save}
                    disabled={processing}
                    data-test="save-dashboard-button"
                >
                    {processing && <Spinner />}
                    {t('Save')}
                </Button>
            </SheetFooter>
        </>
    );
}

export default function CustomizeSheet({
    open,
    onOpenChange,
    settings,
    device,
    otherDevices,
}: Props) {
    const { t } = useTranslation();
    const [copyFrom, setCopyFrom] = useState<string>('');

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side="right"
                className="flex w-full flex-col gap-4 sm:max-w-md"
            >
                <SheetHeader>
                    <SheetTitle>{t('Customize the dashboard')}</SheetTitle>
                    <SheetDescription>
                        {t(
                            'Every device has its own layout, so a phone can show less than a computer.',
                        )}
                    </SheetDescription>
                </SheetHeader>

                {device && (
                    <div className="mx-4 space-y-3 rounded-lg border bg-muted/30 p-3 text-sm">
                        <p className="flex items-center gap-2">
                            <Smartphone className="size-4 shrink-0 text-muted-foreground" />
                            <span>
                                {t('Saved for this device:')}{' '}
                                <span className="font-medium">
                                    {device.label}
                                </span>
                            </span>
                        </p>

                        {otherDevices.length > 0 && (
                            <div className="flex gap-2">
                                <Select
                                    value={copyFrom}
                                    onValueChange={setCopyFrom}
                                >
                                    <SelectTrigger
                                        className="min-w-0 flex-1"
                                        aria-label={t('Copy the layout from')}
                                    >
                                        <SelectValue
                                            placeholder={t(
                                                'Copy the layout from…',
                                            )}
                                        />
                                    </SelectTrigger>
                                    <SelectContent avoidCollisions>
                                        {otherDevices.map((other) => (
                                            <SelectItem
                                                key={other.id}
                                                value={String(other.id)}
                                            >
                                                {other.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={copyFrom === ''}
                                    onClick={() =>
                                        router.post(
                                            DashboardController.copy.url(),
                                            { device_id: Number(copyFrom) },
                                            {
                                                preserveScroll: true,
                                                onSuccess: () =>
                                                    onOpenChange(false),
                                            },
                                        )
                                    }
                                >
                                    <Copy className="size-4" />
                                    {t('Copy')}
                                </Button>
                            </div>
                        )}

                        <Link
                            href={devicesIndex()}
                            className="block text-xs text-muted-foreground underline-offset-4 hover:underline"
                        >
                            {t('Manage devices')}
                        </Link>
                    </div>
                )}

                <Form settings={settings} onClose={() => onOpenChange(false)} />
            </SheetContent>
        </Sheet>
    );
}
