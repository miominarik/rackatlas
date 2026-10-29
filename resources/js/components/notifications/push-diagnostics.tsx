import { AlertTriangle, CheckCircle2, ChevronDown, XCircle } from 'lucide-react';
import { useCallback, useState } from 'react';
import NotificationDiagnosticsController from '@/actions/App/Http/Controllers/Settings/NotificationDiagnosticsController';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import Heading from '@/components/heading';
import { useTranslation } from '@/hooks/use-translation';
import { cn } from '@/lib/utils';

type Status = 'ok' | 'warn' | 'fail';
type Check = { id: string; status: Status; detail: string };

type PushResult = {
    device: string | null;
    host: string;
    ok: boolean;
    status: number | null;
    reason: string;
    body: string;
};

type Props = {
    vapidPublicKey: string | null;
    registeredHashes: string[];
    onReregister: () => Promise<void>;
};

function xsrfToken(): string {
    const match = document.cookie.match(/(?:^|; )XSRF-TOKEN=([^;]+)/);

    return match ? decodeURIComponent(match[1]) : '';
}

async function call<T>(url: string, method: 'GET' | 'POST' = 'GET'): Promise<T> {
    const response = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { Accept: 'application/json', 'X-XSRF-TOKEN': xsrfToken() },
    });

    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
    }

    return (await response.json()) as T;
}

function toBase64Url(buffer: ArrayBuffer | null | undefined): string {
    if (!buffer) {
        return '';
    }

    return window
        .btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function sha256(value: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));

    return Array.from(new Uint8Array(digest))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
}

async function clientChecks(vapidPublicKey: string | null, registeredHashes: string[]): Promise<Check[]> {
    const checks: Check[] = [];
    const add = (id: string, status: Status, detail: string) => checks.push({ id, status, detail });

    add('secure', window.isSecureContext ? 'ok' : 'fail', window.isSecureContext ? location.origin : 'push needs HTTPS');
    add(
        'standalone',
        'ok',
        window.matchMedia('(display-mode: standalone)').matches ? 'installed app' : 'normal browser tab',
    );

    if (!('Notification' in window)) {
        add('permission', 'fail', 'Notification API is not available');

        return checks;
    }

    add(
        'permission',
        Notification.permission === 'granted' ? 'ok' : 'fail',
        Notification.permission,
    );

    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        add('worker', 'fail', 'service worker or PushManager is not supported here');

        return checks;
    }

    try {
        const response = await fetch('/sw.js', { cache: 'no-store' });
        const text = await response.text();
        const hasPush = text.includes("addEventListener('push'");

        add(
            'worker_file',
            response.ok && hasPush ? 'ok' : 'fail',
            `HTTP ${response.status}, ${response.headers.get('content-type') ?? '?'}${hasPush ? ', has push handler' : ', NO push handler (old or wrong file)'}`,
        );
    } catch (error) {
        add('worker_file', 'fail', String(error));
    }

    const registration = await navigator.serviceWorker.getRegistration('/');

    add(
        'worker',
        registration?.active ? 'ok' : 'fail',
        registration
            ? `scope ${registration.scope}, ${registration.active ? 'active' : 'not active yet'}`
            : 'no service worker registered (it is registered after a production build loads, or on registering the device)',
    );

    const subscription = await registration?.pushManager.getSubscription();

    if (!subscription) {
        add('subscription', 'fail', 'this browser has no push subscription');

        return checks;
    }

    add('subscription', 'ok', new URL(subscription.endpoint).host);

    const used = toBase64Url(subscription.options.applicationServerKey);

    add(
        'key_match',
        vapidPublicKey && used === vapidPublicKey ? 'ok' : 'fail',
        vapidPublicKey && used === vapidPublicKey
            ? 'same key'
            : 'the subscription was made with a different key than the server uses now; re-register this device',
    );

    const hash = await sha256(subscription.endpoint);

    add(
        'registered',
        registeredHashes.includes(hash) ? 'ok' : 'fail',
        registeredHashes.includes(hash) ? 'found in the device list' : 'the server does not know this subscription; re-register this device',
    );

    return checks;
}

const icon: Record<Status, React.ReactNode> = {
    ok: <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />,
    warn: <AlertTriangle className="size-4 shrink-0 text-amber-500" />,
    fail: <XCircle className="size-4 shrink-0 text-destructive" />,
};

