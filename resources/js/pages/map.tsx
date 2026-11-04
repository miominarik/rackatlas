import { Head, Link, router } from '@inertiajs/react';
import {
    ArrowLeft,
    Building2,
    Globe2,
    MapPin,
    Maximize2,
    Minus,
    Plus,
    Server,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslation } from '@/hooks/use-translation';
import { countryName } from '@/lib/countries';
import {
    MAP_HEIGHT,
    MAP_WIDTH,
    mapContext,
    mapCountries,
} from '@/lib/europe-map-data';
import type { MapCountry } from '@/lib/europe-map-data';
import { dotClass } from '@/lib/server-colors';
import { cn } from '@/lib/utils';
import { map } from '@/routes';
import { create, show } from '@/routes/servers';
import { index as teamsIndex } from '@/routes/teams';

type Status = 'unknown' | 'online' | 'offline';

type MapServer = {
    id: number;
    name: string;
    provider: string | null;
    country: string | null;
    status: Status;
    category: { name: string; color: string } | null;
};

type Props = {
    team: { id: number; name: string } | null;
    servers: MapServer[];
};

type View = { x: number; y: number; w: number };

const MAX_ZOOM = 12;
const ALL_PROVIDERS = '__all__';
const FULL_VIEW: View = { x: 0, y: 0, w: MAP_WIDTH };

const STATUS_BG: Record<Status, string> = {
    online: 'bg-emerald-500',
    offline: 'bg-red-500',
    unknown: 'bg-slate-400',
};

const STATUS_MARKER: Record<Status, string> = {
    online: 'fill-emerald-500',
    offline: 'fill-red-500',
    unknown: 'fill-slate-500',
};

/** The worst state in a group decides the colour of its marker. */
function worstStatus(servers: MapServer[]): Status {
    if (servers.some((server) => server.status === 'offline')) {
        return 'offline';
    }

    if (servers.some((server) => server.status === 'unknown')) {
        return 'unknown';
    }

    return 'online';
}

function clampView(view: View): View {
    const w = Math.min(MAP_WIDTH, Math.max(MAP_WIDTH / MAX_ZOOM, view.w));
    const h = (w * MAP_HEIGHT) / MAP_WIDTH;

    return {
        w,
        x: Math.min(MAP_WIDTH - w, Math.max(0, view.x)),
        y: Math.min(MAP_HEIGHT - h, Math.max(0, view.y)),
    };
}

/**
 * The window that frames a country with some air around it.
 */
function viewFor(country: MapCountry): View {
    const [x0, y0, x1, y1] = country.box;
    const ratio = MAP_WIDTH / MAP_HEIGHT;
    const w = Math.max((x1 - x0) * 2.4, (y1 - y0) * 2.4 * ratio, MAP_WIDTH / 6);
    const h = w / ratio;

    return clampView({
        w,
        x: (x0 + x1) / 2 - w / 2,
        y: (y0 + y1) / 2 - h / 2,
    });
}

const STATUS_STROKE: Record<Status, string> = {
    online: 'stroke-emerald-500',
    offline: 'stroke-red-500',
    unknown: 'stroke-slate-400',
};

const STATUS_ORDER: Status[] = ['online', 'unknown', 'offline'];

/**
 * A country with servers: the count in a ring that shows how many are online, offline or unknown.
 */
