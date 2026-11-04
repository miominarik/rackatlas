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
