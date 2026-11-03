import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';
import TerminalSessionController from '@/actions/App/Http/Controllers/Terminal/TerminalSessionController';
import { echo } from '@/lib/echo';

export type TerminalState = 'connecting' | 'ready' | 'closed' | 'error';

export type TerminalHandle = {
    clear: () => void;
    focus: () => void;
    copySelection: () => Promise<boolean>;
};

type Props = {
    serverId: number;
    active: boolean;
    fontSize: number;
    onState: (state: TerminalState, message?: string) => void;
    ref?: Ref<TerminalHandle>;
};

const THEME = {
    background: '#0c0e12',
    foreground: '#d4d8e0',
    cursor: '#e2e8f0',
    cursorAccent: '#0c0e12',
    selectionBackground: '#334155aa',
    black: '#1e2229',
    red: '#f87171',
    green: '#4ade80',
    yellow: '#fbbf24',
    blue: '#60a5fa',
    magenta: '#c084fc',
    cyan: '#22d3ee',
    white: '#d4d8e0',
    brightBlack: '#64748b',
    brightRed: '#fca5a5',
    brightGreen: '#86efac',
    brightYellow: '#fde68a',
    brightBlue: '#93c5fd',
    brightMagenta: '#d8b4fe',
    brightCyan: '#67e8f9',
    brightWhite: '#f8fafc',
};

function csrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

/**
 * One terminal: asks the app to start an SSH shell, listens to its output on a private Reverb channel
 * and sends keystrokes back over HTTP.
 */
export default function TerminalView({
    serverId,
    active,
    fontSize,
    onState,
    ref,
}: Props) {
    const host = useRef<HTMLDivElement>(null);
    const term = useRef<Terminal | null>(null);
    const fit = useRef<FitAddon | null>(null);
    const onStateRef = useRef(onState);
    onStateRef.current = onState;

    useImperativeHandle(ref, () => ({
        clear: () => term.current?.clear(),
        focus: () => term.current?.focus(),
        copySelection: async () => {
            const text = term.current?.getSelection() ?? '';

            if (text === '') {
                return false;
            }

            await navigator.clipboard.writeText(text);

            return true;
        },
    }));

    useEffect(() => {
        const element = host.current;

        if (element === null) {
            return;
        }

        const terminal = new Terminal({
            fontFamily:
                'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
            fontSize,
            lineHeight: 1.25,
            cursorBlink: true,
            scrollback: 5000,
            theme: THEME,
            allowProposedApi: true,
        });
        const fitAddon = new FitAddon();

        terminal.loadAddon(fitAddon);
        terminal.loadAddon(new WebLinksAddon());
        terminal.open(element);
        term.current = terminal;
        fit.current = fitAddon;

        let sessionId: string | null = null;
        let leave = () => {};
        let disposed = false;
        let finished = false;
        let sending = false;
        let pending = '';

        const finish = (state: TerminalState, message?: string) => {
            if (finished) {
                return;
            }

            finished = true;
            onStateRef.current(state, message);
        };

        const post = (path: string, body: object) =>
            fetch(path, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-XSRF-TOKEN': csrfToken(),
                },
                body: JSON.stringify(body),
            });

        /** Keystrokes go out one request at a time, so the shell receives them in order. */
        const flush = async () => {
            if (sending || sessionId === null) {
                return;
            }

            sending = true;

            while (pending !== '' && !disposed) {
                const data = pending;

                pending = '';

                try {
                    await post(
                        TerminalSessionController.input.url(sessionId),
                        { data },
                    );
                } catch {
                    finish('error', 'The terminal server is not reachable.');
                    break;
                }
            }

            sending = false;
        };

        const sendSize = () => {
            if (sessionId !== null) {
                void post(TerminalSessionController.resize.url(sessionId), {
                    cols: terminal.cols,
                    rows: terminal.rows,
                }).catch(() => undefined);
            }
        };

        const refit = () => {
            if (element.offsetParent !== null) {
                try {
                    fitAddon.fit();
                } catch {
                    // The terminal is not visible yet.
                }
            }
        };

        refit();

        const observer = new ResizeObserver(() => requestAnimationFrame(refit));
        observer.observe(element);

        terminal.onData((data) => {
            pending += data;
            void flush();
        });
        terminal.onResize(sendSize);

        void (async () => {
            onStateRef.current('connecting');

            try {
                const response = await post(
                    TerminalSessionController.store.url(),
                    { server_id: serverId },
                );
                const data = await response.json().catch(() => ({}));

                if (disposed) {
                    return;
                }

                if (!response.ok) {
                    finish(
                        'error',
                        data.message ?? 'The session could not be prepared.',
                    );

                    return;
                }

                sessionId = data.id as string;

                // The size is known before the shell opens, so it starts with the right window.
                sendSize();

                const channel = echo()
                    .private(data.channel as string)
                    .subscribed(() => {
                        void post(
                            TerminalSessionController.attach.url(
                                sessionId as string,
                            ),
                            {},
                        );
                    })
                    .error(() =>
                        finish('error', 'The terminal server is not reachable.'),
                    )
                    .listen('.output', (event: { d: string }) => {
                        const binary = atob(event.d);
                        const bytes = new Uint8Array(binary.length);

                        for (let i = 0; i < binary.length; i++) {
                            bytes[i] = binary.charCodeAt(i);
                        }

                        terminal.write(bytes);
                    })
                    .listen(
                        '.status',
                        (event: { state: string; message: string | null }) => {
                            if (event.state === 'ready') {
                                onStateRef.current('ready');
                                terminal.focus();
                            } else if (event.state === 'error') {
                                terminal.write(
                                    `\r\n\x1b[31m${event.message ?? ''}\x1b[0m\r\n`,
                                );
                                finish('error', event.message ?? undefined);
                            } else {
                                terminal.write(
                                    '\r\n\x1b[90m[connection closed]\x1b[0m\r\n',
                                );
                                finish('closed');
                            }
                        },
                    );

                leave = () => {
                    channel.stopListening('.output').stopListening('.status');
                    echo().leave(data.channel as string);
                };
            } catch {
                finish('error', 'The terminal server is not reachable.');
            }
        })();

        return () => {
            disposed = true;
            observer.disconnect();
            leave();

            if (sessionId !== null) {
                void fetch(TerminalSessionController.destroy.url(sessionId), {
                    method: 'DELETE',
                    keepalive: true,
                    headers: {
                        Accept: 'application/json',
                        'X-XSRF-TOKEN': csrfToken(),
                    },
                }).catch(() => undefined);
            }

            terminal.dispose();
            term.current = null;
            fit.current = null;
        };
        // The terminal is created once per mount: a new connection mounts a new one.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [serverId]);

    useEffect(() => {
        if (term.current) {
            term.current.options.fontSize = fontSize;
            requestAnimationFrame(() => fit.current?.fit());
        }
    }, [fontSize]);

    useEffect(() => {
        if (active) {
            requestAnimationFrame(() => {
                try {
                    fit.current?.fit();
                } catch {
                    // Not visible yet.
                }

                term.current?.focus();
            });
        }
    }, [active]);

    return <div ref={host} className="h-full w-full" />;
}
