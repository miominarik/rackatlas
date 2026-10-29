import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export type ChartSeries = {
    key: string;
    label: string;
    color: string;
    values: (number | null)[];
    area?: boolean;
    dashed?: boolean;
};

export type ChartThreshold = { value: number; color: string; label: string };

type Props = {
    /** Unix seconds, ascending. Every series has one value per time. */
    times: number[];
    series: ChartSeries[];
    from: number;
    to: number;
    /** Points further apart than this many seconds are not joined by a line. */
    gap: number;
    min?: number;
    max?: number;
    thresholds?: ChartThreshold[];
    /** Unix seconds of events, drawn as vertical lines (restarts). */
    markers?: { t: number; label: string }[];
    formatValue: (value: number) => string;
    locale: string;
    label: string;
    height?: number;
    className?: string;
};

/** Phones get less room for the axis labels and a lower chart. */
const COMPACT_WIDTH = 480;

function niceCeil(value: number): number {
    if (value <= 0) {
        return 1;
    }

    const magnitude = 10 ** Math.floor(Math.log10(value));
    const normalized = value / magnitude;
    const nice = [1, 2, 2.5, 5, 10].find((step) => normalized <= step) ?? 10;

    return nice * magnitude;
}

const STEPS = [300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200, 86400, 172800, 259200, 604800];

function timeTicks(from: number, to: number, count: number): number[] {
    // A little more than `count` is fine, a single label on a narrow chart is not.
    const step = STEPS.find((candidate) => (to - from) / candidate <= count + 0.5) ?? STEPS[STEPS.length - 1];
    const ticks: number[] = [];

    if (step >= 86400) {
        const date = new Date(from * 1000);

        date.setHours(0, 0, 0, 0);
        date.setDate(date.getDate() + 1);

        while (date.getTime() / 1000 <= to) {
            ticks.push(date.getTime() / 1000);
            date.setDate(date.getDate() + step / 86400);
        }

        return ticks;
    }

    for (let t = Math.ceil(from / step) * step; t <= to; t += step) {
        ticks.push(t);
    }

    return ticks;
}

function segments(times: number[], values: (number | null)[], gap: number): number[][] {
    const result: number[][] = [];
    let current: number[] = [];

    values.forEach((value, i) => {
        if (value === null) {
            if (current.length) {
                result.push(current);
                current = [];
            }

            return;
        }

        if (current.length && times[i] - times[current[current.length - 1]] > gap) {
            result.push(current);
            current = [];
        }

        current.push(i);
    });

    if (current.length) {
        result.push(current);
    }

    return result;
}

