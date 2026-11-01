export type SocialProvider = {
    id: string;
    name: string;
};

export type ConnectedSocialProvider = SocialProvider & {
    connected: boolean;
    connected_email: string | null;
};
