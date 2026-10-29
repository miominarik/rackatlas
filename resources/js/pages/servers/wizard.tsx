import { Head, Link, useForm, useHttp } from '@inertiajs/react';
import {
    Check,
    CheckCircle2,
    KeyRound,
    Lock,
    Plus,
    Radio,
    ServerCog,
    Wifi,
    XCircle,
} from 'lucide-react';
import { useState } from 'react';
import ServerController from '@/actions/App/Http/Controllers/Servers/ServerController';
import TestConnectionController from '@/actions/App/Http/Controllers/Servers/TestConnectionController';
import InputError from '@/components/input-error';
import PasswordInput from '@/components/password-input';
import CopyField from '@/components/servers/copy-field';
import SshKeyCreator from '@/components/servers/ssh-key-creator';
import { Button } from '@/components/ui/button';
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
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { dotClass } from '@/lib/server-colors';
import { index } from '@/routes/servers';
import type {
    ServerAuthType,
    ServerCategory,
    ServerFormData,
    SshKey,
} from '@/types';

type Props = {
    team: { id: number; name: string };
    server: ServerFormData | null;
    categories: ServerCategory[];
    sshKeys: SshKey[];
};

type TestResult = { success: boolean; message: string };

const NEW_CATEGORY = '__new__';
const NO_CATEGORY = '__none__';

const stepFields: Record<number, string[]> = {
    0: ['name', 'server_category_id', 'new_category'],
    1: ['auth_type', 'host', 'port', 'username', 'password', 'ssh_key_id'],
};

