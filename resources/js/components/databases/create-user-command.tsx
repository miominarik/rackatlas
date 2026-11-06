import { RefreshCw } from 'lucide-react';
import { useState } from 'react';
import CopyField from '@/components/servers/copy-field';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/use-translation';

export const MONITOR_USER = 'rackatlas_user';

const ALPHABET =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

/** Letters and digits only, so the password needs no escaping in SQL or a shell. */
export function randomPassword(length = 24): string {
    const limit = 256 - (256 % ALPHABET.length);
    let result = '';

    while (result.length < length) {
        for (const byte of crypto.getRandomValues(new Uint8Array(length))) {
            if (byte < limit && result.length < length) {
                result += ALPHABET[byte % ALPHABET.length];
            }
        }
    }

    return result;
}

export default function CreateUserCommand({
    onUse,
}: {
    /** Fills the username and password of the form. */
    onUse: (username: string, password: string) => void;
}) {
    const { t } = useTranslation();
    const [password, setPassword] = useState(() => randomPassword());

    const account = `'${MONITOR_USER}'@'%'`;
    const sql = [
        `CREATE USER ${account} IDENTIFIED BY '${password}';`,
        `GRANT PROCESS, REPLICATION CLIENT, CONNECTION_ADMIN ON *.* TO ${account};`,
    ].join('\n');

    return (
        <div className="space-y-3 rounded-lg border bg-card p-4">
            <div>
                <p className="text-sm font-medium">
                    {t('Create a user for RackAtlas')}
                </p>
                <p className="text-xs text-muted-foreground">
                    {t(
                        'Run this on your MySQL server as an administrator. The user can see and stop running queries and read the server status, nothing else.',
                    )}
                </p>
            </div>

            <CopyField value={sql} />

            <ul className="list-disc space-y-1 pl-4 text-xs text-muted-foreground">
                <li>
                    {t(
                        'The user may connect from any address. To allow only RackAtlas, replace % with its IP address.',
                    )}
                </li>
                <li>
                    {t(
                        'PROCESS shows the running queries, CONNECTION_ADMIN lets us stop them and REPLICATION CLIENT reads the state of the replication.',
                    )}
                </li>
            </ul>

            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    size="sm"
                    onClick={() => onUse(MONITOR_USER, password)}
                >
                    {t('Use this user and password')}
                </Button>
                <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setPassword(randomPassword())}
                >
                    <RefreshCw className="size-4" />
                    {t('New password')}
                </Button>
            </div>
        </div>
    );
}
