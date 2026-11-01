export type StorageMonitor = {
    id: number;
    name: string;
    account: string;
    container: string;
    status: 'unknown' | 'online' | 'offline';
    last_checked_at: string | null;
    last_error: string | null;
    blob_count: number | null;
    total_bytes: number | null;
    is_partial: boolean;
    response_ms: number | null;
    check_interval: number;
};

export type StoragePoint = {
    t: number;
    ok: boolean;
    response_ms: number | null;
    blob_count: number | null;
    total_bytes: number | null;
};
