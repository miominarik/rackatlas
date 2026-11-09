import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle2,
    Plus,
    Search,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    isStale,
    StatusBadge,
    templateIcon,
} from '@/components/documents/meta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';
import { create, show } from '@/routes/documents';
import { index as teamsIndex } from '@/routes/teams';
import type { DocumentSummary, DocumentTemplate } from '@/types';

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    templates: Record<string, DocumentTemplate>;
    servers: {
        id: number;
        name: string;
        documents: number;
        documented: boolean;
    }[];
    documents: DocumentSummary[];
};

const fieldClass =
    'rounded-md border border-input bg-white dark:bg-input/30 px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50';

export default function DocumentsIndex({
    team,
    canManage,
    templates,
    servers,
    documents,
}: Props) {
    const { t, locale } = useTranslation();
    const [search, setSearch] = useState('');
    const [serverFilter, setServerFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');

    const missing = servers.filter((server) => !server.documented);

    const filtered = useMemo(() => {
        const needle = search.trim().toLowerCase();

        return documents.filter(
            (doc) =>
                (serverFilter === '' ||
                    (serverFilter === 'none'
                        ? doc.server_id === null
                        : String(doc.server_id) === serverFilter)) &&
                (typeFilter === '' || doc.template === typeFilter) &&
                (needle === '' ||
                    `${doc.title} ${doc.subject ?? ''} ${doc.server_name ?? ''}`
                        .toLowerCase()
                        .includes(needle)),
        );
    }, [documents, search, serverFilter, typeFilter]);

    if (!team) {
        return (
            <>
                <Head title={t('Documentation')} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-xl font-semibold">
                        {t('Create a team first')}
                    </h1>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t('Create team')}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const date = (value: string) => new Date(value).toLocaleDateString(locale);

    return (
        <>
            <Head title={t('Documentation')} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            {t('Documentation')}
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {t(
                                'Write down how your servers and services work, so you or someone else can fix them at night without guessing.',
                            )}
                        </p>
                    </div>
                    {canManage && (
                        <Button asChild>
                            <Link href={create()}>
                                <Plus className="size-4" />
                                {t('New document')}
                            </Link>
                        </Button>
                    )}
                </div>

                <section
                    aria-label={t('Documentation coverage')}
                    className="space-y-3 rounded-xl border bg-card p-4"
                >
                    <div className="flex items-center gap-2">
                        {missing.length === 0 && servers.length > 0 ? (
                            <CheckCircle2 className="size-4 text-green-600" />
                        ) : (
                            <AlertTriangle className="size-4 text-amber-500" />
                        )}
                        <h2 className="text-sm font-medium">
                            {servers.length === 0
                                ? t('No servers yet')
                                : missing.length === 0
                                  ? t('Every server has documentation')
                                  : t(
                                        ':count of :total servers have no documentation',
                                        {
                                            count: missing.length,
                                            total: servers.length,
                                        },
                                    )}
                        </h2>
                    </div>
                    {servers.length > 0 && (
                        <ul className="flex flex-wrap gap-2">
                            {servers.map((server) => (
                                <li key={server.id}>
                                    {server.documented ? (
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setServerFilter(
                                                    String(server.id),
                                                )
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs hover:bg-muted"
                                        >
                                            <CheckCircle2 className="size-3 text-green-600" />
                                            {server.name}
                                            <span className="text-muted-foreground">
                                                {server.documents}
                                            </span>
                                        </button>
                                    ) : canManage ? (
                                        <Link
                                            href={create({
                                                query: {
                                                    template: 'server',
                                                    server: server.id,
                                                },
                                            })}
                                            className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs hover:bg-amber-500/20"
                                        >
                                            <Plus className="size-3" />
                                            {server.name}
                                        </Link>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/50 bg-amber-500/10 px-2.5 py-1 text-xs">
                                            {server.name}
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                    {missing.length > 0 && canManage && (
                        <p className="text-xs text-muted-foreground">
                            {t(
                                'Click a highlighted server to start with its overview.',
                            )}
                        </p>
                    )}
                </section>

                {documents.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <BookOpen className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {t('No documentation yet')}
                        </p>
                        <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                            {t(
                                'Pick a template and fill in the questions. A server overview is the best first page.',
                            )}
                        </p>
                        {canManage && (
                            <Button asChild className="mt-4">
                                <Link href={create()}>
                                    {t('Choose a template')}
                                </Link>
                            </Button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-2">
                            <div className="relative min-w-48 flex-1">
                                <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
                                <Input
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder={t('Search documents')}
                                    aria-label={t('Search documents')}
                                    className="pl-9"
                                />
                            </div>
                            <select
                                aria-label={t('Server')}
                                className={fieldClass}
                                value={serverFilter}
                                onChange={(e) =>
                                    setServerFilter(e.target.value)
                                }
                            >
                                <option value="">{t('All servers')}</option>
                                <option value="none">
                                    {t('Not tied to a server')}
                                </option>
                                {servers.map((server) => (
                                    <option key={server.id} value={server.id}>
                                        {server.name}
                                    </option>
                                ))}
                            </select>
                            <select
                                aria-label={t('Type')}
                                className={fieldClass}
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                            >
                                <option value="">{t('All types')}</option>
                                {Object.values(templates).map((template) => (
                                    <option
                                        key={template.key}
                                        value={template.key}
                                    >
                                        {template.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {filtered.length === 0 ? (
                            <p className="py-8 text-center text-sm text-muted-foreground">
                                {t('No document matches the filter')}
                            </p>
                        ) : (
                            <ul className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3 [&>li]:min-w-0">
                                {filtered.map((doc) => {
                                    const Icon = templateIcon(
                                        templates[doc.template]?.icon ?? '',
                                    );

                                    return (
                                        <li key={doc.id}>
                                            <Link
                                                href={show(doc.id)}
                                                prefetch
                                                className="flex h-full flex-col gap-3 rounded-xl border bg-card p-4 transition-colors hover:bg-muted/40"
                                            >
                                                <div className="flex items-start gap-2">
                                                    <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                                                    <div className="min-w-0 flex-1">
                                                        <p className="font-medium break-words">
                                                            {doc.title}
                                                        </p>
                                                        <p className="text-xs break-words text-muted-foreground">
                                                            {[
                                                                templates[
                                                                    doc.template
                                                                ]?.label,
                                                                doc.server_name,
                                                                doc.subject,
                                                            ]
                                                                .filter(Boolean)
                                                                .join(' · ')}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-auto flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                    <StatusBadge
                                                        status={doc.status}
                                                    />
                                                    {doc.status === 'current' &&
                                                        isStale(
                                                            doc.reviewed_at,
                                                        ) && (
                                                            <Badge variant="destructive">
                                                                {t(
                                                                    'Review needed',
                                                                )}
                                                            </Badge>
                                                        )}
                                                    <span
                                                        className={cn(
                                                            'ml-auto',
                                                        )}
                                                    >
                                                        {doc.reviewed_at
                                                            ? t(
                                                                  'Reviewed :date',
                                                                  {
                                                                      date: date(
                                                                          doc.reviewed_at,
                                                                      ),
                                                                  },
                                                              )
                                                            : t('Not reviewed')}
                                                    </span>
                                                </div>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                )}
            </div>
        </>
    );
}
