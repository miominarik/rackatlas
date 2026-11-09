import type { ReactNode } from 'react';

/**
 * A small, safe markdown renderer for documentation: headings, lists, tables, code,
 * bold, italic, inline code and http(s) links. Nothing is ever inserted as raw HTML.
 */

const inlinePattern =
    /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;

const listItem = /^\s*([-*]|\d+\.)\s/;

function inline(text: string, keyPrefix: string): ReactNode[] {
    const nodes: ReactNode[] = [];
    let last = 0;
    let index = 0;

    for (const match of text.matchAll(inlinePattern)) {
        const start = match.index ?? 0;
        const token = match[0];
        const key = `${keyPrefix}-${index++}`;

        if (start > last) {
            nodes.push(text.slice(last, start));
        }

        if (match[1]) {
            nodes.push(
                <code
                    key={key}
                    className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]"
                >
                    {token.slice(1, -1)}
                </code>,
            );
        } else if (match[2]) {
            nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>);
        } else if (match[3]) {
            nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
        } else {
            const [, label, href] = token.match(/^\[([^\]]+)\]\((.+)\)$/) ?? [];

            nodes.push(
                <a
                    key={key}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="text-primary underline underline-offset-2"
                >
                    {label}
                </a>,
            );
        }

        last = start + token.length;
    }

    if (last < text.length) {
        nodes.push(text.slice(last));
    }

    return nodes;
}

const splitRow = (line: string): string[] =>
    line
        .trim()
        .replace(/^\||\|$/g, '')
        .split('|')
        .map((cell) => cell.trim());

const isTableDivider = (line: string | undefined): boolean =>
    line !== undefined &&
    /^\s*\|?[\s:|-]+\|?\s*$/.test(line) &&
    line.includes('-');

export default function Markdown({ source }: { source: string }) {
    const lines = source.replace(/\r\n/g, '\n').split('\n');
    const blocks: ReactNode[] = [];
    let i = 0;
    let key = 0;

    while (i < lines.length) {
        const line = lines[i];
        const id = `b${key++}`;

        if (line.trim() === '') {
            i++;
        } else if (line.startsWith('```')) {
            const code: string[] = [];
            i++;

            while (i < lines.length && !lines[i].startsWith('```')) {
                code.push(lines[i++]);
            }

            i++;
            blocks.push(
                <pre
                    key={id}
                    className="overflow-x-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs"
                >
                    {code.join('\n')}
                </pre>,
            );
        } else if (/^#{1,4}\s/.test(line)) {
            const level = line.match(/^#+/)![0].length;
            const Heading = level <= 2 ? 'h3' : 'h4';
            blocks.push(
                <Heading
                    key={id}
                    className={
                        level <= 2
                            ? 'text-base font-semibold'
                            : 'text-sm font-semibold'
                    }
                >
                    {inline(line.replace(/^#+\s+/, ''), id)}
                </Heading>,
            );
            i++;
        } else if (listItem.test(line)) {
            const ordered = /^\s*\d+\./.test(line);
            const items: string[] = [];

            while (i < lines.length && listItem.test(lines[i])) {
                items.push(lines[i++].replace(/^\s*([-*]|\d+\.)\s+/, ''));
            }

            const ListTag = ordered ? 'ol' : 'ul';
            blocks.push(
                <ListTag
                    key={id}
                    className={
                        ordered
                            ? 'list-decimal space-y-1 pl-5'
                            : 'list-disc space-y-1 pl-5'
                    }
                >
                    {items.map((item, n) => (
                        <li key={n}>{inline(item, `${id}-${n}`)}</li>
                    ))}
                </ListTag>,
            );
        } else if (line.includes('|') && isTableDivider(lines[i + 1])) {
            const head = splitRow(line);
            const rows: string[][] = [];
            i += 2;

            while (i < lines.length && lines[i].includes('|')) {
                rows.push(splitRow(lines[i++]));
            }

            blocks.push(
                <div key={id} className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-sm">
                        <thead>
                            <tr>
                                {head.map((cell, n) => (
                                    <th
                                        key={n}
                                        className="border-b px-2 py-1.5 font-medium"
                                    >
                                        {inline(cell, `${id}-h${n}`)}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map((row, r) => (
                                <tr key={r}>
                                    {row.map((cell, n) => (
                                        <td
                                            key={n}
                                            className="border-b px-2 py-1.5"
                                        >
                                            {inline(cell, `${id}-${r}-${n}`)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>,
            );
        } else {
            const paragraph: string[] = [];

            while (
                i < lines.length &&
                lines[i].trim() !== '' &&
                !lines[i].startsWith('```') &&
                !/^#{1,4}\s/.test(lines[i]) &&
                !listItem.test(lines[i])
            ) {
                paragraph.push(lines[i++]);
            }

            blocks.push(
                <p key={id} className="break-words whitespace-pre-line">
                    {inline(paragraph.join('\n'), id)}
                </p>,
            );
        }
    }

    return <div className="space-y-3 text-sm leading-relaxed">{blocks}</div>;
}
