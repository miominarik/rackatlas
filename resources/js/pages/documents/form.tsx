import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowDown,
    ArrowLeft,
    ArrowUp,
    Plus,
    ShieldAlert,
    Trash2,
} from 'lucide-react';
import { useState } from 'react';
import type { FormEvent } from 'react';
import Markdown from '@/components/documents/markdown';
import { templateIcon } from '@/components/documents/meta';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { create, index, show, store, update } from '@/routes/documents';
import type {
    DocumentFull,
    DocumentSection,
    DocumentStatus,
    DocumentTemplate,
} from '@/types';

type Props = {
    document: DocumentFull | null;
    templates: Record<string, DocumentTemplate>;
    template: string;
    serverId: number | null;
    servers: { id: number; name: string }[];
};

type FormData = {
    template: string;
    title: string;
    subject: string;
    status: DocumentStatus;
    server_id: string;
    reviewed_at: string;
    fields: Record<string, string>;
    sections: DocumentSection[];
};

const fieldClass =
    'w-full rounded-md border border-input bg-white dark:bg-input/30 px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

/** Looks like a password, token or key was typed in. A hint only, the server rejects private keys. */
const secretPattern =
    /(password|passwd|heslo|secret|token|api[_ -]?key)\s*[:=]\s*\S{4,}|-----BEGIN [A-Z ]*PRIVATE KEY-----/i;

function SecretWarning({ text }: { text: string }) {
    const { t } = useTranslation();

    if (!secretPattern.test(text)) {
        return null;
    }

    return (
        <p className="flex items-start gap-1.5 text-xs text-amber-600 dark:text-amber-400">
            <ShieldAlert className="mt-0.5 size-3.5 shrink-0" />
            {t(
                'This looks like a password or a key. Do not store it here, write only where it is kept.',
            )}
        </p>
    );
}

function SectionEditor({
    section,
    index: position,
    count,
    error,
    onChange,
    onMove,
    onRemove,
}: {
    section: DocumentSection;
    index: number;
    count: number;
    error?: string;
    onChange: (section: DocumentSection) => void;
    onMove: (direction: -1 | 1) => void;
    onRemove: () => void;
}) {
    const { t } = useTranslation();
    const [preview, setPreview] = useState(false);

    return (
        <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center gap-2">
                <Input
                    value={section.title}
                    onChange={(e) =>
                        onChange({ ...section, title: e.target.value })
                    }
                    aria-label={t('Section title')}
                    placeholder={t('Section title')}
                    className="font-medium"
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={position === 0}
                    onClick={() => onMove(-1)}
                    aria-label={t('Move up')}
                >
                    <ArrowUp className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={position === count - 1}
                    onClick={() => onMove(1)}
                    aria-label={t('Move down')}
                >
                    <ArrowDown className="size-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    aria-label={t('Remove section')}
                >
                    <Trash2 className="size-4" />
                </Button>
            </div>
            <InputError message={error} />

            <div className="flex gap-1 text-xs">
                {[false, true].map((value) => (
                    <button
                        key={String(value)}
                        type="button"
                        onClick={() => setPreview(value)}
                        className={cn(
                            'rounded-md px-2.5 py-1',
                            preview === value
                                ? 'bg-muted font-medium'
                                : 'text-muted-foreground hover:bg-muted/50',
                        )}
                    >
                        {value ? t('Preview') : t('Write')}
                    </button>
                ))}
            </div>

            {preview ? (
                <div className="min-h-32 rounded-md border bg-background p-3">
                    {section.body.trim() ? (
                        <Markdown source={section.body} />
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            {t('Nothing written yet')}
                        </p>
                    )}
                </div>
            ) : (
                <textarea
                    value={section.body}
                    onChange={(e) =>
                        onChange({ ...section, body: e.target.value })
                    }
                    rows={7}
                    aria-label={t('Section text')}
                    placeholder={t(
                        'Markdown works: **bold**, lists with -, `code` and ``` blocks.',
                    )}
                    className={cn(fieldClass, 'font-mono')}
                />
            )}
            <SecretWarning text={section.body} />
        </div>
    );
}

