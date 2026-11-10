import { Head, Link, usePoll } from "@inertiajs/react";
import { AlertTriangle, CheckCircle2, MemoryStick, Plus } from "lucide-react";
import ServerController from "@/actions/App/Http/Controllers/Servers/ServerController";
import UsageBar from "@/components/dashboard/usage-bar";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/hooks/use-translation";
import { formatBytes, formatUptime, timeAgo } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { index as redisIndex } from "@/routes/redis";
import { index as teamsIndex } from "@/routes/teams";
import type { RedisCluster, RedisSummary, ServerStatus } from "@/types";

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    servers: RedisSummary[];
    clusters: RedisCluster[];
    generated_at: string;
};

const statusDot: Record<ServerStatus, string> = {
    online: "bg-emerald-500",
    offline: "bg-red-500",
    unknown: "bg-zinc-400",
};

const level = (percent: number): "ok" | "warning" | "critical" =>
    percent >= 90 ? "critical" : percent >= 75 ? "warning" : "ok";

function Stat({ label, value }: { label: string; value: string }) {
    return (
        <div>
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="font-mono text-sm">{value}</dd>
        </div>
    );
}

function Badge({
    tone,
    children,
}: {
    tone: "ok" | "bad" | "neutral";
    children: React.ReactNode;
}) {
    return (
        <span
            className={cn(
                "inline-flex items-center rounded-md px-2 py-0.5 text-xs ring-1 ring-inset",
                tone === "ok" &&
                    "bg-emerald-500/10 text-emerald-700 ring-emerald-500/30 dark:text-emerald-300",
                tone === "bad" &&
                    "bg-red-500/10 text-red-700 ring-red-500/30 dark:text-red-300",
                tone === "neutral" &&
                    "bg-muted text-muted-foreground ring-border",
            )}
        >
            {children}
        </span>
    );
}

