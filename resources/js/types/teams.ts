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
};

export type TeamInvitation = {
    id: number;
    email: string;
    role: TeamRole;
    expires_at: string;
    expired: boolean;
};

export type SharedTeam = {
    id: number;
    name: string;
    role: TeamRole;
};
