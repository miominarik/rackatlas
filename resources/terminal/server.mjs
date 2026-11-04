/**
 * Web terminal bridge: WebSocket on one side (the browser), a shell on the other.
 *
 * The browser sends a one-time ticket issued by the Laravel app. This process swaps it for the way
 * to reach the server over the app's private API, so credentials never reach the browser. There are
 * two ways to reach a server:
 *
 *  - ssh:   this process logs in over SSH (the app returns the login details).
 *  - agent: the terminal service on the server keeps a WebSocket open to /agent, so no port has to
 *           be open on the server. The shell runs there, this process only relays the bytes.
 *
 * Frames from the browser: {"t":"i","d":"<keystrokes>"} (ssh only) and {"t":"r","c":cols,"r":rows}.
 * Via the agent the terminal is end-to-end encrypted: the browser sends {"t":"k","pub":"<key>"} and
 * then binary frames of ciphertext. This process cannot read them, it only relays them.
 * Frames to the browser: binary shell output (ciphertext via the agent), and
 * {"t":"status"|"error"|"key",...} control messages.
 *
 * Frames to the terminal service (many shells share one connection, a session id tells them apart):
 *   text:   {"t":"open","id":1,"cols":80,"rows":24} {"t":"key","id":1,"pub":".."}
 *           {"t":"r","id":1,"c":..,"r":..} {"t":"close","id":1}
 *   binary: 4 bytes session id (big endian) + encrypted keystrokes
 * Frames from the terminal service:
 *   text:   {"t":"ready"|"exit","id":1} {"t":"error","id":1,"message":"..."}
 *           {"t":"key","id":1,"pub":"..","ident":"..","sig":".."}
 *   binary: 4 bytes session id + encrypted shell output
 *
 * Start with `npm run terminal` (Node 20.6+, reads .env).
 */
import { createServer } from 'node:http';
import { Client } from 'ssh2';
import { WebSocketServer } from 'ws';

const appUrl = (process.env.TERMINAL_APP_URL || process.env.APP_URL || '').replace(/\/$/, '');
const secret = process.env.TERMINAL_SECRET || '';
const host = process.env.TERMINAL_HOST || '127.0.0.1';
const port = Number(process.env.TERMINAL_PORT || 8787);
const idleMs = Number(process.env.TERMINAL_IDLE_MINUTES || 30) * 60_000;
const maxSessions = Number(process.env.TERMINAL_MAX_SESSIONS || 50);
const maxPerAgent = Number(process.env.TERMINAL_MAX_PER_SERVER || 5);
const allowedOrigin = process.env.TERMINAL_ALLOWED_ORIGIN || (appUrl ? new URL(appUrl).origin : '');

if (!appUrl || !secret) {
    console.error('TERMINAL_SECRET and APP_URL (or TERMINAL_APP_URL) have to be set.');
    process.exit(1);
}

let sessions = 0;

/** Terminal services that are connected right now: server id -> { ws, shells: Map(id -> handlers), next }. */
const agents = new Map();

async function api(path, body) {
    const response = await fetch(`${appUrl}/api/terminal/${path}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${secret}`,
        },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
    });

    return { ok: response.ok, status: response.status, data: await response.json().catch(() => ({})) };
}

const http = createServer((request, response) => {
    response.writeHead(request.url === '/up' ? 200 : 404, { 'Content-Type': 'text/plain' });
    response.end(request.url === '/up' ? 'ok' : 'not found');
});

const wss = new WebSocketServer({ noServer: true, maxPayload: 256 * 1024 });
const agentWss = new WebSocketServer({ noServer: true, maxPayload: 1024 * 1024 });

http.on('upgrade', (request, socket, head) => {
    const path = new URL(request.url, 'http://localhost').pathname;

    if (path === '/agent') {
        // Not a browser, so there is no origin to check. The token is checked after the upgrade.
        agentWss.handleUpgrade(request, socket, head, (ws) => agentWss.emit('connection', ws, request));

        return;
    }

    if (allowedOrigin !== '' && request.headers.origin !== allowedOrigin) {
        socket.write('HTTP/1.1 403 Forbidden\r\nConnection: close\r\n\r\n');
        socket.destroy();

        return;
    }

    wss.handleUpgrade(request, socket, head, (ws) => wss.emit('connection', ws, request));
});

const frame = (id, data) => {
    const head = Buffer.alloc(4);
    head.writeUInt32BE(id);

    return Buffer.concat([head, Buffer.isBuffer(data) ? data : Buffer.from(data)]);
};