function CountryBadge({
    anchor,
    servers,
    unit,
    label,
    onHover,
    onSelect,
}: {
    anchor: { x: number; y: number };
    servers: MapServer[];
    unit: number;
    label: string;
    onHover: (on: boolean) => void;
    onSelect: () => void;
}) {
    const radius = 14 * unit;
    const ringRadius = 11 * unit;
    const ringWidth = 4.5 * unit;
    const circumference = 2 * Math.PI * ringRadius;
    const status = worstStatus(servers);
    let offset = 0;

    return (
        <g
            transform={`translate(${anchor.x} ${anchor.y})`}
            className="cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={label}
            onMouseEnter={() => onHover(true)}
            onMouseLeave={() => onHover(false)}
            onClick={(event) => {
                event.stopPropagation();
                onSelect();
            }}
            onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onSelect();
                }
            }}
        >
            {status === 'online' && (
                <circle
                    r={radius}
                    className="animate-ping fill-emerald-500/25 motion-reduce:hidden"
                />
            )}
            <circle
                r={radius}
                strokeWidth={1 * unit}
                className="fill-background stroke-border drop-shadow-md"
            />
            {STATUS_ORDER.map((key) => {
                const count = servers.filter(
                    (server) => server.status === key,
                ).length;

                if (count === 0) {
                    return null;
                }

                const length = (count / servers.length) * circumference;
                const gap =
                    servers.length > 1 ? Math.min(2 * unit, length / 3) : 0;
                const segment = (
                    <circle
                        key={key}
                        r={ringRadius}
                        fill="none"
                        strokeWidth={ringWidth}
                        strokeDasharray={`${Math.max(length - gap, 0.01)} ${circumference - length + gap}`}
                        strokeDashoffset={-offset}
                        transform="rotate(-90)"
                        className={STATUS_STROKE[key]}
                    />
                );

                offset += length;

                return segment;
            })}
            <text
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={11 * unit}
                className="pointer-events-none fill-foreground font-semibold"
            >
                {servers.length}
            </text>
        </g>
    );
}

/**
 * The servers of the selected country spread around its centre, each with its name.
 */
