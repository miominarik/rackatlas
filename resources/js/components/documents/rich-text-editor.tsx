import {
    Bold,
    Code,
    Heading2,
    Heading3,
    Italic,
    Link2,
    List,
    ListOrdered,
    SquareCode,
    Table,
    TableColumnsSplit,
    TableRowsSplit,
    Trash2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Markdown from '@/components/documents/markdown';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

/**
 * A visual editor on top of the markdown the documents are stored in: the markdown is
 * rendered to HTML for editing, and every change is turned back into markdown.
 */

const BLOCK_TAGS = new Set([
    'P',
    'DIV',
    'H1',
    'H2',
    'H3',
    'H4',
    'H5',
    'H6',
    'UL',
    'OL',
    'PRE',
    'TABLE',
    'BLOCKQUOTE',
]);

function wrap(text: string, mark: string): string {
    const [, before, body, after] = text.match(/^(\s*)([\s\S]*?)(\s*)$/) ?? [];

    return body ? `${before}${mark}${body}${mark}${after}` : text;
}

function inlineChildren(node: Node, skip: Set<string> = new Set()): string {
    return Array.from(node.childNodes)
        .filter(
            (child) =>
                !(child instanceof HTMLElement && skip.has(child.tagName)),
        )
        .map(inline)
        .join('');
}

function inline(node: Node): string {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.textContent ?? '').replace(/ /g, ' ');
    }

    if (!(node instanceof HTMLElement)) {
        return '';
    }

    switch (node.tagName) {
        case 'BR':
            return '\n';
        case 'B':
        case 'STRONG':
            return wrap(inlineChildren(node), '**');
        case 'I':
        case 'EM':
            return wrap(inlineChildren(node), '*');
        case 'CODE':
            return wrap(node.textContent ?? '', '`');
        case 'A': {
            const href = node.getAttribute('href') ?? '';
            const text = inlineChildren(node);

            return /^https?:\/\//.test(href) && text.trim()
                ? `[${text.trim()}](${href})`
                : text;
        }
        default:
            return inlineChildren(node);
    }
}

function blocks(parent: Node): string[] {
    const out: string[] = [];
    let buffer = '';
    const flush = () => {
        if (buffer.trim()) {
            out.push(buffer.trim());
        }

        buffer = '';
    };

    for (const child of Array.from(parent.childNodes)) {
        if (child instanceof HTMLElement && BLOCK_TAGS.has(child.tagName)) {
            flush();
            out.push(...block(child));
        } else {
            buffer += inline(child);
        }
    }

    flush();

    return out;
}

function block(el: HTMLElement): string[] {
    switch (el.tagName) {
        case 'H1':
        case 'H2':
        case 'H3':
            return [`## ${inlineChildren(el).trim()}`];
        case 'H4':
        case 'H5':
        case 'H6':
            return [`### ${inlineChildren(el).trim()}`];
        case 'UL':
        case 'OL': {
            const ordered = el.tagName === 'OL';
            const items = Array.from(el.querySelectorAll('li')).map(
                (li, n) =>
                    `${ordered ? `${n + 1}.` : '-'} ${inlineChildren(li, new Set(['UL', 'OL'])).trim()}`,
            );

            return [items.join('\n')];
        }
        case 'PRE':
            return [
                `\`\`\`\n${(el.textContent ?? '').replace(/\n$/, '')}\n\`\`\``,
            ];
        case 'TABLE': {
            const rows = Array.from(el.querySelectorAll('tr')).map((tr) =>
                Array.from(tr.children).map((cell) =>
                    inlineChildren(cell).trim().replace(/\|/g, '/'),
                ),
            );

            if (rows.length === 0) {
                return [];
            }

            const line = (cells: string[]) => `| ${cells.join(' | ')} |`;

            return [
                [
                    line(rows[0]),
                    line(rows[0].map(() => '---')),
                    ...rows.slice(1).map(line),
                ].join('\n'),
            ];
        }
        default:
            return blocks(el);
    }
}

export function markdownFromHtml(root: HTMLElement): string {
    return blocks(root).join('\n\n');
}

const escapeHtml = (text: string): string =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

type Tool = {
    label: string;
    icon: LucideIcon;
    run: (selection: string) => void;
    /** Only usable while the caret is inside a table. */
    needsTable?: boolean;
};

const newTable = (): string => {
    const cells = (tag: string) => `<${tag}><br></${tag}>`.repeat(3);

    return `<table><thead><tr>${cells('th')}</tr></thead><tbody>${`<tr>${cells('td')}</tr>`.repeat(2)}</tbody></table><p><br></p>`;
};

/** The table cell the caret is in, if any. */
const currentCell = (root: HTMLElement | null): HTMLTableCellElement | null => {
    const node = window.getSelection()?.anchorNode;
    const element = node instanceof HTMLElement ? node : node?.parentElement;
    const cell = element?.closest('td, th') ?? null;

    return cell && root?.contains(cell) ? (cell as HTMLTableCellElement) : null;
};

const emptyCell = (tag: string): HTMLElement => {
    const cell = document.createElement(tag);
    cell.innerHTML = '<br>';

    return cell;
};

const addRow = (cell: HTMLTableCellElement) => {
    const row = cell.parentElement as HTMLTableRowElement;
    const copy = document.createElement('tr');

    Array.from(row.children).forEach(() => copy.appendChild(emptyCell('td')));
    (row.parentElement?.tagName === 'THEAD'
        ? row.closest('table')?.tBodies[0]
        : row.parentElement
    )?.insertBefore(
        copy,
        row.parentElement?.tagName === 'THEAD' ? null : row.nextSibling,
    );
};