export default function Redis({
    team,
    canManage,
    servers,
    clusters,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();

    usePoll(30000, { only: ["servers", "clusters", "generated_at"] });

    if (!team) {
        return (
            <>
                <Head title={t("Redis")} />
                <div className="mx-auto max-w-md space-y-4 p-8 text-center">
                    <h1 className="text-xl font-semibold">
                        {t("Create a team first")}
                    </h1>
                    <Button asChild>
                        <Link href={teamsIndex()}>{t("Create team")}</Link>
                    </Button>
                </div>
            </>
        );
    }

    const statusLabel: Record<string, string> = {
        online: t("Online"),
        offline: t("Offline"),
        unknown: t("Not checked yet"),
    };

    const roleLabel = (role: string | null) =>
        role === "master"
            ? t("Master")
            : role === "slave" || role === "replica"
              ? t("Replica")
              : (role ?? "–");

    const serverAt = (address: string) =>
        servers.find((server) => `${server.host}:${server.port}` === address)
            ?.name;

    return (
        <>
            <Head title={t("Redis")} />

            <div className="mx-auto w-full max-w-[100rem] space-y-6 p-4 md:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">{t("Redis")}</h1>
                        <p className="text-sm text-muted-foreground">
                            {t("Redis servers of the team :team", {
                                team: team.name,
                            })}
                        </p>
                    </div>
                    {canManage && (
                        <Button asChild>
                            <Link href={ServerController.create()}>
                                <Plus className="size-4" />
                                {t("Add server")}
                            </Link>
                        </Button>
                    )}
                </div>

                {servers.length === 0 && clusters.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <MemoryStick className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {t("No Redis servers yet")}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                "Add a server and choose the type Redis server, or let the agent of a server report its Redis.",
                            )}
                        </p>
                    </div>
                ) : (
                    <>
                        {clusters.map((cluster) => {
                            const serverOf = (id: string) =>
                                servers.find(
                                    (server) =>
                                        server.metric?.cluster?.myself === id,
                                );

                            return (
                                <section
                                    key={cluster.server_ids.join("-")}
                                    className="space-y-3 rounded-xl border bg-card p-4"
                                    data-test="redis-cluster"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-2">
                                        <div>
                                            <h2 className="font-medium">
                                                {t("Redis Cluster")}
                                            </h2>
                                            <p className="text-xs text-muted-foreground">
                                                {t(
                                                    ":nodes nodes, :masters masters",
                                                    {
                                                        nodes: cluster.known_nodes,
                                                        masters: cluster.size,
                                                    },
                                                )}
                                                {" · "}
                                                {t("Last check :time.", {
                                                    time: timeAgo(
                                                        cluster.collected_at,
                                                        generated_at,
                                                        locale,
                                                    ),
                                                })}
                                            </p>
                                        </div>
                                        <Badge
                                            tone={
                                                cluster.state === "ok"
                                                    ? "ok"
                                                    : "bad"
                                            }
                                        >
                                            {cluster.state === "ok"
                                                ? t("Cluster is healthy")
                                                : t("Cluster is down")}
                                        </Badge>
                                    </div>

                                    <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                        <Stat
                                            label={t("Slots assigned")}
                                            value={`${cluster.slots_assigned.toLocaleString(locale)} / 16 384`}
                                        />
                                        <Stat
                                            label={t("Failing slots")}
                                            value={String(
                                                cluster.slots_fail +
                                                    cluster.slots_pfail,
                                            )}
                                        />
                                        <Stat
                                            label={t("Config epoch")}
                                            value={String(
                                                cluster.current_epoch,
                                            )}
                                        />
                                        <Stat
                                            label={t("Without agent")}
                                            value={String(
                                                cluster.unmonitored_nodes,
                                            )}
                                        />
                                    </dl>

                                    {cluster.problems.length > 0 && (
                                        <ul className="space-y-1 rounded-lg bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                                            {cluster.problems.map(
                                                (problem, index) => (
                                                    <li
                                                        key={index}
                                                        className="flex gap-2"
                                                    >
                                                        <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                                                        <span>
                                                            {problem.type ===
                                                            "state"
                                                                ? t(
                                                                      "The cluster state is :state.",
                                                                      {
                                                                          state: problem.detail,
                                                                      },
                                                                  )
                                                                : problem.type ===
                                                                    "slots_unassigned"
                                                                  ? t(
                                                                        ":count slots are not assigned to any node.",
                                                                        {
                                                                            count: problem.detail,
                                                                        },
                                                                    )
                                                                  : t(
                                                                        "Node :node has a problem.",
                                                                        {
                                                                            node: problem.detail,
                                                                        },
                                                                    )}
                                                        </span>
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    )}

                                    <ul className="divide-y rounded-lg border text-sm">
                                        {[...cluster.nodes]
                                            .sort(
                                                (a, b) =>
                                                    Number(
                                                        b.flags.includes(
                                                            "master",
                                                        ),
                                                    ) -
                                                        Number(
                                                            a.flags.includes(
                                                                "master",
                                                            ),
                                                        ) ||
                                                    a.address.localeCompare(
                                                        b.address,
                                                    ),
                                            )
                                            .map((node) => {
                                                const isMaster =
                                                    node.flags.includes(
                                                        "master",
                                                    );
                                                const bad =
                                                    node.flags.some((flag) =>
                                                        [
                                                            "fail",
                                                            "fail?",
                                                            "handshake",
                                                            "noaddr",
                                                        ].includes(flag),
                                                    ) ||
                                                    node.link_state !==
                                                        "connected";
                                                const master = node.master_id
                                                    ? cluster.nodes.find(
                                                          (other) =>
                                                              other.id ===
                                                              node.master_id,
                                                      )
                                                    : null;

                                                return (
                                                    <li
                                                        key={node.id}
                                                        className="flex flex-wrap items-center justify-between gap-2 px-3 py-2"
                                                    >
                                                        <span className="min-w-0">
                                                            <span className="font-medium">
                                                                {serverOf(
                                                                    node.id,
                                                                )?.name ??
                                                                    node.address}
                                                            </span>
                                                            <span className="ml-2 font-mono text-xs text-muted-foreground">
                                                                {node.address}
                                                            </span>
                                                        </span>
                                                        <span className="flex flex-wrap items-center gap-1.5">
                                                            {isMaster && (
                                                                <Badge tone="neutral">
                                                                    {t(
                                                                        "Slots: :count",
                                                                        {
                                                                            count: node.slots,
                                                                        },
                                                                    )}
                                                                </Badge>
                                                            )}
                                                            {master && (
                                                                <Badge tone="neutral">
                                                                    {t(
                                                                        "Replica of :master",
                                                                        {
                                                                            master:
                                                                                serverOf(
                                                                                    master.id,
                                                                                )
                                                                                    ?.name ??
                                                                                master.address,
                                                                        },
                                                                    )}
                                                                </Badge>
                                                            )}
                                                            <Badge
                                                                tone={
                                                                    bad
                                                                        ? "bad"
                                                                        : isMaster
                                                                          ? "ok"
                                                                          : "neutral"
                                                                }
                                                            >
                                                                {bad
                                                                    ? node.flags
                                                                          .filter(
                                                                              (
                                                                                  flag,
                                                                              ) =>
                                                                                  flag !==
                                                                                  "myself",
                                                                          )
                                                                          .join(
                                                                              ", ",
                                                                          ) ||
                                                                      node.link_state
                                                                    : isMaster
                                                                      ? t(
                                                                            "Master",
                                                                        )
                                                                      : t(
                                                                            "Replica",
                                                                        )}
                                                            </Badge>
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                    </ul>
                                </section>
                            );
                        })}

                        <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                            {servers.map((server) => {
                                const metric = server.metric;

                                return (
                                    <li
                                        key={server.key}
                                        className="space-y-4 rounded-xl border bg-card p-4"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span
                                                title={
                                                    statusLabel[server.status]
                                                }
                                                className={cn(
                                                    "size-3 shrink-0 rounded-full",
                                                    statusDot[server.status],
                                                )}
                                            />
                                            <div className="min-w-0 flex-1">
                                                <p className="truncate font-medium">
                                                    {server.name}
                                                </p>
                                                <p className="truncate font-mono text-xs text-muted-foreground">
                                                    {server.via_agent
                                                        ? t("Agent")
                                                        : `${server.host}:${server.port}`}
                                                    {metric?.version &&
                                                        ` · ${metric.version}`}
                                                </p>
                                            </div>
                                            {metric?.role && (
                                                <Badge
                                                    tone={
                                                        metric.role === "master"
                                                            ? "ok"
                                                            : "neutral"
                                                    }
                                                >
                                                    {roleLabel(metric.role)}
                                                </Badge>
                                            )}
                                        </div>

                                        {metric ? (
                                            <>
                                                {metric.memory_percent !==
                                                null ? (
                                                    <UsageBar
                                                        label={t("Memory")}
                                                        value={
                                                            metric.memory_percent
                                                        }
                                                        level={level(
                                                            metric.memory_percent,
                                                        )}
                                                        detail={`${formatBytes(metric.used_memory)} / ${formatBytes(metric.max_memory)}`}
                                                    />
                                                ) : (
                                                    <p className="text-sm">
                                                        <span className="text-muted-foreground">
                                                            {t("Memory")}{" "}
                                                        </span>
                                                        <span className="font-mono">
                                                            {formatBytes(
                                                                metric.used_memory,
                                                            )}
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {" "}
                                                            ({t("no limit")})
                                                        </span>
                                                    </p>
                                                )}
                                                {metric.max_clients > 0 && (
                                                    <UsageBar
                                                        label={t("Clients")}
                                                        value={
                                                            (metric.connected_clients /
                                                                metric.max_clients) *
                                                            100
                                                        }
                                                        level={level(
                                                            (metric.connected_clients /
                                                                metric.max_clients) *
                                                                100,
                                                        )}
                                                        detail={`${metric.connected_clients}/${metric.max_clients}`}
                                                    />
                                                )}
                                                <dl className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                                                    <Stat
                                                        label={t("Commands/s")}
                                                        value={
                                                            metric.commands_per_second !==
                                                            null
                                                                ? String(
                                                                      metric.commands_per_second,
                                                                  )
                                                                : "–"
                                                        }
                                                    />
                                                    <Stat
                                                        label={t("Hit rate")}
                                                        value={
                                                            metric.hit_rate_percent !==
                                                            null
                                                                ? `${metric.hit_rate_percent} %`
                                                                : "–"
                                                        }
                                                    />
                                                    <Stat
                                                        label={t("Keys")}
                                                        value={metric.keys_count.toLocaleString(
                                                            locale,
                                                        )}
                                                    />
                                                    <Stat
                                                        label={t("Uptime")}
                                                        value={formatUptime(
                                                            metric.uptime_seconds,
                                                            t,
                                                        )}
                                                    />
                                                    <Stat
                                                        label={t(
                                                            "Evicted keys",
                                                        )}
                                                        value={metric.evicted_keys_total.toLocaleString(
                                                            locale,
                                                        )}
                                                    />
                                                    <Stat
                                                        label={t(
                                                            "Rejected connections",
                                                        )}
                                                        value={metric.rejected_connections_total.toLocaleString(
                                                            locale,
                                                        )}
                                                    />
                                                </dl>

                                                <div className="flex flex-wrap gap-1.5">
                                                    {metric.role ===
                                                    "master" ? (
                                                        <Badge tone="neutral">
                                                            {t(
                                                                "Replicas: :count",
                                                                {
                                                                    count: metric.connected_replicas,
                                                                },
                                                            )}
                                                        </Badge>
                                                    ) : (
                                                        metric.master && (
                                                            <Badge
                                                                tone={
                                                                    metric.master_link_status ===
                                                                    "up"
                                                                        ? "ok"
                                                                        : "bad"
                                                                }
                                                            >
                                                                {t(
                                                                    "Replicating from :master",
                                                                    {
                                                                        master:
                                                                            serverAt(
                                                                                metric.master,
                                                                            ) ??
                                                                            metric.master,
                                                                    },
                                                                )}
                                                                {" · "}
                                                                {metric.master_link_status ===
                                                                "up"
                                                                    ? t(
                                                                          "link up",
                                                                      )
                                                                    : t(
                                                                          "link down",
                                                                      )}
                                                            </Badge>
                                                        )
                                                    )}
                                                    {metric.persistence_ok !==
                                                        null && (
                                                        <Badge
                                                            tone={
                                                                metric.persistence_ok
                                                                    ? "ok"
                                                                    : "bad"
                                                            }
                                                        >
                                                            {metric.persistence_ok
                                                                ? t(
                                                                      "Saving to disk works",
                                                                  )
                                                                : t(
                                                                      "Saving to disk fails",
                                                                  )}
                                                        </Badge>
                                                    )}
                                                </div>

                                                <p className="text-xs text-muted-foreground">
                                                    {t("Last check :time.", {
                                                        time: timeAgo(
                                                            metric.collected_at,
                                                            generated_at,
                                                            locale,
                                                        ),
                                                    })}
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">
                                                {server.last_checked_at
                                                    ? t(
                                                          "No data yet. Last check :time.",
                                                          {
                                                              time: timeAgo(
                                                                  server.last_checked_at,
                                                                  generated_at,
                                                                  locale,
                                                              ),
                                                          },
                                                      )
                                                    : t(
                                                          "Waiting for the first check…",
                                                      )}
                                            </p>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}
            </div>
        </>
    );
}

Redis.layout = {
    breadcrumbs: [{ title: "Redis", href: redisIndex() }],
};