export function PushDiagnostics({ vapidPublicKey, registeredHashes, onReregister }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState<string | null>(null);
    const [server, setServer] = useState<Check[] | null>(null);
    const [client, setClient] = useState<Check[] | null>(null);
    const [output, setOutput] = useState<string | null>(null);

    const labels: Record<string, string> = {
        vapid_public: t('VAPID public key'),
        vapid_private: t('VAPID private key'),
        vapid_pair: t('The two keys belong together'),
        subject: t('VAPID subject'),
        extensions: t('PHP extensions'),
        https: t('The site uses HTTPS'),
        preference: t('Push is on in your settings'),
        devices: t('Registered devices'),
        channels: t('Channels used for you'),
        secure: t('Secure connection (HTTPS)'),
        standalone: t('Opened as'),
        permission: t('Notification permission'),
        worker_file: t('Service worker file'),
        worker: t('Service worker active'),
        subscription: t('This browser has a push subscription'),
        key_match: t('Subscription uses the current key'),
        registered: t('This device is known to the server'),
    };

    const runChecks = useCallback(async () => {
        setBusy('checks');

        try {
            const [fromServer, fromBrowser] = await Promise.all([
                call<{ checks: Check[] }>(NotificationDiagnosticsController.show.url()),
                clientChecks(vapidPublicKey, registeredHashes),
            ]);

            setServer(fromServer.checks);
            setClient(fromBrowser);
        } catch (error) {
            setOutput(String(error));
        } finally {
            setBusy(null);
        }
    }, [vapidPublicKey, registeredHashes]);

    const run = (name: string, action: () => Promise<string>) => async () => {
        setBusy(name);

        try {
            setOutput(await action());
        } catch (error) {
            setOutput(String(error));
        } finally {
            setBusy(null);
        }
    };

    const localNotification = run('local', async () => {
        if (Notification.permission !== 'granted') {
            return `Notification permission is "${Notification.permission}".`;
        }

        const registration = await navigator.serviceWorker.register('/sw.js').then(() => navigator.serviceWorker.ready);

        await registration.showNotification('RackAtlas', {
            body: t('Local test notification, no server involved.'),
            icon: '/icons/icon-192.png',
            tag: 'local-test',
        });

        return t('The browser was asked to show a notification. If you do not see it, the problem is in the browser or system settings (do not disturb, notifications of the browser turned off).');
    });

    const connection = run('connection', async () => {
        const { results } = await call<{ results: { host: string; ok: boolean; detail: string }[] }>(
            NotificationDiagnosticsController.connectivity.url(),
            'POST',
        );

        return results.map((r) => `${r.ok ? 'OK  ' : 'FAIL'} ${r.host}: ${r.detail}`).join('\n');
    });

    const sendPush = run('push', async () => {
        const data = await call<{ error: string | null; results: PushResult[] }>(
            NotificationDiagnosticsController.push.url(),
            'POST',
        );

        const lines = data.results.map(
            (r) =>
                `${r.ok ? 'OK  ' : 'FAIL'} ${r.device ?? 'device'} @ ${r.host}: HTTP ${r.status ?? '-'} ${r.reason}${r.body ? `\n     ${r.body}` : ''}`,
        );

        return [data.error, ...lines].filter(Boolean).join('\n') || 'No result.';
    });

    const reregister = run('reregister', async () => {
        await onReregister();

        return t('The device was registered again. Run the checks once more.');
    });

    const renderChecks = (title: string, checks: Check[] | null) =>
        checks && (
            <div className="space-y-1">
                <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{title}</p>
                <ul className="divide-y rounded-lg border">
                    {checks.map((check) => (
                        <li key={check.id} className="flex gap-3 px-3 py-2">
                            {icon[check.status]}
                            <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium">{labels[check.id] ?? check.id}</p>
                                <p className={cn('font-mono text-xs break-words whitespace-pre-wrap text-muted-foreground', check.status === 'fail' && 'text-destructive/80')}>
                                    {check.detail}
                                </p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        );

    return (
        <Collapsible open={open} onOpenChange={setOpen} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <Heading
                    variant="small"
                    title={t('Diagnostics')}
                    description={t('Technical checks for when push notifications do not arrive.')}
                />
                <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="shrink-0" aria-label={t('Diagnostics')}>
                        <ChevronDown className={cn('size-4 transition-transform', open && 'rotate-180')} />
                    </Button>
                </CollapsibleTrigger>
            </div>

            <CollapsibleContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                    <Button size="sm" onClick={() => void runChecks()} disabled={busy !== null}>
                        {t('Run the checks')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void localNotification()} disabled={busy !== null}>
                        {t('Show a local notification')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void sendPush()} disabled={busy !== null}>
                        {t('Send a push and show the answer')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void connection()} disabled={busy !== null}>
                        {t('Check the connection of the server')}
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => void reregister()} disabled={busy !== null}>
                        {t('Re-register this device')}
                    </Button>
                </div>

                {busy && <p className="text-sm text-muted-foreground">{t('Working…')}</p>}

                {output && (
                    <pre className="max-h-64 overflow-auto rounded-lg border bg-muted/50 p-3 font-mono text-xs break-words whitespace-pre-wrap">
                        {output}
                    </pre>
                )}

                {renderChecks(t('Server'), server)}
                {renderChecks(t('This browser'), client)}
            </CollapsibleContent>
        </Collapsible>
    );
}
