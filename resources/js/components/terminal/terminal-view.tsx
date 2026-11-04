import { FitAddon } from '@xterm/addon-fit';
import { WebLinksAddon } from '@xterm/addon-web-links';
import { Terminal } from '@xterm/xterm';
import '@xterm/xterm/css/xterm.css';
import { ShieldCheck, TriangleAlert } from 'lucide-react';
import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { Ref } from 'react';
import TerminalSessionController from '@/actions/App/Http/Controllers/Terminal/TerminalSessionController';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import {
    beginHandshake,
    pinFingerprint,
    pinnedFingerprint,
} from '@/lib/terminal-e2e';
import type { Handshake, KeyReply, SecureChannel } from '@/lib/terminal-e2e';

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

type IdentityPrompt = {
    fingerprint: string;
    previous: string | null;
    answer: (trusted: boolean) => void;
};

const encoder = new TextEncoder();

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
    const { t } = useTranslation();
    const [prompt, setPrompt] = useState<IdentityPrompt | null>(null);
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

        // Through the agent everything after the handshake is end-to-end encrypted.
        let secure = false;
        let handshake: Handshake | null = null;
        let handshakeTimer: ReturnType<typeof setTimeout> | undefined;
        let channel: SecureChannel | null = null;
        let resolveChannel: (channel: SecureChannel) => void = () => {};
        const channelReady = new Promise<SecureChannel>((resolve) => {
            resolveChannel = resolve;
        });

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

        const fail = (message: string) => {
            terminal.write(`\r\n\x1b[31m${message}\x1b[0m\r\n`);
            finish('error', message);
            socket?.close();
        };

        terminal.onData((data) => {
            if (socket?.readyState !== WebSocket.OPEN) {
                return;
            }

            if (!secure) {
                socket.send(JSON.stringify({ t: 'i', d: data }));

                return;
            }

            // Keystrokes typed before the encryption is ready are dropped on purpose.
            channel
                ?.encrypt(encoder.encode(data))
                .then((encrypted) => {
                    if (socket?.readyState === WebSocket.OPEN) {
                        socket.send(encrypted);
                    }
                })
                .catch(() => fail(t('The encrypted connection failed.')));
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

                secure = data.mode === 'agent';

                socket = new WebSocket(
                    `${data.url}?token=${encodeURIComponent(data.token)}`,
                );
                socket.binaryType = 'arraybuffer';

                socket.onopen = sendSize;
                const verifyIdentity = async (reply: KeyReply) => {
                    if (handshake === null) {
                        return;
                    }

                    clearTimeout(handshakeTimer);

                    // Only the first answer counts.
                    const started = handshake;
                    handshake = null;

                    const verified = await started.verify(reply);
                    const pinned = pinnedFingerprint(serverId);

                    if (pinned !== verified.fingerprint) {
                        const trusted = await new Promise<boolean>((answer) =>
                            setPrompt({
                                fingerprint: verified.fingerprint,
                                previous: pinned,
                                answer,
                            }),
                        );

                        setPrompt(null);

                        if (!trusted) {
                            finish('closed');
                            socket?.close();

                            return;
                        }

                        pinFingerprint(serverId, verified.fingerprint);
                    }

                    channel = await verified.open();
                    resolveChannel(channel);
                    onStateRef.current('ready');
                    terminal.focus();
                };

                socket.onmessage = (event) => {
                    if (typeof event.data !== 'string') {
                        const bytes = new Uint8Array(event.data);

                        if (!secure) {
                            terminal.write(bytes);

                            return;
                        }

                        // Output may arrive while the user is still checking the fingerprint.
                        void channelReady
                            .then((ready) => ready.decrypt(bytes))
                            .then((plain) => terminal.write(plain))
                            .catch(() =>
                                fail(
                                    t(
                                        'The encrypted connection could not be verified.',
                                    ),
                                ),
                            );

                        return;
                    }

                    const message = JSON.parse(event.data);

                    if (message.t === 'status' && message.state === 'ready') {
                        if (!secure) {
                            onStateRef.current('ready');
                            terminal.focus();

                            return;
                        }

                        void beginHandshake().then((started) => {
                            handshake = started;
                            handshakeTimer = setTimeout(
                                () =>
                                    fail(
                                        t(
                                            'The terminal service on the server does not support encryption. Update the agent.',
                                        ),
                                    ),
                                10_000,
                            );
                            socket?.send(
                                JSON.stringify({
                                    t: 'k',
                                    pub: started.publicKey,
                                }),
                            );
                        });
                    } else if (message.t === 'key' && secure) {
                        verifyIdentity(message).catch(() =>
                            fail(
                                t(
                                    'The identity of the terminal service could not be verified.',
                                ),
                            ),
                        );
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
                    setPrompt(null);

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
            clearTimeout(handshakeTimer);
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

    return (
        <div className="relative h-full w-full">
            <div ref={host} className="h-full w-full" />

            {prompt && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/70 p-4">
                    <div className="w-full max-w-lg space-y-4 rounded-xl border border-white/10 bg-[#12151b] p-5 text-sm text-slate-200 shadow-xl">
                        <div className="flex items-center gap-2 font-medium text-slate-50">
                            {prompt.previous ? (
                                <TriangleAlert className="size-5 text-amber-400" />
                            ) : (
                                <ShieldCheck className="size-5 text-emerald-400" />
                            )}
                            {prompt.previous
                                ? t(
                                      'The identity of the terminal service has changed',
                                  )
                                : t('Verify the terminal service')}
                        </div>

                        <p className="text-slate-400">
                            {prompt.previous
                                ? t(
                                      'The fingerprint differs from the one you trusted before. If you reinstalled the server or its agent, compare the new fingerprint with the one on the server. Otherwise someone may be impersonating it.',
                                  )
                                : t(
                                      'The terminal is end-to-end encrypted: neither RackAtlas nor Cloudflare can read it. Compare the fingerprint below with the one printed on the server by this command, then trust it.',
                                  )}
                        </p>

                        <code className="block rounded-md bg-black/40 px-3 py-2 font-mono text-xs text-slate-300">
                            sudo rackatlas-terminal --fingerprint
                        </code>

                        {prompt.previous && (
                            <div className="space-y-1">
                                <p className="text-xs text-slate-500">
                                    {t('Trusted before')}
                                </p>
                                <code className="block rounded-md bg-black/40 px-3 py-2 font-mono text-xs break-all text-slate-400">
                                    {prompt.previous}
                                </code>
                            </div>
                        )}

                        <div className="space-y-1">
                            <p className="text-xs text-slate-500">
                                {t('Offered now')}
                            </p>
                            <code className="block rounded-md bg-black/40 px-3 py-2 font-mono text-xs break-all text-emerald-300">
                                {prompt.fingerprint}
                            </code>
                        </div>

                        <div className="flex justify-end gap-2">
                            <Button
                                variant="ghost"
                                className="text-slate-300 hover:text-slate-50"
                                onClick={() => prompt.answer(false)}
                            >
                                {t('Cancel')}
                            </Button>
                            <Button onClick={() => prompt.answer(true)}>
                                {t('Trust and connect')}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
