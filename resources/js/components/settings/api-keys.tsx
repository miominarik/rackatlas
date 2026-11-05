import { Form, Link, router, usePage } from '@inertiajs/react';
import { Check, Copy, KeyRound, Trash2 } from 'lucide-react';
import { useState } from 'react';
import ApiTokenController from '@/actions/App/Http/Controllers/Settings/ApiTokenController';
import InputError from '@/components/input-error';
import { SettingsSection } from '@/components/settings/section';
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
import { Spinner } from '@/components/ui/spinner';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/hooks/use-translation';
import { apiDocs } from '@/routes';

export type ApiKey = {
    id: number;
    name: string;
    scopes: string[];
    last_used_at: string | null;
    expires_at: string | null;
    expired: boolean;
};

type Props = {
    teamId: number;
    keys: ApiKey[];
    scopes: string[];
    expiryDays: number[];
    apiUrl: string;
};

type NewKey = { id: number; name: string; token: string };

const scopeLabel: Record<string, string> = {
    'servers:read': 'Servers',
    'metrics:read': 'Metrics history',
    'applications:read': 'Applications',
    'backups:read': 'Backups',
    'alerts:read': 'Alerts',
};

/**
 * Keys for the external JSON API of the team (Grafana and the like): create, see when they were used, revoke.
 */
export function ApiKeys({ teamId, keys, scopes, expiryDays, apiUrl }: Props) {
    const { t, locale } = useTranslation();
    const { flash } = usePage<{ flash?: { api_token?: NewKey } }>();
    const created = (flash as { api_token?: NewKey } | undefined)?.api_token;
    const [copied, copy] = useClipboard();
    const [expiry, setExpiry] = useState('never');
    const [picked, setPicked] = useState<string[]>(scopes);

    const formatDate = (value: string) =>
        new Date(value).toLocaleDateString(locale);

    const revoke = (key: ApiKey) => {
        if (
            !window.confirm(
                t('Revoke :name? Anything using it stops working.', {
                    name: key.name,
                }),
            )
        ) {
            return;
        }

        router.delete(
            ApiTokenController.destroy.url({ team: teamId, apiToken: key.id }),
            { preserveScroll: true },
        );
    };

    return (
        <SettingsSection
            title={t('API keys')}
            description={t(
                'Read-only access to the data of this team over JSON, for example for Grafana.',
            )}
        >
            <p className="text-sm">
                <Link
                    href={apiDocs()}
                    className="font-medium underline underline-offset-4"
                >
                    {t('API documentation')}
                </Link>
            </p>
            {created && (
                <div className="space-y-2 rounded-lg border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-500/30 dark:bg-emerald-500/10">
                    <p className="text-sm font-medium">
                        {t('Copy the key now. It is shown only once.')}
                    </p>
                    <div className="flex items-center gap-2">
                        <code className="min-w-0 flex-1 rounded-md border bg-white px-3 py-2 text-xs break-all dark:bg-input/30">
                            {created.token}
                        </code>
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            aria-label={t('Copy')}
                            onClick={() => copy(created.token)}
                        >
                            {copied === created.token ? (
                                <Check className="size-4" />
                            ) : (
                                <Copy className="size-4" />
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {keys.length > 0 && (
                <ul className="divide-y rounded-lg border bg-card">
                    {keys.map((key) => (
                        <li
                            key={key.id}
                            className="flex items-center gap-4 p-4"
                        >
                            <KeyRound className="size-4 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 flex-1">
                                <p className="truncate font-medium">
                                    {key.name}
                                    {key.expired && (
                                        <span className="ml-2 text-xs font-normal text-red-600">
                                            {t('expired')}
                                        </span>
                                    )}
                                </p>
                                <p className="truncate text-sm text-muted-foreground">
                                    {key.scopes
                                        .map((scope) =>
                                            t(scopeLabel[scope] ?? scope),
                                        )
                                        .join(', ')}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    {key.last_used_at
                                        ? t('Last used :date', {
                                              date: formatDate(
                                                  key.last_used_at,
                                              ),
                                          })
                                        : t('Never used')}
                                    {key.expires_at &&
                                        ` · ${t('expires :date', { date: formatDate(key.expires_at) })}`}
                                </p>
                            </div>
                            <Button
                                variant="ghost"
                                size="icon"
                                aria-label={t('Revoke :name', {
                                    name: key.name,
                                })}
                                onClick={() => revoke(key)}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </li>
                    ))}
                </ul>
            )}

            <Form
                {...ApiTokenController.store.form(teamId)}
                options={{ preserveScroll: true }}
                resetOnSuccess
                className="space-y-5"
            >
                {({ processing, errors }) => (
                    <>
                        <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
                            <div className="grid gap-2">
                                <Label htmlFor="api-key-name">
                                    {t('Name')}
                                </Label>
                                <Input
                                    id="api-key-name"
                                    name="name"
                                    required
                                    maxLength={100}
                                    placeholder="Grafana"
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="api-key-expiry">
                                    {t('Expires')}
                                </Label>
                                <Select
                                    value={expiry}
                                    onValueChange={setExpiry}
                                >
                                    <SelectTrigger id="api-key-expiry">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="never">
                                            {t('Never')}
                                        </SelectItem>
                                        {expiryDays.map((days) => (
                                            <SelectItem
                                                key={days}
                                                value={String(days)}
                                            >
                                                {t(':count days', {
                                                    count: days,
                                                })}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <input
                                    type="hidden"
                                    name="expires_in_days"
                                    value={expiry === 'never' ? '' : expiry}
                                />
                                <InputError message={errors.expires_in_days} />
                            </div>
                        </div>

                        <fieldset className="grid gap-2">
                            <legend className="mb-1 text-sm font-medium">
                                {t('Scopes')}
                            </legend>
                            <div className="grid gap-2 sm:grid-cols-2">
                                {scopes.map((scope) => (
                                    <label
                                        key={scope}
                                        className="flex cursor-pointer items-center gap-2 text-sm"
                                    >
                                        <Checkbox
                                            checked={picked.includes(scope)}
                                            onCheckedChange={(on) =>
                                                setPicked((current) =>
                                                    on === true
                                                        ? [...current, scope]
                                                        : current.filter(
                                                              (s) =>
                                                                  s !== scope,
                                                          ),
                                                )
                                            }
                                        />
                                        {picked.includes(scope) && (
                                            <input
                                                type="hidden"
                                                name="scopes[]"
                                                value={scope}
                                            />
                                        )}
                                        <span>
                                            {t(scopeLabel[scope] ?? scope)}
                                        </span>
                                        <code className="text-xs text-muted-foreground">
                                            {scope}
                                        </code>
                                    </label>
                                ))}
                            </div>
                            <InputError message={errors.scopes} />
                        </fieldset>

                        <Button disabled={processing || picked.length === 0}>
                            {processing && <Spinner />}
                            {t('Create key')}
                        </Button>
                    </>
                )}
            </Form>

            <p className="text-xs text-muted-foreground">
                {t(
                    'Send the key in the header "Authorization: Bearer <key>" to :url. Try :url/me first.',
                    { url: apiUrl },
                )}
            </p>
        </SettingsSection>
    );
}