function ServerPins({
    anchor,
    servers,
    unit,
    activeId,
    onHover,
    onOpen,
    canClick,
}: {
    anchor: { x: number; y: number };
    servers: MapServer[];
    unit: number;
    activeId: number | null;
    onHover: (id: number | null) => void;
    onOpen: (id: number) => void;
    canClick: () => boolean;
}) {
    const perRing = 8;

    return (
        <g transform={`translate(${anchor.x} ${anchor.y})`}>
            {servers.length > 1 && (
                <circle
                    r={
                        (30 + Math.floor((servers.length - 1) / perRing) * 26) *
                        unit
                    }
                    fill="none"
                    strokeDasharray={`${3 * unit} ${4 * unit}`}
                    strokeWidth={1 * unit}
                    className="stroke-muted-foreground/40"
                />
            )}
            {servers.map((server, index) => {
                const ring = Math.floor(index / perRing);
                const inRing = Math.min(
                    perRing,
                    servers.length - ring * perRing,
                );
                const single = servers.length === 1;
                const angle =
                    ((index % perRing) / inRing) * Math.PI * 2 -
                    Math.PI / 2 +
                    ring * 0.4;
                const distance = single ? 0 : (30 + ring * 26) * unit;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                const active = activeId === server.id;
                const toLeft = Math.cos(angle) < -0.2;
                const labelX = x + (toLeft ? -1 : 1) * 14 * unit;

                return (
                    <g
                        key={server.id}
                        className="cursor-pointer"
                        role="link"
                        tabIndex={0}
                        aria-label={server.name}
                        onMouseEnter={() => onHover(server.id)}
                        onMouseLeave={() => onHover(null)}
                        onFocus={() => onHover(server.id)}
                        onBlur={() => onHover(null)}
                        onClick={(event) => {
                            event.stopPropagation();

                            if (canClick()) {
                                onOpen(server.id);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                onOpen(server.id);
                            }
                        }}
                    >
                        <circle
                            cx={x}
                            cy={y}
                            r={(active ? 11 : 9) * unit}
                            strokeWidth={2.5 * unit}
                            className={cn(
                                'stroke-background drop-shadow-md transition-[r]',
                                STATUS_MARKER[server.status],
                            )}
                        />
                        <text
                            x={labelX}
                            y={y}
                            textAnchor={toLeft ? 'end' : 'start'}
                            dominantBaseline="central"
                            fontSize={12 * unit}
                            strokeWidth={3 * unit}
                            paintOrder="stroke"
                            strokeLinejoin="round"
                            className={cn(
                                'pointer-events-none fill-foreground stroke-background',
                                active ? 'font-semibold' : 'font-medium',
                            )}
                        >
                            {server.name}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}

function StatusDot({ status }: { status: Status }) {
    return (
        <span
            className={cn('size-2 shrink-0 rounded-full', STATUS_BG[status])}
        />
    );
}

export default function ServerMap({ team, servers }: Props) {
    const { t, locale } = useTranslation();
    const [view, setView] = useState<View>(FULL_VIEW);
    const [selected, setSelected] = useState<string | null>(null);
    const [hovered, setHovered] = useState<string | null>(null);
    const [hoveredServer, setHoveredServer] = useState<number | null>(null);
    const [provider, setProvider] = useState(ALL_PROVIDERS);
    const svgRef = useRef<SVGSVGElement>(null);
    const dragged = useRef(false);
    const animation = useRef<number | null>(null);
    const viewRef = useRef(view);
    viewRef.current = view;

    const anchors = useMemo(
        () => new Map(mapCountries.map((country) => [country.code, country])),
        [],
    );

    const providers = useMemo(
        () =>
            [
                ...new Set(
                    servers
                        .map((server) => server.provider)
                        .filter((name): name is string => !!name),
                ),
            ].sort((a, b) => a.localeCompare(b, locale)),
        [servers, locale],
    );

    const placed = useMemo(
        () =>
            servers.filter(
                (server) =>
                    server.country !== null &&
                    anchors.has(server.country) &&
                    (provider === ALL_PROVIDERS ||
                        server.provider === provider),
            ),
        [servers, anchors, provider],
    );

    const byCountry = useMemo(() => {
        const groups = new Map<string, MapServer[]>();

        for (const server of placed) {
            groups.set(server.country!, [
                ...(groups.get(server.country!) ?? []),
                server,
            ]);
        }

        return groups;
    }, [placed]);

    const countryList = useMemo(
        () =>
            [...byCountry.entries()].sort((a, b) => b[1].length - a[1].length),
        [byCountry],
    );

    const unplaced = servers.filter(
        (server) => server.country === null || !anchors.has(server.country),
    ).length;

    const zoom = MAP_WIDTH / view.w;
    const viewHeight = (view.w * MAP_HEIGHT) / MAP_WIDTH;
    // Markers keep their size on screen while the map grows under them.
    const unit = 1 / zoom;

    const stopFlying = () => {
        if (animation.current !== null) {
            cancelAnimationFrame(animation.current);
            animation.current = null;
        }
    };

    /**
     * Glide to another window instead of jumping.
     */
    const flyTo = (target: View) => {
        stopFlying();

        const from = viewRef.current;
        const started = performance.now();
        const duration = 450;

        const step = (now: number) => {
            const progress = Math.min(1, (now - started) / duration);
            const eased = 1 - Math.pow(1 - progress, 3);

            setView({
                x: from.x + (target.x - from.x) * eased,
                y: from.y + (target.y - from.y) * eased,
                w: from.w + (target.w - from.w) * eased,
            });

            animation.current =
                progress < 1 ? requestAnimationFrame(step) : null;
        };

        animation.current = requestAnimationFrame(step);
    };

    const select = (code: string | null) => {
        setSelected(code);
        flyTo(code === null ? FULL_VIEW : viewFor(anchors.get(code)!));
    };

    const zoomBy = (factor: number, at?: { x: number; y: number }) => {
        stopFlying();

        setView((current) => {
            const w = Math.min(
                MAP_WIDTH,
                Math.max(MAP_WIDTH / MAX_ZOOM, current.w / factor),
            );
            const currentHeight = (current.w * MAP_HEIGHT) / MAP_WIDTH;
            const point = at ?? {
                x: current.x + current.w / 2,
                y: current.y + currentHeight / 2,
            };
            const ratio = w / current.w;

            return clampView({
                w,
                x: point.x - (point.x - current.x) * ratio,
                y: point.y - (point.y - current.y) * ratio,
            });
        });
    };

    useEffect(() => {
        const svg = svgRef.current;

        if (svg === null) {
            return;
        }

        const onWheel = (event: WheelEvent) => {
            event.preventDefault();

            const matrix = svg.getScreenCTM();

            if (matrix === null) {
                return;
            }

            const point = new DOMPoint(
                event.clientX,
                event.clientY,
            ).matrixTransform(matrix.inverse());

            zoomBy(Math.exp(-event.deltaY * 0.0015), point);
        };

        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setSelected(null);
                flyTo(FULL_VIEW);
            }
        };

        svg.addEventListener('wheel', onWheel, { passive: false });
        window.addEventListener('keydown', onKey);

        return () => {
            svg.removeEventListener('wheel', onWheel);
            window.removeEventListener('keydown', onKey);
            stopFlying();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [team]);

    const startDrag = (event: React.PointerEvent<SVGSVGElement>) => {
        const scale = svgRef.current?.getScreenCTM()?.a;

        dragged.current = false;

        if (event.button !== 0 || zoom === 1 || !scale) {
            return;
        }

        stopFlying();

        const start = { x: event.clientX, y: event.clientY, view };

        const move = (moveEvent: PointerEvent) => {
            const dx = moveEvent.clientX - start.x;
            const dy = moveEvent.clientY - start.y;

            if (Math.hypot(dx, dy) > 4) {
                dragged.current = true;
            }

            if (dragged.current) {
                setView(
                    clampView({
                        w: start.view.w,
                        x: start.view.x - dx / scale,
                        y: start.view.y - dy / scale,
                    }),
                );
            }
        };
        const stop = () => {
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', stop);
        };

        window.addEventListener('pointermove', move);
        window.addEventListener('pointerup', stop);
    };

    if (team === null) {
        return (
            <div className="mx-auto flex max-w-xl flex-col items-center gap-3 p-10 text-center">
                <Head title={t('Map')} />
                <MapPin className="size-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                    {t('Create a team first, servers belong to a team.')}
                </p>
                <Button asChild>
                    <Link href={teamsIndex()}>{t('Teams')}</Link>
                </Button>
            </div>
        );
    }

    const selectedServers = selected ? (byCountry.get(selected) ?? []) : [];
    const hoveredName = hovered ? countryName(hovered, locale) : null;

    const stats = [
        { icon: Server, label: t('Servers'), value: placed.length },
        { icon: Globe2, label: t('Countries'), value: byCountry.size },
        {
            icon: Building2,
            label: t('Providers'),
            value: new Set(
                placed.map((server) => server.provider).filter(Boolean),
            ).size,
        },
    ];

    return (
        <>
            <Head title={t('Map')} />
            <div className="mx-auto flex w-full max-w-[100rem] flex-col gap-4 p-4 md:p-6 lg:h-[calc(100svh-5rem)] lg:overflow-hidden">
                <div className="flex shrink-0 flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">{t('Map')}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t('Where your servers run in Europe.')}
                        </p>
                    </div>
                    {providers.length > 0 && (
                        <Select value={provider} onValueChange={setProvider}>
                            <SelectTrigger className="w-52">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={ALL_PROVIDERS}>
                                    {t('All providers')}
                                </SelectItem>
                                {providers.map((name) => (
                                    <SelectItem key={name} value={name}>
                                        {name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                </div>

                <div className="grid gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_20rem]">
                    <div className="relative min-h-72 overflow-hidden rounded-xl border bg-muted/40 lg:min-h-0">
                        <svg
                            ref={svgRef}
                            viewBox={`${view.x} ${view.y} ${view.w} ${viewHeight}`}
                            onPointerDown={startDrag}
                            onClick={() => {
                                if (!dragged.current && selected !== null) {
                                    select(null);
                                }
                            }}
                            style={{
                                touchAction: zoom > 1 ? 'none' : undefined,
                            }}
                            className={cn(
                                'block h-auto w-full select-none lg:absolute lg:inset-0 lg:h-full',
                                zoom > 1 &&
                                    'cursor-grab active:cursor-grabbing',
                            )}
                            role="img"
                            aria-label={t('Map of servers in Europe')}
                        >
                            <path
                                d={mapContext}
                                className="fill-card/60 stroke-border"
                                strokeWidth={1}
                                vectorEffect="non-scaling-stroke"
                                strokeLinejoin="round"
                            />
                            {mapCountries.map((country) => {
                                const has = byCountry.has(country.code);
                                const isSelected = selected === country.code;

                                return (
                                    <path
                                        key={country.code}
                                        d={country.d}
                                        strokeWidth={1}
                                        vectorEffect="non-scaling-stroke"
                                        strokeLinejoin="round"
                                        onMouseEnter={() =>
                                            setHovered(country.code)
                                        }
                                        onMouseLeave={() => setHovered(null)}
                                        onClick={(event) => {
                                            if (dragged.current || !has) {
                                                return;
                                            }

                                            event.stopPropagation();
                                            select(
                                                isSelected
                                                    ? null
                                                    : country.code,
                                            );
                                        }}
                                        className={cn(
                                            'stroke-border transition-colors',
                                            has
                                                ? 'cursor-pointer fill-primary/15 hover:fill-primary/25'
                                                : 'fill-card hover:fill-accent',
                                            isSelected &&
                                                'fill-primary/30 hover:fill-primary/30',
                                        )}
                                    />
                                );
                            })}

                            {countryList.map(([code, list]) => {
                                const anchor = anchors.get(code)!;

                                if (selected === code) {
                                    return (
                                        <ServerPins
                                            key={code}
                                            anchor={anchor}
                                            servers={list}
                                            unit={unit}
                                            activeId={hoveredServer}
                                            onHover={setHoveredServer}
                                            onOpen={(id) =>
                                                router.visit(show(id).url)
                                            }
                                            canClick={() => !dragged.current}
                                        />
                                    );
                                }

                                return (
                                    <CountryBadge
                                        key={code}
                                        anchor={anchor}
                                        servers={list}
                                        unit={unit}
                                        label={`${countryName(code, locale)}: ${list.length}`}
                                        onHover={(on) =>
                                            setHovered(on ? code : null)
                                        }
                                        onSelect={() => {
                                            if (!dragged.current) {
                                                select(code);
                                            }
                                        }}
                                    />
                                );
                            })}
                        </svg>

                        {hoveredName && (
                            <div className="pointer-events-none absolute top-3 left-3 rounded-lg border bg-popover px-3 py-1.5 text-sm font-medium shadow-sm">
                                {hoveredName}
                                {byCountry.has(hovered!) && (
                                    <span className="ml-2 text-xs font-normal text-muted-foreground">
                                        {t(':count servers', {
                                            count: byCountry.get(hovered!)!
                                                .length,
                                        })}
                                    </span>
                                )}
                            </div>
                        )}

                        <div className="absolute right-3 bottom-3 flex flex-col overflow-hidden rounded-lg border bg-background shadow-sm">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-none"
                                onClick={() => zoomBy(1.6)}
                                disabled={zoom >= MAX_ZOOM}
                                aria-label={t('Zoom in')}
                            >
                                <Plus className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-none border-t"
                                onClick={() => zoomBy(1 / 1.6)}
                                disabled={zoom <= 1}
                                aria-label={t('Zoom out')}
                            >
                                <Minus className="size-4" />
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="rounded-none border-t"
                                onClick={() => select(null)}
                                disabled={zoom === 1 && selected === null}
                                aria-label={t('Reset zoom')}
                            >
                                <Maximize2 className="size-4" />
                            </Button>
                        </div>

                        <div className="absolute bottom-3 left-3 flex items-center gap-3 rounded-lg border bg-background/90 px-3 py-1.5 text-xs text-muted-foreground shadow-sm backdrop-blur">
                            {(['online', 'offline', 'unknown'] as const).map(
                                (status) => (
                                    <span
                                        key={status}
                                        className="inline-flex items-center gap-1.5"
                                    >
                                        <StatusDot status={status} />
                                        {status === 'online'
                                            ? t('Online')
                                            : status === 'offline'
                                              ? t('Offline')
                                              : t('Unknown')}
                                    </span>
                                ),
                            )}
                        </div>
                    </div>

                    <aside className="flex flex-col gap-3 lg:min-h-0 lg:overflow-y-auto">
                        {selected ? (
                            <>
                                <button
                                    type="button"
                                    onClick={() => select(null)}
                                    className="inline-flex w-fit items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
                                >
                                    <ArrowLeft className="size-4" />
                                    {t('All countries')}
                                </button>
                                <div>
                                    <h2 className="text-lg font-semibold">
                                        {countryName(selected, locale)}
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        {t(':count servers', {
                                            count: selectedServers.length,
                                        })}
                                    </p>
                                </div>
                                <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                                    {selectedServers.map((server) => (
                                        <li key={server.id}>
                                            <Link
                                                href={show(server.id)}
                                                onMouseEnter={() =>
                                                    setHoveredServer(server.id)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredServer(null)
                                                }
                                                className="flex items-center gap-3 px-3 py-3 hover:bg-muted/50"
                                            >
                                                <StatusDot
                                                    status={server.status}
                                                />
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium">
                                                        {server.name}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
                                                        {server.provider ??
                                                            t('No provider')}
                                                        {server.category && (
                                                            <>
                                                                <span>·</span>
                                                                <span
                                                                    className={cn(
                                                                        'size-1.5 rounded-full',
                                                                        dotClass(
                                                                            server
                                                                                .category
                                                                                .color,
                                                                        ),
                                                                    )}
                                                                />
                                                                {
                                                                    server
                                                                        .category
                                                                        .name
                                                                }
                                                            </>
                                                        )}
                                                    </span>
                                                </span>
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </>
                        ) : (
                            <>
                                <div className="grid grid-cols-3 gap-2">
                                    {stats.map(
                                        ({ icon: Icon, label, value }) => (
                                            <div
                                                key={label}
                                                className="rounded-xl border bg-card p-3"
                                            >
                                                <Icon className="size-4 text-muted-foreground" />
                                                <div className="mt-1.5 text-2xl font-semibold tabular-nums">
                                                    {value}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {label}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>

                                {countryList.length === 0 ? (
                                    <div className="rounded-xl border border-dashed bg-card p-4 text-sm text-muted-foreground">
                                        <p>
                                            {t(
                                                'No server has a country yet. Set the provider and country in the server settings.',
                                            )}
                                        </p>
                                        {servers.length === 0 && (
                                            <Button
                                                asChild
                                                size="sm"
                                                className="mt-3"
                                            >
                                                <Link href={create()}>
                                                    {t('Add server')}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <ul className="divide-y overflow-hidden rounded-xl border bg-card">
                                        {countryList.map(([code, list]) => (
                                            <li key={code}>
                                                <button
                                                    type="button"
                                                    onClick={() => select(code)}
                                                    onMouseEnter={() =>
                                                        setHovered(code)
                                                    }
                                                    onMouseLeave={() =>
                                                        setHovered(null)
                                                    }
                                                    className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm hover:bg-muted/50"
                                                >
                                                    <StatusDot
                                                        status={worstStatus(
                                                            list,
                                                        )}
                                                    />
                                                    <span className="flex-1 truncate font-medium">
                                                        {countryName(
                                                            code,
                                                            locale,
                                                        )}
                                                    </span>
                                                    <span className="text-muted-foreground tabular-nums">
                                                        {list.length}
                                                    </span>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {unplaced > 0 && countryList.length > 0 && (
                                    <p className="text-xs text-muted-foreground">
                                        {t(
                                            ':count servers have no country set, so they are not on the map.',
                                            { count: unplaced },
                                        )}
                                    </p>
                                )}
                            </>
                        )}
                    </aside>
                </div>
            </div>
        </>
    );
}

ServerMap.layout = {
    breadcrumbs: [{ title: 'Map', href: map() }],
};
