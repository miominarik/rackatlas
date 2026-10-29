export function serverAddress(
    server: { host: string | null; port: number; username: string | null },
    agentLabel: string,
): string {
    if (!server.host) {
        return agentLabel;
    }

    const user = server.username ? `${server.username}@` : '';
    const port = server.port !== 22 ? `:${server.port}` : '';

    return `${user}${server.host}${port}`;
}
