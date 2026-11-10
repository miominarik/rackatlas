export type ServerAuthType = 'password' | 'key' | 'agent';

export type ServerCategory = {
    id: number;
    name: string;
    color: string;
    servers_count?: number;
};

export type SshKey = {
    id: number;
    name: string;
    algorithm: string;
    fingerprint: string;
    public_key: string;
    servers_count?: number;
};

export type ServerType = 'server' | 'mysql' | 'redis';

export type ServerStatus = 'unknown' | 'online' | 'offline';

export type ServerMetrics = {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
    collected: string;
};

export type ServerSummary = {
    id: number;
    type: ServerType;
    name: string;
    provider: string | null;
    country: string | null;
    host: string | null;
    port: number;
    username: string | null;
    auth_type: ServerAuthType;
    uses_agent: boolean;
    agent_terminal: boolean;
    ssh_key_name: string | null;
    agent_version: string | null;
    server_category_id: number | null;
    status: ServerStatus;
    last_checked: string | null;
    metrics: ServerMetrics | null;
};

export type ServerFormData = {
    id: number;
    type: ServerType;
    name: string;
    provider: string | null;
    country: string | null;
    host: string | null;
    port: number;
    username: string | null;
    auth_type: ServerAuthType;
    uses_agent: boolean;
    agent_terminal: boolean;
    ssh_key_id: number | null;
    server_category_id: number | null;
    ssh_host_fingerprint?: string | null;
    ignored_alerts: string[];
};

export type Backup = {
    id: number;
    name: string;
    notes: string | null;
    is_active: boolean;
    server_id: number | null;
    server_name: string | null;
    expected_interval_hours: number | null;
    webhook_url: string;
    last_run_at: string | null;
    last_status: 'success' | 'failed' | null;
    last_message: string | null;
    last_size_bytes: number | null;
    overdue: boolean;
};

export type DatabaseMetric = {
    collected_at: string;
    version: string | null;
    uptime_seconds: number;
    threads_connected: number;
    threads_running: number;
    max_connections: number;
    connections_percent: number;
    queries_per_second: number | null;
    slow_queries_total: number;
    aborted_connects_total: number;
    buffer_pool_size: number | null;
    replication: {
        source: string | null;
        io_running: boolean;
        sql_running: boolean;
        lag_seconds: number | null;
        error: string | null;
    } | null;
};

export type DatabaseSummary = {
    id: number;
    name: string;
    host: string;
    port: number;
    status: ServerStatus;
    last_checked_at: string | null;
    metric: DatabaseMetric | null;
};

export type RedisMetric = {
    collected_at: string;
    version: string | null;
    role: string | null;
    uptime_seconds: number;
    connected_clients: number;
    blocked_clients: number;
    max_clients: number;
    used_memory: number;
    max_memory: number;
    memory_percent: number | null;
    used_memory_rss: number;
    commands_per_second: number | null;
    hit_rate_percent: number | null;
    evicted_keys_total: number;
    rejected_connections_total: number;
    keys_count: number;
    connected_replicas: number;
    master: string | null;
    master_link_status: string | null;
    master_last_io_seconds_ago: number | null;
    persistence_ok: boolean | null;
    cluster: RedisClusterView | null;
};

export type RedisSummary = {
    key: string;
    id: number;
    name: string;
    host: string;
    port: number;
    status: ServerStatus;
    last_checked_at: string | null;
    via_agent: boolean;
    metric: RedisMetric | null;
};

export type RedisClusterNode = {
    id: string;
    address: string;
    flags: string[];
    myself: boolean;
    master_id: string | null;
    link_state: string;
    config_epoch: number;
    slots: number;
    migrating: boolean;
};

export type RedisClusterView = {
    state: string;
    slots_assigned: number;
    slots_ok: number;
    slots_pfail: number;
    slots_fail: number;
    known_nodes: number;
    size: number;
    current_epoch: number;
    myself: string | null;
    nodes: RedisClusterNode[];
};

export type RedisCluster = {
    state: string;
    slots_assigned: number;
    slots_fail: number;
    slots_pfail: number;
    known_nodes: number;
    size: number;
    current_epoch: number;
    problems: { type: 'state' | 'slots_unassigned' | 'node'; detail: string }[];
    unmonitored_nodes: number;
    nodes: RedisClusterNode[];
    server_ids: string[];
    collected_at: string;
};
