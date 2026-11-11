import { Link } from "@inertiajs/react";
import { ArrowDown, GitFork, Server } from "lucide-react";
import DatabaseController from "@/actions/App/Http/Controllers/DatabaseController";
import { useTranslation } from "@/hooks/use-translation";
import { cn } from "@/lib/utils";
import type {
    ReplicationLink,
    ReplicationNode,
    ReplicationTopology,
} from "@/types";

const statusDot: Record<string, string> = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    unknown: "bg-zinc-400",
};

const linkStyle: Record<ReplicationLink["state"], string> = {
    ok: "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    lagging:
        "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    broken: "border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-400",
};

const lineStyle: Record<ReplicationLink["state"], string> = {
    ok: "bg-emerald-500/60",
    lagging: "bg-amber-500/60",
    broken: "bg-red-500/60 [background-image:repeating-linear-gradient(to_bottom,transparent_0_4px,var(--background)_4px_7px)]",
};

function LinkBadge({ link }: { link: ReplicationLink }) {
    const { t } = useTranslation();

    const label =
        link.state === "broken"
            ? [
                  link.io_running === false ? t("IO stopped") : null,
                  link.sql_running === false ? t("SQL stopped") : null,
              ]
                  .filter(Boolean)
                  .join(" · ")
            : link.lag_seconds !== null
              ? t("Lag :seconds s", { seconds: link.lag_seconds })
              : t("Replicating");

    return (
        <div className="flex max-w-full flex-col items-center gap-1">
            <span
                className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
                    linkStyle[link.state],
                )}
            >
                <ArrowDown className="size-3" />
                {label}
            </span>
            {link.error && (
                <p
                    title={link.error}
                    className="line-clamp-2 max-w-64 text-center text-xs text-red-600 dark:text-red-400"
                >
                    {link.error}
                </p>
            )}
        </div>
    );
}

function NodeCard({ node, role }: { node: ReplicationNode; role: string }) {
    const { t } = useTranslation();

    const body = (
        <div
            className={cn(
                "w-64 max-w-full rounded-xl border bg-card p-3 text-left shadow-sm transition",
                node.external && "border-dashed",
                node.id !== null && "hover:border-primary/50",
            )}
        >
            <div className="flex items-center gap-2">
                <span
                    className={cn(
                        "size-2.5 shrink-0 rounded-full",
                        statusDot[node.status],
                    )}
                />
                <span className="truncate text-sm font-medium">
                    {node.name}
                </span>
                <span className="ml-auto shrink-0 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                    {role}
                </span>
            </div>
            <p className="mt-1 truncate font-mono text-xs text-muted-foreground">
                {node.host}
                {node.port ? `:${node.port}` : ""}
                {node.version && ` · ${node.version}`}
            </p>
            {node.external ? (
                <p className="mt-2 text-xs text-muted-foreground">
                    {t("Not monitored in this team")}
                </p>
            ) : (
                <p className="mt-2 flex gap-4 text-xs text-muted-foreground">
                    <span>
                        {t("Connections")}{" "}
                        <span className="font-mono text-foreground">
                            {node.connections_percent !== null
                                ? `${Math.round(node.connections_percent)} %`
                                : "–"}
                        </span>
                    </span>
                    <span>
                        {t("Queries/s")}{" "}
                        <span className="font-mono text-foreground">
                            {node.queries_per_second ?? "–"}
                        </span>
                    </span>
                </p>
            )}
        </div>
    );

    return node.id !== null ? (
        <Link href={DatabaseController.show(node.id)}>{body}</Link>
    ) : (
        body
    );
}

function Branch({ node, depth }: { node: ReplicationNode; depth: number }) {
    const { t } = useTranslation();
    const isSource = node.replicas.length > 0;
    const role =
        depth === 0 ? t("Master") : isSource ? t("Relay") : t("Replica");

    return (
        <div className="flex flex-col items-center">
            <NodeCard node={node} role={role} />

            {isSource && (
                <ul className="mt-2 flex flex-wrap justify-center gap-x-6 gap-y-4">
                    {node.replicas.map((replica) => (
                        <li
                            key={replica.id ?? replica.name}
                            className="flex flex-col items-center gap-2"
                        >
                            <div
                                className={cn(
                                    "h-6 w-0.5",
                                    lineStyle[replica.link?.state ?? "ok"],
                                )}
                            />
                            {replica.link && <LinkBadge link={replica.link} />}
                            <div
                                className={cn(
                                    "h-3 w-0.5",
                                    lineStyle[replica.link?.state ?? "ok"],
                                )}
                            />
                            <Branch node={replica} depth={depth + 1} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export function ReplicationOverview({
    topologies,
}: {
    topologies: ReplicationTopology[];
}) {
    const { t } = useTranslation();

    if (topologies.length === 0) {
        return null;
    }

    return (
        <section className="space-y-3">
            <div className="flex items-center gap-2">
                <GitFork className="size-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold">{t("Replication")}</h2>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
                {topologies.map((topology, index) => (
                    <div
                        key={topology.source.id ?? topology.source.name}
                        className="space-y-4 rounded-xl border bg-card/50 p-4"
                    >
                        <div className="flex items-center justify-between gap-2">
                            <p className="flex items-center gap-2 text-sm font-medium">
                                <Server className="size-4 text-muted-foreground" />
                                {t("Cluster :number", { number: index + 1 })}
                            </p>
                            <span
                                className={cn(
                                    "rounded-full px-2.5 py-0.5 text-xs font-medium",
                                    topology.healthy
                                        ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                        : "bg-red-500/10 text-red-700 dark:text-red-400",
                                )}
                            >
                                {topology.healthy
                                    ? t("Replication is healthy")
                                    : t("Replication has a problem")}
                            </span>
                        </div>
                        <div className="overflow-x-auto pb-1">
                            <div className="flex min-w-max justify-center">
                                <Branch node={topology.source} depth={0} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