agentWss.on('connection', (ws, request) => {
    const header = String(request.headers.authorization || '');
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    let entry = null;
    let alive = true;
    let gone = false;

    ws.on('pong', () => {
        alive = true;
    });

    const drop = () => {
        gone = true;

        if (entry === null) {
            return;
        }

        if (agents.get(entry.serverId) === entry) {
            agents.delete(entry.serverId);
        }

        for (const shell of entry.shells.values()) {
            shell.onError('The terminal service on the server disconnected.');
        }

        entry.shells.clear();
    };

    ws.on('close', drop);
    ws.on('error', drop);

    ws.on('message', (raw, isBinary) => {
        if (entry === null) {
            return;
        }

        if (isBinary) {
            if (raw.length > 4) {
                entry.shells.get(raw.readUInt32BE(0))?.onData(raw.subarray(4));
            }

            return;
        }

        let message;

        try {
            message = JSON.parse(raw.toString());
        } catch {
            return;
        }

        const shell = entry.shells.get(message.id);

        if (message.t === 'ready') {
            shell?.onReady();
        } else if (message.t === 'key') {
            shell?.onKey?.(message);
        } else if (message.t === 'exit') {
            shell?.onExit();
        } else if (message.t === 'error') {
            shell?.onError(String(message.message || 'The shell could not be opened.'));
        }
    });

    (async () => {
        const auth = await api('agent-auth', { token }).catch(() => null);

        if (gone) {
            return;
        }

        if (auth === null || !auth.ok) {
            ws.close(1008, 'unauthorized');

            return;
        }

        const serverId = auth.data.server_id;

        // A service that reconnects replaces its previous, probably dead, connection.
        agents.get(serverId)?.ws.close(1000, 'replaced');

        entry = { serverId, ws, shells: new Map(), next: 1 };
        agents.set(serverId, entry);
        ws.send(JSON.stringify({ t: 'hello' }));
    })();

    ws.heartbeat = () => {
        if (!alive) {
            ws.terminate();

            return;
        }

        alive = false;
        ws.ping();
    };
});

setInterval(() => agentWss.clients.forEach((ws) => ws.heartbeat?.()), 30_000).unref();

