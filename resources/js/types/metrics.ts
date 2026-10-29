export type MetricsRange = '1h' | '6h' | '24h' | '7d' | '30d';

export type MetricsPoint = {
    t: number;
    samples: number;
    cpu_avg: number | null;
    cpu_max: number | null;
    ram_avg: number | null;
    ram_max: number | null;
    swap: number | null;
    load_1: number | null;
    load_5: number | null;
    load_15: number | null;
    cores: number;
    boot_min: number;
    boot_max: number;
};

export type MetricsDiskPoint = {
    t: number;
    pct: number | null;
    used: number;
    total: number;
};

export type MetricsIncident = {
    id: number;
    type: 'offline' | 'resource' | 'service' | 'log';
    key: string;
    context: Record<string, string | number> | null;
    opened_at: string;
    resolved_at: string | null;
};

export type MetricsReport = {
    range: MetricsRange;
    bucket_seconds: number;
    points: MetricsPoint[];
    disks: Record<string, MetricsDiskPoint[]>;
    forecast: Record<string, { per_day: number; days: number | null }>;
    restarts: number[];
    availability: number | null;
    incidents: MetricsIncident[];
    generated_at: string;
};

export type MetricsCurrent = {
    collected_at: string;
    cpu_percent: number;
    cpu_cores: number;
    load_1: number;
    load_5: number;
    load_15: number;
    memory_total: number;
    memory_used: number;
    swap_total: number;
    swap_used: number;
    uptime_seconds: number;
    disks: {
        mount: string;
        device: string;
        filesystem: string;
        total_bytes: number;
        used_bytes: number;
    }[];
};

export type MetricsServer = {
    id: number;
    name: string;
    status: 'unknown' | 'online' | 'offline';
    auth_type: string;
    agent_version: string | null;
    last_seen_at: string | null;
};