export default function LineChart({
    times,
    series,
    from,
    to,
    gap,
    min = 0,
    max,
    thresholds = [],
    markers = [],
    formatValue,
    locale,
    label,
    height,
    className,
}: Props) {
    const wrapper = useRef<HTMLDivElement>(null);
    // Unknown until measured: a fixed first guess would stretch a grid cell on narrow screens.
    const [width, setWidth] = useState(0);
    const [hover, setHover] = useState<number | null>(null);

    useEffect(() => {
        const element = wrapper.current;

        if (!element) {
            return;
        }

        const observer = new ResizeObserver(([entry]) => setWidth(Math.floor(entry.contentRect.width)));

        observer.observe(element);
        setWidth(Math.floor(element.clientWidth));

        return () => observer.disconnect();
    }, []);

    const compact = width < COMPACT_WIDTH;
    const PAD = { left: compact ? 38 : 44, right: compact ? 6 : 10, top: 10, bottom: 24 };
    const chartHeight = height ?? (compact ? 180 : 220);
    const plotWidth = Math.max(1, width - PAD.left - PAD.right);
    const plotHeight = chartHeight - PAD.top - PAD.bottom;

    const top = useMemo(() => {
        if (max !== undefined) {
            return max;
        }

        const peak = Math.max(0, ...series.flatMap((s) => s.values.filter((v): v is number => v !== null)));

        return niceCeil(peak * 1.1);
    }, [max, series]);

    const x = (t: number) => PAD.left + ((t - from) / Math.max(1, to - from)) * plotWidth;
    const y = (value: number) => PAD.top + plotHeight - ((value - min) / Math.max(1e-9, top - min)) * plotHeight;

    const yTicks = [0, 1, 2, 3, 4].map((i) => min + ((top - min) * i) / 4);
    const xTicks = timeTicks(from, to, Math.max(2, Math.floor(plotWidth / (compact ? 64 : 90))));

    const tickFormat = new Intl.DateTimeFormat(
        locale,
        to - from > 2 * 86400 ? { day: 'numeric', month: 'numeric' } : { hour: '2-digit', minute: '2-digit' },
    );
    const fullFormat = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });

    const onMove = (event: React.PointerEvent<SVGRectElement>) => {
        if (times.length === 0) {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        const t = from + ((event.clientX - rect.left) / rect.width) * (to - from);
        let nearest = 0;

        for (let i = 1; i < times.length; i++) {
            if (Math.abs(times[i] - t) < Math.abs(times[nearest] - t)) {
                nearest = i;
            }
        }

        setHover(nearest);
    };

    const hoverX = hover !== null ? x(times[hover]) : 0;

    return (
        <div ref={wrapper} className={cn('relative w-full min-w-0', className)} style={{ minHeight: chartHeight }}>
            {width > 0 && (
            <svg width={width} height={chartHeight} role="img" aria-label={label} className="block max-w-full select-none">
                {yTicks.map((tick) => (
                    <g key={tick}>
                        <line
                            x1={PAD.left}
                            x2={width - PAD.right}
                            y1={y(tick)}
                            y2={y(tick)}
                            className="stroke-border"
                            strokeWidth={1}
                        />
                        <text
                            x={PAD.left - 6}
                            y={y(tick) + 3.5}
                            textAnchor="end"
                            className="fill-muted-foreground text-[10px]"
                        >
                            {formatValue(tick)}
                        </text>
                    </g>
                ))}

                {xTicks.map((tick) => (
                    <text
                        key={tick}
                        x={x(tick)}
                        y={chartHeight - 6}
                        textAnchor="middle"
                        className="fill-muted-foreground text-[10px]"
                    >
                        {tickFormat.format(new Date(tick * 1000))}
                    </text>
                ))}

                {thresholds.map((threshold) => (
                    <g key={threshold.label}>
                        <line
                            x1={PAD.left}
                            x2={width - PAD.right}
                            y1={y(threshold.value)}
                            y2={y(threshold.value)}
                            stroke={threshold.color}
                            strokeWidth={1}
                            strokeDasharray="4 4"
                            opacity={0.7}
                        />
                    </g>
                ))}

                {markers.map((marker) => (
                    <g key={marker.t}>
                        <title>{marker.label}</title>
                        <line
                            x1={x(marker.t)}
                            x2={x(marker.t)}
                            y1={PAD.top}
                            y2={PAD.top + plotHeight}
                            className="stroke-muted-foreground"
                            strokeWidth={1}
                            strokeDasharray="2 3"
                        />
                    </g>
                ))}

                {series.map((s) =>
                    segments(times, s.values, gap).map((segment, index) => {
                        const points = segment.map((i) => `${x(times[i]).toFixed(1)},${y(s.values[i] as number).toFixed(1)}`);

                        if (segment.length === 1) {
                            const i = segment[0];

                            return (
                                <circle
                                    key={`${s.key}-${index}`}
                                    cx={x(times[i])}
                                    cy={y(s.values[i] as number)}
                                    r={2}
                                    fill={s.color}
                                />
                            );
                        }

                        const base = y(min).toFixed(1);
                        const first = x(times[segment[0]]).toFixed(1);
                        const last = x(times[segment[segment.length - 1]]).toFixed(1);

                        return (
                            <g key={`${s.key}-${index}`}>
                                {s.area && (
                                    <path
                                        d={`M${first},${base} L${points.join(' L')} L${last},${base} Z`}
                                        fill={s.color}
                                        opacity={0.15}
                                    />
                                )}
                                <path
                                    d={`M${points.join(' L')}`}
                                    fill="none"
                                    stroke={s.color}
                                    strokeWidth={1.6}
                                    strokeLinejoin="round"
                                    strokeLinecap="round"
                                    strokeDasharray={s.dashed ? '5 4' : undefined}
                                />
                            </g>
                        );
                    }),
                )}

                {hover !== null && (
                    <g pointerEvents="none">
                        <line
                            x1={hoverX}
                            x2={hoverX}
                            y1={PAD.top}
                            y2={PAD.top + plotHeight}
                            className="stroke-foreground/40"
                            strokeWidth={1}
                        />
                        {series.map((s) => {
                            const value = s.values[hover];

                            return value === null ? null : (
                                <circle key={s.key} cx={hoverX} cy={y(value)} r={3.5} fill={s.color} className="stroke-background" strokeWidth={1.5} />
                            );
                        })}
                    </g>
                )}

                <rect
                    x={PAD.left}
                    y={PAD.top}
                    width={plotWidth}
                    height={plotHeight}
                    fill="transparent"
                    style={{ touchAction: 'pan-y' }}
                    onPointerMove={onMove}
                    onPointerDown={onMove}
                    onPointerLeave={() => setHover(null)}
                />
            </svg>
            )}

            {width > 0 && hover !== null && (
                <div
                    className="pointer-events-none absolute top-2 z-10 max-w-[70%] min-w-32 rounded-lg border bg-popover px-3 py-2 text-xs text-popover-foreground shadow-md"
                    style={
                        hoverX > width * 0.6
                            ? { left: hoverX - 12, transform: 'translateX(-100%)' }
                            : { left: hoverX + 12 }
                    }
                >
                    <p className="mb-1 font-medium">{fullFormat.format(new Date(times[hover] * 1000))}</p>
                    {series.map((s) => (
                        <p key={s.key} className="flex items-center justify-between gap-4">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                                <span className="inline-block size-2 rounded-full" style={{ backgroundColor: s.color }} />
                                {s.label}
                            </span>
                            <span className="font-mono">{s.values[hover] === null ? '–' : formatValue(s.values[hover] as number)}</span>
                        </p>
                    ))}
                </div>
            )}
        </div>
    );
}
