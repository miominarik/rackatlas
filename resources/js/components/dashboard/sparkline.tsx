import { cn } from '@/lib/utils';

export default function Sparkline({
    values,
    className,
    label,
}: {
    values: number[];
    className?: string;
    label: string;
}) {
    if (values.length < 2) {
        return null;
    }

    const width = 100;
    const height = 24;
    const step = width / (values.length - 1);
    const points = values
        .map((value, i) => {
            const y = height - (Math.max(0, Math.min(100, value)) / 100) * height;

            return `${(i * step).toFixed(1)},${y.toFixed(1)}`;
        })
        .join(' ');

    return (
        <svg
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className={cn('h-6 w-full text-muted-foreground/60', className)}
            role="img"
            aria-label={label}
        >
            <polyline
                points={points}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                vectorEffect="non-scaling-stroke"
                strokeLinejoin="round"
            />
        </svg>
    );
}
