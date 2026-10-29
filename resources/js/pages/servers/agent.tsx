import { Head, Link, router, usePoll } from '@inertiajs/react';
import { CheckCircle2, KeyRound, LoaderCircle, TriangleAlert } from 'lucide-react';
import ServerAgentController from '@/actions/App/Http/Controllers/Servers/ServerAgentController';
import CopyField from '@/components/servers/copy-field';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';
import { timeAgo } from '@/lib/dashboard';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';
import { index } from '@/routes/servers';

type Props = {
    server: {
        id: number;
        name: string;
        status: 'unknown' | 'online' | 'offline';
        last_seen_at: string | null;
        agent_version: string | null;
    };
    install_command: string | null;
    base_url: string;
    generated_at: string;
};

export default function AgentInstall({
    server,
    install_command,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();
    const connected = server.last_seen_at !== null;

    // Check every few seconds whether the first report arrived.
    usePoll(5000, { only: ['server', 'generated_at'] });

    return (
        <>
            <Head title={t('Install the agent')} />

            <div className="mx-auto w-full max-w-2xl space-y-6 p-4 md:py-8">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold tracking-tight">
                        {t('Install the agent on :server', { server: server.name })}
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {t('Run one command on the server. It works on Debian and Ubuntu with systemd.')}
                    </p>
                </div>

                <div
                    role="status"
                    className={cn(
                        'flex items-start gap-3 rounded-xl border p-4',
                        connected
                            ? 'border-emerald-500/30 bg-emerald-500/[0.06]'
                            : 'bg-muted/30',
                    )}
                >
                    {connected ? (
                        <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                        <LoaderCircle className="mt-0.5 size-5 shrink-0 animate-spin text-muted-foreground" />
                    )}
                    <div>
                        <p className="font-medium">
                            {connected
                                ? t('The agent is connected')
                                : t('Waiting for the first report…')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                            {connected && server.last_seen_at
                                ? t('Last report :time', {
                                      time: timeAgo(server.last_seen_at, generated_at, locale),
                                  }) +
                                  (server.agent_version
                                      ? ` · ${t('Agent :version', { version: server.agent_version })}`
                                      : '')
                                : t('This page updates by itself as soon as the server reports.')}
                        </p>
                    </div>
                </div>

                {install_command ? (
                    <div className="space-y-4 rounded-xl border p-5">
                        <ol className="list-decimal space-y-3 pl-5 text-sm">
                            <li>
                                {t('Log in to the server over SSH as a user who can use sudo.')}
                            </li>
                            <li className="space-y-2">
                                <span>{t('Run this command:')}</span>
                                <CopyField value={install_command} />
                            </li>
                            <li>
                                {t('Wait a minute. The status above turns green when the first report arrives.')}
                            </li>
                        </ol>
                        <div className="flex items-start gap-2 rounded-lg bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-300">
                            <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                            <span>
                                {t('The token is shown only now and cannot be read again. If you lose it, create a new one.')}
                            </span>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-3 rounded-xl border p-5 text-sm">
                        <p className="text-muted-foreground">
                            {t('For safety the token is shown only once, right after it was created. To install the agent on another server or to replace a lost token, create a new one. The old token stops working.')}
                        </p>
                        <Button
                            variant="outline"
                            onClick={() => {
                                if (
                                    window.confirm(
                                        t('Create a new token? The agent on the server stops working until you install it with the new one.'),
                                    )
                                ) {
                                    router.post(
                                        ServerAgentController.rotate.url(server.id),
                                    );
                                }
                            }}
                            data-test="rotate-agent-token-button"
                        >
                            <KeyRound className="size-4" />
                            {t('Create a new token')}
                        </Button>
                    </div>
                )}

                <details className="rounded-xl border p-4 text-sm">
                    <summary className="cursor-pointer font-medium">
                        {t('What does the installer do?')}
                    </summary>
                    <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
                        <li>{t('Adds the signed RackAtlas apt repository and installs the package rackatlas-agent from it.')}</li>
                        <li>{t('To update later: sudo apt update && sudo apt install --only-upgrade rackatlas-agent')}</li>
                        <li>{t('Creates the system user rackatlas-agent without a login and without root rights.')}</li>
                        <li>{t('Stores the address and the token in /etc/rackatlas-agent/agent.conf.')}</li>
                        <li>{t('Starts a systemd timer that reports once a minute.')}</li>
                        <li>{t('To remove it: sudo apt remove rackatlas-agent')}</li>
                    </ul>
                </details>

                <div className="flex gap-2">
                    <Button asChild>
                        <Link href={dashboard()}>{t('Go to the dashboard')}</Link>
                    </Button>
                    <Button variant="ghost" asChild>
                        <Link href={index()}>{t('Back to servers')}</Link>
                    </Button>
                </div>
            </div>
        </>
    );
}

AgentInstall.layout = (props: { server: { name: string } }) => ({
    breadcrumbs: [
        { title: 'Servers', href: index() },
        { title: props.server.name, href: index() },
    ],
});