wss.on('connection', (ws, request) => {
    const control = (message) => ws.readyState === ws.OPEN && ws.send(JSON.stringify(message));
    const fail = (message) => {
        control({ t: 'error', message });
        ws.close();
    };

    if (sessions >= maxSessions) {
        return fail('The terminal server is busy. Try again in a moment.');
    }

    sessions++;

    const token = new URL(request.url, 'http://localhost').searchParams.get('token') || '';
    const ip = (request.headers['x-forwarded-for'] || request.socket.remoteAddress || '').split(',')[0].trim();

    /** What the browser talks to: write(keystrokes), resize(cols, rows), end(). Set once a shell is open. */
    let shell = null;
    let ssh = null;
    let size = { cols: 80, rows: 24 };
    let sized = false;
    let sizeWaiter = null;
    let idle = null;
    let closed = false;
    let granted = null;

    const touch = () => {
        clearTimeout(idle);
        idle = setTimeout(() => fail('Session closed after inactivity.'), idleMs);
    };

    const cleanup = () => {
        if (closed) {
            return;
        }

        closed = true;
        sessions--;
        clearTimeout(idle);
        shell?.end();
        ssh?.end();

        if (granted !== null) {
            api('session-ended', {
                server_id: granted.server_id,
                user_id: granted.user_id,
                via: granted.mode,
                seconds: Math.round((Date.now() - granted.since) / 1000),
            }).catch(() => {});
        }
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    ws.on('message', (raw, isBinary) => {
        if (isBinary) {
            // Ciphertext for the shell on the server. Only shells that are end-to-end encrypted take it.
            if (shell?.secure) {
                touch();
                shell.write(raw);
            }

            return;
        }

        let message;

        try {
            message = JSON.parse(raw.toString());
        } catch {
            return;
        }

        if (message.t === 'k') {
            if (shell?.secure && typeof message.pub === 'string' && message.pub.length <= 200) {
                shell.key(message.pub);
            }
        } else if (message.t === 'r') {
            const cols = Math.min(Math.max(Number(message.c) || 80, 10), 500);
            const rows = Math.min(Math.max(Number(message.r) || 24, 2), 200);

            size = { cols, rows };
            shell?.resize(cols, rows);

            if (!sized) {
                sized = true;
                sizeWaiter?.();
            }
        } else if (message.t === 'i' && shell && !shell.secure && typeof message.d === 'string') {
            touch();
            shell.write(message.d);
        }
    });

    const output = (data) => ws.readyState === ws.OPEN && ws.send(data, { binary: true });

    /** The shell runs on the server, behind the terminal service that is connected to /agent. */
    const openViaAgent = (login) => {
        const entry = agents.get(login.server_id);

        if (!entry || entry.ws.readyState !== entry.ws.OPEN) {
            return fail('The terminal service on this server is not connected. Check that rackatlas-terminal is running there.');
        }

        if (entry.shells.size >= maxPerAgent) {
            return fail('Too many terminals are open on this server.');
        }

        const id = entry.next++;
        const startTimeout = setTimeout(() => fail('The server did not open the shell in time.'), 15_000);

        entry.shells.set(id, {
            onData: output,
            onReady: () => {
                clearTimeout(startTimeout);
                control({ t: 'status', state: 'ready' });
            },
            onKey: (message) => {
                const text = (value) => (typeof value === 'string' && value.length <= 400 ? value : '');

                control({ t: 'key', pub: text(message.pub), ident: text(message.ident), sig: text(message.sig) });
            },
            onExit: () => ws.close(),
            onError: (message) => {
                clearTimeout(startTimeout);
                fail(message);
            },
        });

        shell = {
            secure: true,
            key: (pub) => entry.ws.readyState === entry.ws.OPEN && entry.ws.send(JSON.stringify({ t: 'key', id, pub })),
            write: (data) => entry.ws.readyState === entry.ws.OPEN && entry.ws.send(frame(id, data), { binary: true }),
            resize: (cols, rows) => entry.ws.readyState === entry.ws.OPEN && entry.ws.send(JSON.stringify({ t: 'r', id, c: cols, r: rows })),
            end: () => {
                clearTimeout(startTimeout);

                if (entry.shells.delete(id) && entry.ws.readyState === entry.ws.OPEN) {
                    entry.ws.send(JSON.stringify({ t: 'close', id }));
                }
            },
        };

        entry.ws.send(JSON.stringify({ t: 'open', id, cols: size.cols, rows: size.rows }));
    };

    const openViaSsh = (login) => {
        ssh = new Client();

        ssh.on('error', (error) => {
            const text = String(error.level === 'client-authentication'
                ? 'Authentication failed.'
                : error.message || 'The connection failed.');

            fail(text.includes('host key') ? text : `Could not connect: ${text}`);
        });
        ssh.on('close', () => ws.close());

        ssh.on('ready', () => {
            ssh.shell({ term: 'xterm-256color', cols: size.cols, rows: size.rows }, (error, stream) => {
                if (error) {
                    return fail('The shell could not be opened.');
                }

                shell = {
                    write: (data) => stream.write(data),
                    resize: (cols, rows) => stream.setWindow(rows, cols, 0, 0),
                    end: () => {},
                };
                control({ t: 'status', state: 'ready' });

                stream.on('data', output);
                stream.stderr.on('data', output);
                stream.on('close', () => ws.close());
            });
        });

        let presented = null;

        try {
            ssh.connect({
                host: login.host,
                port: login.port,
                username: login.username,
                password: login.password ?? undefined,
                privateKey: login.private_key ?? undefined,
                passphrase: login.passphrase || undefined,
                readyTimeout: 15_000,
                keepaliveInterval: 20_000,
                hostHash: 'sha256',
                hostVerifier: (hash) => {
                    presented = `SHA256:${Buffer.from(hash, 'hex').toString('base64').replace(/=+$/, '')}`;

                    if (login.fingerprint && login.fingerprint !== presented) {
                        fail('The host key of the server has changed. If the server was reinstalled, reset the stored host key; otherwise someone may be impersonating it.');

                        return false;
                    }

                    if (!login.fingerprint) {
                        api('host-key', { server_id: login.server_id, fingerprint: presented }).catch(() => {});
                    }

                    return true;
                },
            });
        } catch {
            fail('The SSH key could not be used.');
        }
    };

    (async () => {
        // The first resize frame carries the real window size, so the shell starts with it.
        const waitForSize = new Promise((resolve) => {
            sizeWaiter = resolve;
            setTimeout(resolve, 1500);
        });

        const exchanged = await api('exchange', { token, ip: ip || null }).catch(() => null);

        if (exchanged === null) {
            return fail('The application is not reachable.');
        }

        if (!exchanged.ok) {
            return fail(exchanged.data.message || 'The ticket is invalid or expired.');
        }

        const login = exchanged.data;

        await waitForSize;

        if (closed) {
            return;
        }

        granted = { server_id: login.server_id, user_id: login.user_id, mode: login.mode === 'agent' ? 'agent' : 'ssh', since: Date.now() };
        touch();

        if (login.mode === 'agent') {
            openViaAgent(login);
        } else {
            openViaSsh(login);
        }
    })();
});

http.listen(port, host, () => {
    console.log(`Terminal bridge listening on ${host}:${port}`);
});
