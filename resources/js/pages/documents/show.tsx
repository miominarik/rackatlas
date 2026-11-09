import { Head, Link, router } from '@inertiajs/react';
import { ArrowLeft, CheckCircle2, Pencil, Trash2 } from 'lucide-react';
import Markdown from '@/components/documents/markdown';
import {
    isStale,
    StatusBadge,
    templateIcon,
} from '@/components/documents/meta';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { destroy, edit, index, review } from '@/routes/documents';
import { show as serverShow } from '@/routes/servers';
import type { DocumentFull, DocumentTemplate } from '@/types';

type Props = {
    document: DocumentFull;
    template: DocumentTemplate | null;
    canManage: boolean;
};

export default function DocumentShow({ document, template, canManage }: Props) {
    const { t, locale } = useTranslation();
    const Icon = templateIcon(template?.icon ?? '');
    const date = (value: string) => new Date(value).toLocaleDateString(locale);
    const answers = (template?.fields ?? []).filter(
        (field) => document.fields[field.key],
    );

    const remove = () => {
        if (window.confirm(t('Delete this document? This cannot be undone.'))) {
            router.delete(destroy.url(document.id));
        }
    };

    return (
        <>
            <Head title={document.title} />

            <div className="mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6">
                <Link
                    href={index()}
                    className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
                >
                    <ArrowLeft className="size-4" />
                    {t('Documentation')}
                </Link>

                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold break-words">
                                {document.title}
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                {[template?.label, document.subject]
                                    .filter(Boolean)
                                    .join(' · ')}
                            </p>
                        </div>
                    </div>
                    {canManage && (
                        <div className="flex flex-wrap gap-2">
                            <Button variant="outline" asChild>
                                <Link href={edit(document.id)}>
                                    <Pencil className="size-4" />
                                    {t('Edit')}
                                </Link>
                            </Button>
                            <Button
                                variant="outline"
                                onClick={remove}
                                aria-label={t('Delete')}
                            >
                                <Trash2 className="size-4" />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card p-3 text-sm">
                    <StatusBadge status={document.status} />
                    {document.server_id && (
                        <Link
                            href={serverShow(document.server_id)}
                            className="text-primary underline-offset-2 hover:underline"
                        >
                            {document.server_name}
                        </Link>
                    )}
                    <span className="text-muted-foreground">
                        {document.reviewed_at
                            ? t('Reviewed :date', {
                                  date: date(document.reviewed_at),
                              })
                            : t('Not reviewed')}
                    </span>
                    {document.updated_at && (
                        <span className="text-muted-foreground">
                            {t('Edited :date', {
                                date: date(document.updated_at),
                            })}
                            {document.updated_by
                                ? ` · ${document.updated_by}`
                                : ''}
                        </span>
                    )}
                    {canManage && (
                        <Button
                            size="sm"
                            variant="secondary"
                            className="ml-auto"
                            onClick={() =>
                                router.post(
                                    review.url(document.id),
                                    {},
                                    { preserveScroll: true },
                                )
                            }
                        >
                            <CheckCircle2 className="size-4" />
                            {t('Still accurate today')}
                        </Button>
                    )}
                </div>

                {document.status === 'current' &&
                    isStale(document.reviewed_at) && (
                        <Badge variant="destructive">
                            {t(
                                'Not reviewed for a long time, check that it still matches reality.',
                            )}
                        </Badge>
                    )}

                {answers.length > 0 && (
                    <dl className="divide-y rounded-xl border bg-card">
                        {answers.map((field) => (
                            <div
                                key={field.key}
                                className="grid gap-x-4 gap-y-0.5 px-4 py-2.5 text-sm sm:grid-cols-[12rem_1fr]"
                            >
                                <dt className="text-muted-foreground">
                                    {field.label}
                                </dt>
                                <dd className="min-w-0 break-words whitespace-pre-line">
                                    {document.fields[field.key]}
                                </dd>
                            </div>
                        ))}
                    </dl>
                )}

                {document.sections.map((section, index) => (
                    <section
                        key={index}
                        className="space-y-2 rounded-xl border bg-card p-4"
                    >
                        <h2 className="font-medium">{section.title}</h2>
                        {section.body.trim() === '' ? (
                            <p className="text-sm text-muted-foreground italic">
                                {t('Nothing written yet')}
                            </p>
                        ) : (
                            <Markdown source={section.body} />
                        )}
                    </section>
                ))}
            </div>
        </>
    );
}
