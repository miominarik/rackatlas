import { cn } from '@/lib/utils';
import type { StorageMonitor } from '@/types/storage';

const dots: Record<StorageMonitor['status'], string> = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    unknown: 'bg-zinc-400',
};

export default function StatusDot({
    status,
}: {
    status: StorageMonitor['status'];
}) {
    return (
        <span
            aria-hidden="true"
            className={cn('inline-block size-2.5 rounded-full', dots[status])}
        />
    );
}
