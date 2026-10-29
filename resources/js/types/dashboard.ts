export type DashboardWidgetId =
    | 'summary'
    | 'problems'
    | 'servers'
    | 'top'
    | 'logs'
    | 'errors';

export type DashboardMetricId = 'cpu' | 'ram' | 'disk' | 'load' | 'uptime';

export type DashboardSort = 'name' | 'status' | 'cpu' | 'ram' | 'disk';

export type DashboardThresholds = Record<
    'cpu' | 'ram' | 'disk',
    { warn: number; critical: number }
>;

export type DashboardSettings = {
    widgets: { id: DashboardWidgetId; visible: boolean }[];
    servers: {
        sort: DashboardSort;
        density: 'comfortable' | 'compact';
        group_by_category: boolean;
        metrics: DashboardMetricId[];
        show_history: boolean;
    };
    thresholds: DashboardThresholds;
    refresh_seconds: number;
};

export type DashboardDisk = {
    mount: string;
    filesystem: string;
    total_bytes: number;
    used_bytes: number;
};

export type DashboardMetrics = {
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
    disks: DashboardDisk[];
};

export type DashboardServer = {
    id: number;
    name: string;
    host: string | null;
    port: number;
    username: string | null;
    status: 'unknown' | 'online' | 'offline';
    auth_type: 'password' | 'key' | 'agent';
    failed_units: string[];
    category: { id: number; name: string; color: string } | null;
    last_checked_at: string | null;
    last_seen_at: string | null;
    metrics: DashboardMetrics | null;
};

export type DashboardError = {
    id: number;
    server_id: number;
    server_name: string;
    type: string;
    message: string;
    occurred_at: string;
};

export type DashboardHistory = Record<
    string,
    { cpu: number; ram: number }[]
>;

export type DashboardLog = {
    id: number;
    server_id: number;
    server_name: string;
    level: 'critical' | 'error';
    source: string;
    message: string;
    count: number;
    occurred_at: string;
};