export default function ServerWizard({
    team,
    server,
    categories,
    sshKeys: initialKeys,
}: Props) {
    const { t } = useTranslation();
    const editing = server !== null;

    const [step, setStep] = useState(0);
    const [keys, setKeys] = useState<SshKey[]>(initialKeys);
    const [addingKey, setAddingKey] = useState(false);
    const [categoryChoice, setCategoryChoice] = useState(
        server?.server_category_id
            ? String(server.server_category_id)
            : NO_CATEGORY,
    );
    const [testResult, setTestResult] = useState<TestResult | null>(null);

    const form = useForm({
        name: server?.name ?? '',
        host: server?.host ?? '',
        port: String(server?.port ?? 22),
        username: server?.username ?? 'root',
        server_category_id: server?.server_category_id
            ? String(server.server_category_id)
            : '',
        new_category: '',
        auth_type: (server?.auth_type ?? 'agent') as ServerAuthType,
        password: '',
        ssh_key_id: server?.ssh_key_id ? String(server.ssh_key_id) : '',
    });

    const tester = useHttp<Record<string, string>, TestResult>({});

    const steps = [
        { title: t('Basics'), description: t('What is it called?') },
        { title: t('Access'), description: t('How do we get the data?') },
        { title: t('Review'), description: t('Check and save') },
    ];

    const isAgent = form.data.auth_type === 'agent';

    const selectedKey = keys.find((key) => String(key.id) === form.data.ssh_key_id);
    const selectedCategory = categories.find(
        (category) => String(category.id) === categoryChoice,
    );

    const fieldsToValidate = (): string[] => {
        if (step === 0) {
            return ['name'];
        }

        if (step === 1 && !isAgent) {
            const address = ['host', 'port', 'username'];

            if (form.data.auth_type === 'key') {
                return [...address, 'ssh_key_id'];
            }

            return editing ? address : [...address, 'password'];
        }

        return [];
    };

    const next = () => {
        form.clearErrors();
        setTestResult(null);

        const missing = fieldsToValidate().filter(
            (field) => !String(form.data[field as keyof typeof form.data]).trim(),
        );

        if (categoryChoice === NEW_CATEGORY && step === 0 && !form.data.new_category.trim()) {
            missing.push('new_category');
        }

        if (missing.length > 0) {
            form.setError(
                Object.fromEntries(
                    missing.map((field) => [field, t('This field is required.')]),
                ),
            );

            return;
        }

        setStep(step + 1);
    };

    const chooseCategory = (value: string) => {
        setCategoryChoice(value);
        form.setData((data) => ({
            ...data,
            server_category_id:
                value === NEW_CATEGORY || value === NO_CATEGORY ? '' : value,
            new_category: value === NEW_CATEGORY ? data.new_category : '',
        }));
    };

    const runTest = () => {
        setTestResult(null);
        tester.transform(() => ({
            host: form.data.host,
            port: form.data.port,
            username: form.data.username,
            auth_type: form.data.auth_type,
            password: form.data.password,
            ssh_key_id: form.data.ssh_key_id,
            server_id: server ? String(server.id) : '',
        }));

        void tester
            .post(TestConnectionController.url())
            .then(setTestResult)
            .catch(() =>
                setTestResult({
                    success: false,
                    message: t('The connection test could not be run.'),
                }),
            );
    };

    const save = () => {
        const options = {
            onError: (errors: Record<string, string>) => {
                const first = Object.keys(errors)[0];
                const target = Object.entries(stepFields).find(([, fields]) =>
                    fields.includes(first),
                );

                if (target) {
                    setStep(Number(target[0]));
                }
            },
        };

        if (editing) {
            form.put(ServerController.update.url(server.id), options);
        } else {
            form.post(ServerController.store.url(), options);
        }
    };

    const keyAdded = (key: SshKey) => {
        setKeys((current) => [...current, key]);
        form.setData('ssh_key_id', String(key.id));
        form.clearErrors('ssh_key_id');
        setAddingKey(false);
    };

    return (
        <>
            <Head title={editing ? t('Edit server') : t('Add server')} />

            <div className="mx-auto w-full max-w-2xl space-y-8 p-4 md:py-8">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">
                        {editing ? t('Edit server') : t('Add a server')}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('It will be added to the team :team.', {
                            team: team.name,
                        })}
                    </p>
                </div>

                <ol className="grid grid-cols-3 gap-3" aria-label={t('Steps')}>
                    {steps.map((item, i) => (
                        <li key={item.title}>
                            <button
                                type="button"
                                disabled={i > step}
                                onClick={() => setStep(i)}
                                className="w-full text-left disabled:cursor-default"
                            >
                                <div
                                    className={cn(
                                        'mb-2 h-1 rounded-full transition-colors',
                                        i <= step ? 'bg-primary' : 'bg-muted',
                                    )}
                                />
                                <div className="flex items-center gap-2">
                                    <span
                                        className={cn(
                                            'flex size-5 items-center justify-center rounded-full text-[11px] font-medium',
                                            i < step
                                                ? 'bg-primary text-primary-foreground'
                                                : i === step
                                                  ? 'border-2 border-primary text-primary'
                                                  : 'border text-muted-foreground',
                                        )}
                                    >
                                        {i < step ? (
                                            <Check className="size-3" />
                                        ) : (
                                            i + 1
                                        )}
                                    </span>
                                    <span
                                        className={cn(
                                            'text-sm font-medium',
                                            i > step && 'text-muted-foreground',
                                        )}
                                    >
                                        {item.title}
                                    </span>
                                </div>
                                <p className="mt-0.5 hidden pl-7 text-xs text-muted-foreground sm:block">
                                    {item.description}
                                </p>
                            </button>
                        </li>
                    ))}
                </ol>

                <div className="space-y-6 rounded-xl border p-5 sm:p-6">
                    {step === 0 && (
                        <>
                            <div className="grid gap-2">
                                <Label htmlFor="name">{t('Server name')}</Label>
                                <Input
                                    id="name"
                                    autoFocus
                                    value={form.data.name}
                                    onChange={(e) =>
                                        form.setData('name', e.target.value)
                                    }
                                    placeholder={t('e.g. Production web 1')}
                                />
                                <InputError message={form.errors.name} />
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="category">
                                    {t('Category (optional)')}
                                </Label>
                                <Select
                                    value={categoryChoice}
                                    onValueChange={chooseCategory}
                                >
                                    <SelectTrigger id="category" className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={NO_CATEGORY}>
                                            {t('No category')}
                                        </SelectItem>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={String(category.id)}
                                            >
                                                <span className="flex items-center gap-2">
                                                    <span
                                                        className={cn(
                                                            'size-2 rounded-full',
                                                            dotClass(category.color),
                                                        )}
                                                    />
                                                    {category.name}
                                                </span>
                                            </SelectItem>
                                        ))}
                                        <SelectItem value={NEW_CATEGORY}>
                                            {t('+ New category…')}
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                {categoryChoice === NEW_CATEGORY && (
                                    <Input
                                        autoFocus
                                        value={form.data.new_category}
                                        onChange={(e) =>
                                            form.setData(
                                                'new_category',
                                                e.target.value,
                                            )
                                        }
                                        placeholder={t('e.g. Production')}
                                    />
                                )}
                                <InputError
                                    message={
                                        form.errors.new_category ??
                                        form.errors.server_category_id
                                    }
                                />
                            </div>
                        </>
                    )}

                    {step === 1 && (
                        <>
                            <div
                                role="radiogroup"
                                aria-label={t('How do we get the data?')}
                                className="grid gap-3 sm:grid-cols-3"
                            >
                                {(
                                    [
                                        [
                                            'agent',
                                            t('Agent'),
                                            t('Recommended. A small program on the server sends the data to us. No IP allowlist, no stored passwords.'),
                                            Radio,
                                        ],
                                        [
                                            'key',
                                            t('SSH key'),
                                            t('We log in over SSH. More secure than a password, reusable across servers.'),
                                            KeyRound,
                                        ],
                                        [
                                            'password',
                                            t('Password'),
                                            t('We log in over SSH with a password. Simple, but weaker than a key.'),
                                            Lock,
                                        ],
                                    ] as const
                                ).map(([value, title, hint, Icon]) => (
                                    <button
                                        key={value}
                                        type="button"
                                        role="radio"
                                        aria-checked={form.data.auth_type === value}
                                        onClick={() => {
                                            form.setData('auth_type', value);
                                            form.clearErrors();
                                        }}
                                        className={cn(
                                            'flex items-start gap-3 rounded-lg border p-4 text-left transition-colors',
                                            form.data.auth_type === value
                                                ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                : 'hover:bg-muted/50',
                                        )}
                                    >
                                        <Icon className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                                        <span>
                                            <span className="block font-medium">
                                                {title}
                                            </span>
                                            <span className="block text-sm text-muted-foreground">
                                                {hint}
                                            </span>
                                        </span>
                                    </button>
                                ))}
                            </div>

                            {isAgent && (
                                <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
                                    <p className="font-medium">
                                        {t('How the agent works')}
                                    </p>
                                    <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
                                        <li>{t('After saving you get one command to run on the server (Debian or Ubuntu).')}</li>
                                        <li>{t('The agent sends CPU, memory, disks and serious log entries every minute over HTTPS.')}</li>
                                        <li>{t('Nothing connects into your server, so no IP has to be allowed.')}</li>
                                    </ul>
                                </div>
                            )}

                            {!isAgent && (
                                <>
                                <div className="grid gap-4 sm:grid-cols-[1fr_7rem]">
                                    <div className="grid gap-2">
                                        <Label htmlFor="host">
                                            {t('Host or IP address')}
                                        </Label>
                                        <Input
                                            id="host"
                                            value={form.data.host}
                                            onChange={(e) =>
                                                form.setData('host', e.target.value)
                                            }
                                            placeholder="203.0.113.10"
                                            autoComplete="off"
                                        />
                                        <InputError message={form.errors.host} />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label htmlFor="port">{t('SSH port')}</Label>
                                        <Input
                                            id="port"
                                            inputMode="numeric"
                                            value={form.data.port}
                                            onChange={(e) =>
                                                form.setData('port', e.target.value)
                                            }
                                        />
                                        <InputError message={form.errors.port} />
                                    </div>
                                </div>

                                <div className="grid gap-2">
                                    <Label htmlFor="username">{t('Username')}</Label>
                                    <Input
                                        id="username"
                                        value={form.data.username}
                                        onChange={(e) =>
                                            form.setData('username', e.target.value)
                                        }
                                        autoComplete="off"
                                    />
                                    <InputError message={form.errors.username} />
                                </div>
                                </>
                            )}

                            {form.data.auth_type === 'password' && (
                                <div className="grid gap-2">
                                    <Label htmlFor="password">
                                        {t('Password')}
                                    </Label>
                                    <PasswordInput
                                        id="password"
                                        autoFocus
                                        value={form.data.password}
                                        onChange={(e) =>
                                            form.setData('password', e.target.value)
                                        }
                                        placeholder={
                                            editing
                                                ? t('Leave empty to keep the current password')
                                                : undefined
                                        }
                                        autoComplete="off"
                                    />
                                    <InputError message={form.errors.password} />
                                    <p className="text-xs text-muted-foreground">
                                        {t('The password is stored encrypted.')}
                                    </p>
                                </div>
                            )}

                            {form.data.auth_type === 'key' && (
                                <div className="space-y-4">
                                    {keys.length > 0 && !addingKey && (
                                        <div className="grid gap-2">
                                            <Label htmlFor="ssh-key">
                                                {t('Choose an SSH key')}
                                            </Label>
                                            <Select
                                                value={form.data.ssh_key_id}
                                                onValueChange={(value) => {
                                                    form.setData('ssh_key_id', value);
                                                    form.clearErrors('ssh_key_id');
                                                }}
                                            >
                                                <SelectTrigger id="ssh-key" className="w-full">
                                                    <SelectValue
                                                        placeholder={t('Select a key…')}
                                                    />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {keys.map((key) => (
                                                        <SelectItem
                                                            key={key.id}
                                                            value={String(key.id)}
                                                        >
                                                            {key.name}
                                                            <span className="ml-2 text-xs text-muted-foreground">
                                                                {key.algorithm}
                                                            </span>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <InputError
                                                message={form.errors.ssh_key_id}
                                            />
                                            {selectedKey && (
                                                <CopyField
                                                    label={t('Public key (add it to authorized_keys)')}
                                                    value={selectedKey.public_key}
                                                />
                                            )}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                className="w-fit"
                                                onClick={() => setAddingKey(true)}
                                            >
                                                <Plus className="size-4" />
                                                {t('Generate or import a new key')}
                                            </Button>
                                        </div>
                                    )}

                                    {(keys.length === 0 || addingKey) && (
                                        <div className="rounded-lg border bg-muted/30 p-4">
                                            <SshKeyCreator
                                                suggestedName={form.data.name}
                                                onCreated={keyAdded}
                                                onCancel={
                                                    keys.length > 0
                                                        ? () => setAddingKey(false)
                                                        : undefined
                                                }
                                            />
                                            <InputError
                                                message={form.errors.ssh_key_id}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <dl className="divide-y rounded-lg border text-sm">
                                {[
                                    [t('Name'), form.data.name],
                                    ...(isAgent
                                        ? []
                                        : [
                                              [
                                                  t('Address'),
                                                  `${form.data.username}@${form.data.host}:${form.data.port}`,
                                              ],
                                          ]),
                                    [
                                        t('Category'),
                                        categoryChoice === NEW_CATEGORY
                                            ? form.data.new_category
                                            : (selectedCategory?.name ??
                                              t('No category')),
                                    ],
                                    [
                                        t('Access'),
                                        isAgent
                                            ? t('Agent')
                                            : form.data.auth_type === 'key'
                                              ? t('SSH key: :name', {
                                                    name: selectedKey?.name ?? '',
                                                })
                                              : t('Password'),
                                    ],
                                ].map(([label, value]) => (
                                    <div
                                        key={label}
                                        className="flex justify-between gap-4 px-4 py-2.5"
                                    >
                                        <dt className="text-muted-foreground">
                                            {label}
                                        </dt>
                                        <dd className="min-w-0 truncate font-medium">
                                            {value}
                                        </dd>
                                    </div>
                                ))}
                            </dl>

                            {isAgent ? (
                                <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
                                    {t('After saving you get the install command for the server.')}
                                </p>
                            ) : (
                                <div className="space-y-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={runTest}
                                        disabled={tester.processing}
                                        data-test="test-connection-button"
                                    >
                                        {tester.processing ? (
                                            <Spinner />
                                        ) : (
                                            <Wifi className="size-4" />
                                        )}
                                        {t('Test connection')}
                                    </Button>

                                    {testResult && (
                                        <div
                                            role="status"
                                            className={cn(
                                                'flex items-start gap-2 rounded-lg border p-3 text-sm',
                                                testResult.success
                                                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                                                    : 'border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-300',
                                            )}
                                        >
                                            {testResult.success ? (
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
                                            ) : (
                                                <XCircle className="mt-0.5 size-4 shrink-0" />
                                            )}
                                            <span>
                                                {testResult.message}
                                                {!testResult.success &&
                                                    ` ${t('You can still save the server and fix this later.')}`}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </div>

                <div className="flex items-center justify-between">
                    {step === 0 ? (
                        <Button variant="ghost" asChild>
                            <Link href={index()}>{t('Cancel')}</Link>
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setStep(step - 1)}
                        >
                            {t('Back')}
                        </Button>
                    )}

                    {step < 2 ? (
                        <Button type="button" onClick={next}>
                            {t('Next')}
                        </Button>
                    ) : (
                        <Button
                            type="button"
                            onClick={save}
                            disabled={form.processing}
                            data-test="save-server-button"
                        >
                            {form.processing ? (
                                <Spinner />
                            ) : (
                                <ServerCog className="size-4" />
                            )}
                            {editing ? t('Save changes') : isAgent ? t('Add server and get the install command') : t('Add server')}
                        </Button>
                    )}
                </div>
            </div>
        </>
    );
}

ServerWizard.layout = (props: { server: ServerFormData | null }) => ({
    breadcrumbs: [
        { title: 'Servers', href: index() },
        {
            title: props.server ? 'Edit server' : 'Add server',
            href: index(),
        },
    ],
});
