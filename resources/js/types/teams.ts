export type TeamRole = 'owner' | 'admin' | 'member';

export type TeamSummary = {
    id: number;
    name: string;
    role: TeamRole;
    members_count: number;
};

export type TeamMember = {
    id: number;
    name: string;
    email: string;
    role: TeamRole;
    permissions: PermissionMap;
};

export type TeamInvitation = {
    id: number;
    email: string;
    role: TeamRole;
    permissions: PermissionMap;
    expires_at: string;
    expired: boolean;
};

export type SharedTeam = {
    id: number;
    name: string;
    role: TeamRole;
};

export type PermissionLevel = 'none' | 'view' | 'edit';

export type PermissionMap = Record<string, PermissionLevel>;

export type PermissionCatalogItem = {
    key: string;
    levels: PermissionLevel[];
};