const addColumn = (cell: HTMLTableCellElement) => {
    const index = cell.cellIndex;

    cell.closest('table')
        ?.querySelectorAll('tr')
        .forEach((row) => {
            const tag = row.children[0]?.tagName === 'TH' ? 'th' : 'td';
            row.insertBefore(emptyCell(tag), row.children[index + 1] ?? null);
        });
};

const exec = (command: string, value?: string) =>
    document.execCommand(command, false, value);

export default function RichTextEditor({
    value,
    onChange,
}: {
    value: string;
    onChange: (markdown: string) => void;
}) {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);
    const [inTable, setInTable] = useState(false);

    useEffect(() => {
        const update = () => setInTable(currentCell(ref.current) !== null);

        document.addEventListener('selectionchange', update);

        return () => document.removeEventListener('selectionchange', update);
    }, []);

    const sync = () => {
        if (ref.current) {
            onChange(markdownFromHtml(ref.current));
        }
    };

    const tools: Tool[] = [
        {
            label: t('Heading'),
            icon: Heading2,
            run: () => exec('formatBlock', 'h3'),
        },
        {
            label: t('Subheading'),
            icon: Heading3,
            run: () => exec('formatBlock', 'h4'),
        },
        { label: t('Bold'), icon: Bold, run: () => exec('bold') },
        { label: t('Italic'), icon: Italic, run: () => exec('italic') },
        {
            label: t('Bulleted list'),
            icon: List,
            run: () => exec('insertUnorderedList'),
        },
        {
            label: t('Numbered list'),
            icon: ListOrdered,
            run: () => exec('insertOrderedList'),
        },
        {
            label: t('Link'),
            icon: Link2,
            run: () => {
                const url = window.prompt(
                    t('Enter the address of the link (https://...)'),
                    'https://',
                );

                if (url && /^https?:\/\//.test(url)) {
                    exec('createLink', url);
                }
            },
        },
        {
            label: t('Code'),
            icon: Code,
            run: (selection) =>
                selection &&
                exec('insertHTML', `<code>${escapeHtml(selection)}</code>`),
        },
        {
            label: t('Insert table'),
            icon: Table,
            run: () => exec('insertHTML', newTable()),
        },
        {
            label: t('Add row'),
            icon: TableRowsSplit,
            needsTable: true,
            run: () => {
                const cell = currentCell(ref.current);

                if (cell) {
                    addRow(cell);
                }
            },
        },
        {
            label: t('Add column'),
            icon: TableColumnsSplit,
            needsTable: true,
            run: () => {
                const cell = currentCell(ref.current);

                if (cell) {
                    addColumn(cell);
                }
            },
        },
        {
            label: t('Delete table'),
            icon: Trash2,
            needsTable: true,
            run: () => currentCell(ref.current)?.closest('table')?.remove(),
        },
        {
            label: t('Code block'),
            icon: SquareCode,
            run: (selection) =>
                exec(
                    'insertHTML',
                    `<pre>${escapeHtml(selection || ' ')}</pre><p><br></p>`,
                ),
        },
    ];

    return (
        <div className="overflow-hidden rounded-md border border-input bg-background focus-within:ring-[3px] focus-within:ring-ring/50">
            <div
                role="toolbar"
                aria-label={t('Text formatting')}
                className="flex flex-wrap gap-0.5 border-b bg-muted/40 p-1"
            >
                {tools.map((tool) => (
                    <button
                        key={tool.label}
                        type="button"
                        title={tool.label}
                        disabled={tool.needsTable && !inTable}
                        aria-label={tool.label}
                        onMouseDown={(event) => event.preventDefault()}
                        onClick={() => {
                            ref.current?.focus();
                            tool.run(window.getSelection()?.toString() ?? '');
                            sync();
                        }}
                        className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
                    >
                        <tool.icon className="size-4" />
                    </button>
                ))}
            </div>
            <div
                ref={(node) => {
                    // Filled once: later renders must not move the caret.
                    if (node && !node.dataset.ready) {
                        node.dataset.ready = '1';
                        node.innerHTML = renderToStaticMarkup(
                            <Markdown source={value} />,
                        );
                    }

                    ref.current = node;
                }}
                contentEditable
                suppressContentEditableWarning
                role="textbox"
                aria-multiline="true"
                aria-label={t('Section text')}
                onInput={sync}
                onPaste={(event) => {
                    event.preventDefault();
                    exec(
                        'insertText',
                        event.clipboardData.getData('text/plain'),
                    );
                }}
                className={cn(
                    'min-h-40 space-y-3 p-3 text-sm leading-relaxed outline-none',
                    '[&_h3]:text-base [&_h3]:font-semibold [&_h4]:text-sm [&_h4]:font-semibold',
                    '[&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:space-y-1 [&_ol]:pl-5',
                    '[&_a]:text-primary [&_a]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-[0.85em]',
                    '[&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:border [&_pre]:bg-muted/50 [&_pre]:p-3 [&_pre]:font-mono [&_pre]:text-xs',
                    '[&_table]:w-full [&_table]:border-collapse [&_th]:border [&_th]:bg-muted/40 [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-medium [&_td]:border [&_td]:px-2 [&_td]:py-1.5',
                    '[&_strong]:font-semibold [&_em]:italic [&_i]:italic [&_b]:font-semibold',
                )}
            />
        </div>
    );
}
