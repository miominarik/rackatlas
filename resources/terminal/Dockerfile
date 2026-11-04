# syntax=docker/dockerfile:1
# Web terminal bridge (WebSocket <-> SSH). Self-contained: it needs no files next to it.
# Keep the embedded server in sync with server.mjs. Local build:
#   docker build -t rackatlas-terminal resources/terminal
#   docker run -p 8787:8787 -e APP_URL=https://rackatlas.dev -e TERMINAL_SECRET=... rackatlas-terminal
FROM node:26-alpine

WORKDIR /app

# ssh2 is pure JavaScript here, so no build tools are needed.
RUN npm install --omit=dev --no-audit --no-fund --no-package-lock ssh2@^1.17.0 ws@^8.22.1 \
    && npm cache clean --force

# The hosting builds with an empty context, so the app is embedded here (copy of server.mjs).
COPY <<'EOF_SERVER' /app/server.mjs
/**
 * Web terminal bridge: WebSocket on one side (the browser), an SSH shell on the other.
 *
 * The browser sends a one-time ticket issued by the Laravel app. This process swaps it for the login
 * details of the server over the app's private API, so credentials never reach the browser.
 *
 * Frames from the browser: {"t":"i","d":"<keystrokes>"} and {"t":"r","c":cols,"r":rows}.
 * Frames to the browser: binary shell output, and {"t":"status"|"error",...} control messages.
 *
 * Start with `npm run terminal` (Node 20.6+, reads .env).
 */
import { createServer } from 'node:http';
import { Client } from 'ssh2';
import { WebSocketServer } from 'ws';

const appUrl = (process.env.TERMINAL_APP_URL || process.env.APP_URL || '').replace(/\/$/, '');
const secret = process.env.TERMINAL_SECRET || '';
const host = process.env.TERMINAL_HOST || '127.0.0.1';
const port = Number(process.env.TERMINAL_PORT || 443);
const idleMs = Number(process.env.TERMINAL_IDLE_MINUTES || 30) * 60_000;
const maxSessions = Number(process.env.TERMINAL_MAX_SESSIONS || 50);
const allowedOrigin = process.env.TERMINAL_ALLOWED_ORIGIN || (appUrl ? new URL(appUrl).origin : '');

if (!appUrl || !secret) {
    console.error('TERMINAL_SECRET and APP_URL (or TERMINAL_APP_URL) have to be set.');
    process.exit(1);
}

let sessions = 0;

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

const wss = new WebSocketServer({
    server: http,
    maxPayload: 256 * 1024,
    verifyClient: ({ origin }) => allowedOrigin === '' || origin === allowedOrigin,
});

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
    let ssh = null;
    let stream = null;
    let size = { cols: 80, rows: 24 };
    let sized = false;
    let sizeWaiter = null;
    let idle = null;
    let closed = false;

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
        ssh?.end();
    };

    ws.on('close', cleanup);
    ws.on('error', cleanup);

    ws.on('message', (raw, isBinary) => {
        if (isBinary) {
            return;
        }

        let message;

        try {
            message = JSON.parse(raw.toString());
        } catch {
            return;
        }

        if (message.t === 'r') {
            const cols = Math.min(Math.max(Number(message.c) || 80, 10), 500);
            const rows = Math.min(Math.max(Number(message.r) || 24, 2), 200);

            size = { cols, rows };
            stream?.setWindow(rows, cols, 0, 0);

            if (!sized) {
                sized = true;
                sizeWaiter?.();
            }
        } else if (message.t === 'i' && stream && typeof message.d === 'string') {
            touch();
            stream.write(message.d);
        }
    });

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

        ssh = new Client();
        touch();

        ssh.on('error', (error) => {
            const text = String(error.level === 'client-authentication'
                ? 'Authentication failed.'
                : error.message || 'The connection failed.');

            fail(text.includes('host key') ? text : `Could not connect: ${text}`);
        });
        ssh.on('close', () => ws.close());

        ssh.on('ready', () => {
            ssh.shell({ term: 'xterm-256color', cols: size.cols, rows: size.rows }, (error, shell) => {
                if (error) {
                    return fail('The shell could not be opened.');
                }

                stream = shell;
                control({ t: 'status', state: 'ready' });

                shell.on('data', (data) => ws.readyState === ws.OPEN && ws.send(data, { binary: true }));
                shell.stderr.on('data', (data) => ws.readyState === ws.OPEN && ws.send(data, { binary: true }));
                shell.on('close', () => ws.close());
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
    })();
});

http.listen(port, host, () => {
    console.log(`Terminal bridge listening on ${host}:${port}`);
});
EOF_SERVER

# Inside a container the app has to listen on all interfaces to be reachable from outside.
ENV NODE_ENV=production \
    TERMINAL_HOST=0.0.0.0 \
    TERMINAL_PORT=8787

EXPOSE 8787

USER node

HEALTHCHECK --interval=30s --timeout=5s --start-period=5s \
    CMD node -e "fetch('http://127.0.0.1:'+(process.env.TERMINAL_PORT||8787)+'/up').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.mjs"]
