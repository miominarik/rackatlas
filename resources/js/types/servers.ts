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

export type ServerStatus = 'unknown' | 'online' | 'offline';

export type ServerMetrics = {
    cpu_percent: number;
    memory_percent: number;
    disk_percent: number;
    collected: string;
};

export type ServerSummary = {
    id: number;
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