function TemplatePicker({
    templates,
    serverId,
}: {
    templates: Props['templates'];
    serverId: number | null;
}) {
    const { t } = useTranslation();

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
            <Link
                href={index()}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                {t('Documentation')}
            </Link>
            <div>
                <h1 className="text-2xl font-semibold">
                    {t('What do you want to document?')}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {t(
                        'Each template asks the questions that matter for that kind of page. You can add or remove sections later.',
                    )}
                </p>
            </div>
            <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 [&>li]:min-w-0">
                {Object.values(templates).map((template) => {
                    const Icon = templateIcon(template.icon);

                    return (
                        <li key={template.key}>
                            <Link
                                href={create({
                                    query: {
                                        template: template.key,
                                        ...(serverId
                                            ? { server: serverId }
                                            : {}),
                                    },
                                })}
                                className="flex h-full gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                            >
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                                    <Icon className="size-5" />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-medium">
                                        {template.label}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {template.description}
                                    </p>
                                </div>
                            </Link>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

function DocumentForm({
    document,
    template,
    serverId,
    servers,
}: {
    document: DocumentFull | null;
    template: DocumentTemplate;
    serverId: number | null;
    servers: Props['servers'];
}) {
    const { t } = useTranslation();
    const form = useForm<FormData>({
        template: template.key,
        title: document?.title ?? '',
        subject: document?.subject ?? '',
        status: document?.status ?? 'draft',
        server_id: serverId ? String(serverId) : '',
        reviewed_at: document?.reviewed_at ?? '',
        fields: document?.fields ?? {},
        sections: document?.sections ?? template.sections,
    });

    form.transform((data) => ({
        ...data,
        server_id: data.server_id === '' ? null : data.server_id,
        template: document ? undefined : data.template,
        reviewed_at: data.reviewed_at === '' ? null : data.reviewed_at,
    }));

    const submit = (event: FormEvent) => {
        event.preventDefault();

        if (document) {
            form.put(update.url(document.id));
        } else {
            form.post(store.url());
        }
    };

    const setSection = (position: number, section: DocumentSection) =>
        form.setData(
            'sections',
            form.data.sections.map((item, n) =>
                n === position ? section : item,
            ),
        );

    const moveSection = (position: number, direction: -1 | 1) => {
        const sections = [...form.data.sections];
        [sections[position], sections[position + direction]] = [
            sections[position + direction],
            sections[position],
        ];
        form.setData('sections', sections);
    };

    const errors = form.errors as Record<string, string | undefined>;
    const Icon = templateIcon(template.icon);

    return (
        <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
            <Link
                href={document ? show(document.id) : create()}
                className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                {document ? document.title : t('Choose another template')}
            </Link>

            <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-muted">
                    <Icon className="size-5" />
                </div>
                <div>
                    <h1 className="text-2xl font-semibold">
                        {document ? t('Edit document') : template.label}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {template.description}
                    </p>
                </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm">
                <ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-600" />
                <p>
                    {t(
                        'Never write passwords, tokens or private keys here. Keep them in a password manager and write only the name of the entry or a link to it.',
                    )}
                </p>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
                    <div className="space-y-1.5 md:col-span-2">
                        <Label htmlFor="doc-title">{t('Title')}</Label>
                        <Input
                            id="doc-title"
                            value={form.data.title}
                            onChange={(e) =>
                                form.setData('title', e.target.value)
                            }
                            placeholder={t(
                                'For example: Production web server',
                            )}
                            autoFocus={!document}
                        />
                        <InputError message={errors.title} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="doc-server">
                            {t('Server (optional)')}
                        </Label>
                        <select
                            id="doc-server"
                            className={fieldClass}
                            value={form.data.server_id}
                            onChange={(e) =>
                                form.setData('server_id', e.target.value)
                            }
                        >
                            <option value="">—</option>
                            {servers.map((server) => (
                                <option key={server.id} value={server.id}>
                                    {server.name}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.server_id} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="doc-subject">
                            {t('Service (optional)')}
                        </Label>
                        <Input
                            id="doc-subject"
                            value={form.data.subject}
                            onChange={(e) =>
                                form.setData('subject', e.target.value)
                            }
                            placeholder="nginx"
                        />
                        <InputError message={errors.subject} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="doc-status">{t('Status')}</Label>
                        <select
                            id="doc-status"
                            className={fieldClass}
                            value={form.data.status}
                            onChange={(e) =>
                                form.setData(
                                    'status',
                                    e.target.value as DocumentStatus,
                                )
                            }
                        >
                            <option value="draft">{t('Draft')}</option>
                            <option value="current">{t('Up to date')}</option>
                            <option value="outdated">{t('Outdated')}</option>
                        </select>
                        <InputError message={errors.status} />
                    </div>
                    <div className="space-y-1.5">
                        <Label htmlFor="doc-reviewed">
                            {t('Last reviewed')}
                        </Label>
                        <Input
                            id="doc-reviewed"
                            type="date"
                            value={form.data.reviewed_at}
                            onChange={(e) =>
                                form.setData('reviewed_at', e.target.value)
                            }
                        />
                        <InputError message={errors.reviewed_at} />
                    </div>
                </div>

                {template.fields.length > 0 && (
                    <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
                        {template.fields.map((field) => {
                            const value = form.data.fields[field.key] ?? '';
                            const setValue = (next: string) =>
                                form.setData('fields', {
                                    ...form.data.fields,
                                    [field.key]: next,
                                });

                            return (
                                <div
                                    key={field.key}
                                    className={cn(
                                        'space-y-1.5',
                                        field.type === 'textarea' &&
                                            'md:col-span-2',
                                    )}
                                >
                                    <Label htmlFor={`doc-${field.key}`}>
                                        {field.label}
                                    </Label>
                                    {field.type === 'textarea' ? (
                                        <textarea
                                            id={`doc-${field.key}`}
                                            rows={3}
                                            className={fieldClass}
                                            value={value}
                                            placeholder={field.placeholder}
                                            onChange={(e) =>
                                                setValue(e.target.value)
                                            }
                                        />
                                    ) : (
                                        <Input
                                            id={`doc-${field.key}`}
                                            type={
                                                field.type === 'date'
                                                    ? 'date'
                                                    : 'text'
                                            }
                                            value={value}
                                            placeholder={field.placeholder}
                                            onChange={(e) =>
                                                setValue(e.target.value)
                                            }
                                        />
                                    )}
                                    <SecretWarning text={value} />
                                    <InputError
                                        message={errors[`fields.${field.key}`]}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                <div className="space-y-3">
                    <h2 className="text-sm font-medium">{t('Sections')}</h2>
                    {form.data.sections.map((section, position) => (
                        <SectionEditor
                            key={position}
                            section={section}
                            index={position}
                            count={form.data.sections.length}
                            error={
                                errors[`sections.${position}.title`] ??
                                errors[`sections.${position}.body`]
                            }
                            onChange={(next) => setSection(position, next)}
                            onMove={(direction) =>
                                moveSection(position, direction)
                            }
                            onRemove={() =>
                                form.setData(
                                    'sections',
                                    form.data.sections.filter(
                                        (_, n) => n !== position,
                                    ),
                                )
                            }
                        />
                    ))}
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                            form.setData('sections', [
                                ...form.data.sections,
                                { title: '', body: '' },
                            ])
                        }
                    >
                        <Plus className="size-4" />
                        {t('Add section')}
                    </Button>
                    <InputError message={errors.sections} />
                </div>

                <div className="flex gap-2">
                    <Button type="submit" disabled={form.processing}>
                        {t('Save')}
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={document ? show(document.id) : index()}>
                            {t('Cancel')}
                        </Link>
                    </Button>
                </div>
            </form>
        </div>
    );
}

export default function DocumentFormPage({
    document,
    templates,
    template,
    serverId,
    servers,
}: Props) {
    const { t } = useTranslation();
    const chosen = templates[template];

    return (
        <>
            <Head title={document ? t('Edit document') : t('New document')} />
            {chosen ? (
                <DocumentForm
                    key={`${document?.id ?? 'new'}-${chosen.key}-${serverId}`}
                    document={document}
                    template={chosen}
                    serverId={serverId}
                    servers={servers}
                />
            ) : (
                <TemplatePicker templates={templates} serverId={serverId} />
            )}
        </>
    );
}
