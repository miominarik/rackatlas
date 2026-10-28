import { Check, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useClipboard } from '@/hooks/use-clipboard';
import { useTranslation } from '@/hooks/use-translation';

export default function CopyField({
    value,
    label,
}: {
    value: string;
    label?: string;
}) {
    const { t } = useTranslation();
    const [copied, copy] = useClipboard();
    const isCopied = copied === value;

    return (
        <div className="space-y-1.5">
            {label && <p className="text-sm font-medium">{label}</p>}
            <div className="flex items-start gap-2">
                <pre className="max-h-28 min-w-0 flex-1 overflow-auto rounded-md border bg-muted/50 p-3 font-mono text-xs break-all whitespace-pre-wrap">
                    {value}
                </pre>
                <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => void copy(value)}
                    aria-label={t('Copy')}
                >
                    {isCopied ? (
                        <Check className="size-4" />
                    ) : (
                        <Copy className="size-4" />
                    )}
                </Button>
            </div>
        </div>
    );
}
