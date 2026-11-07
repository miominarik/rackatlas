import { Switch } from '@/components/ui/switch';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import type {
    PermissionCatalogItem,
    PermissionLevel,
    PermissionMap,
} from '@/types';

const labels: Record<string, { title: string; hint: string }> = {
    servers: {
        title: 'Servers',
        hint: 'Add, change and remove servers and categories',
    },
    map: { title: 'Map', hint: 'See the map of the servers' },
    terminal: {
        title: 'Terminal',
        hint: 'Open an SSH terminal to the servers',
    },
    applications: {
        title: 'Applications',
        hint: 'Services running on the servers and their journal',
    },
    metrics: { title: 'Metrics', hint: 'Charts and running processes' },
    logs: { title: 'Logs', hint: 'Edit means marking entries as resolved' },
    backups: {
        title: 'Backups',
        hint: 'Add, change and remove the monitored backups',
    },
    ssh_keys: {
        title: 'SSH keys',
        hint: 'Edit adds and deletes keys and shows the private key',
    },
    databases: {
        title: 'MySQL',
        hint: 'See the databases, edit means changing their connection',
    },
    database_kill: {
        title: 'Kill MySQL processes',
        hint: 'Stop running queries, nothing else can be changed',
    },
};

const levelLabel: Record<PermissionLevel, string> = {
    none: 'No access',
    view: 'View only',
    edit: 'View and edit',
};

type Props = {
    catalog: PermissionCatalogItem[];
    value: PermissionMap;
    onChange: (value: PermissionMap) => void;
    disabled?: boolean;
};

/**
 * One row per part of the app: a level, or a switch where there are only two.
 */
export function PermissionEditor({
    catalog,
    value,
    onChange,
    disabled,
}: Props) {
    const { t } = useTranslation();

    const set = (key: string, level: PermissionLevel) =>
        onChange({ ...value, [key]: level });

    const preset = (level: PermissionLevel) =>
        onChange(
            Object.fromEntries(
                catalog.map((item) => [
                    item.key,
                    item.levels.includes(level) ? level : item.levels.at(-1)!,
                ]),
            ) as PermissionMap,
        );

    const readOnly = () =>
        onChange(
            Object.fromEntries(
                catalog.map((item) => [
                    item.key,
                    item.levels.includes('view') ? 'view' : 'none',
                ]),
            ) as PermissionMap,
        );

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={readOnly}
                >
                    {t('Read only')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => preset('edit')}
                >
                    {t('Everything')}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={disabled}
                    onClick={() => preset('none')}
                >
                    {t('Nothing')}
                </Button>
            </div>

            <ul className="divide-y rounded-lg border bg-card">
                {catalog.map((item) => {
                    const label = labels[item.key];
                    const level = value[item.key] ?? 'none';
                    const isSwitch = item.levels.length === 2;

                    return (
                        <li
                            key={item.key}
                            className="flex items-center gap-4 px-4 py-3"
                        >
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">
                                    {t(label?.title ?? item.key)}
                                </p>
                                {label && (
                                    <p className="text-xs text-muted-foreground">
                                        {t(label.hint)}
                                    </p>
                                )}
                            </div>

                            {isSwitch ? (
                                <Switch
                                    checked={level === 'edit'}
                                    disabled={disabled}
                                    onCheckedChange={(checked) =>
                                        set(item.key, checked ? 'edit' : 'none')
                                    }
                                    aria-label={t(label?.title ?? item.key)}
                                />
                            ) : (
                                <Select
                                    value={level}
                                    disabled={disabled}
                                    onValueChange={(next) =>
                                        set(item.key, next as PermissionLevel)
                                    }
                                >
                                    <SelectTrigger className="w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {item.levels.map((option) => (
                                            <SelectItem
                                                key={option}
                                                value={option}
                                            >
                                                {t(levelLabel[option])}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

/**
 * The values of the editor as hidden fields of a plain form.
 */
export function PermissionFields({ value }: { value: PermissionMap }) {
    return (
        <>
            {Object.entries(value).map(([key, level]) => (
                <input
                    key={key}
                    type="hidden"
                    name={`permissions[${key}]`}
                    value={level}
                />
            ))}
        </>
    );
}
