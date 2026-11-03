import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { useEffect, useImperativeHandle, useRef } from 'react';
import type { Ref } from 'react';
import TerminalSessionController from '@/actions/App/Http/Controllers/Terminal/TerminalSessionController';

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
 * One terminal: asks the app for a one-time ticket, opens a WebSocket to the terminal server with it and
 * wires the keyboard and the screen to the SSH shell on the other side.
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

        let socket: WebSocket | null = null;
        let disposed = false;
        let finished = false;

        const finish = (state: TerminalState, message?: string) => {
            if (finished) {
                return;
            }

            finished = true;
            onStateRef.current(state, message);
        };

        const sendSize = () => {
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(
                    JSON.stringify({
                        t: 'r',
                        c: terminal.cols,
                        r: terminal.rows,
                    }),
                );
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
            if (socket?.readyState === WebSocket.OPEN) {
                socket.send(JSON.stringify({ t: 'i', d: data }));
            }
        });
        terminal.onResize(sendSize);

        void (async () => {
            onStateRef.current('connecting');

            try {
                const response = await fetch(
                    TerminalSessionController.store.url(),
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Accept: 'application/json',
                            'X-XSRF-TOKEN': csrfToken(),
                        },
                        body: JSON.stringify({ server_id: serverId }),
                    },
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

                socket = new WebSocket(
                    `${data.url}?token=${encodeURIComponent(data.token)}`,
                );
                socket.binaryType = 'arraybuffer';

                socket.onopen = sendSize;
                socket.onmessage = (event) => {
                    if (typeof event.data !== 'string') {
                        terminal.write(new Uint8Array(event.data));

                        return;
                    }

                    const message = JSON.parse(event.data);

                    if (message.t === 'status' && message.state === 'ready') {
                        onStateRef.current('ready');
                        terminal.focus();
                    } else if (message.t === 'error') {
                        terminal.write(
                            `\r\n\x1b[31m${message.message}\x1b[0m\r\n`,
                        );
                        finish('error', message.message);
                    }
                };
                socket.onerror = () =>
                    finish('error', 'The terminal server is not reachable.');
                socket.onclose = () => {
                    if (!disposed) {
                        terminal.write(
                            '\r\n\x1b[90m[connection closed]\x1b[0m\r\n',
                        );
                        finish('closed');
                    }
                };
            } catch {
                finish('error', 'The terminal server is not reachable.');
            }
        })();

        return () => {
            disposed = true;
            observer.disconnect();
            socket?.close();
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
