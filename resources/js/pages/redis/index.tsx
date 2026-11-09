import { Head, Link, router, usePoll } from "@inertiajs/react";
import {
    AlertTriangle,
    ArrowLeftRight,
    CheckCircle2,
    MemoryStick,
    Plus,
} from "lucide-react";
import { useState } from "react";
import RedisSwitchoverController from "@/actions/App/Http/Controllers/RedisSwitchoverController";
import ServerController from "@/actions/App/Http/Controllers/Servers/ServerController";
import UsageBar from "@/components/dashboard/usage-bar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogTitle,
} from "@/components/ui/dialog";
import { useTranslation } from "@/hooks/use-translation";
import { formatBytes, formatUptime, timeAgo } from "@/lib/dashboard";
import { cn } from "@/lib/utils";
import { index as redisIndex } from "@/routes/redis";
import { index as teamsIndex } from "@/routes/teams";
import type { RedisSummary, SentinelGroup, ServerStatus } from "@/types";

type Props = {
    team: { id: number; name: string } | null;
    canManage: boolean;
    servers: RedisSummary[];
    sentinels: SentinelGroup[];
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

function SwitchoverButton({
    group,
    master,
}: {
    group: SentinelGroup;
    master: string;
}) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const start = () => {
        router.post(
            RedisSwitchoverController.url(group.id),
            {},
            {
                preserveScroll: true,
                onStart: () => setProcessing(true),
                onFinish: () => {
                    setProcessing(false);
                    setOpen(false);
                },
            },
        );
    };

    return (
        <>
            <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(true)}
                data-test="switchover-button"
            >
                <ArrowLeftRight className="size-4" />
                {t("Switchover")}
            </Button>
            <Dialog
                open={open}
                onOpenChange={(value) => !processing && setOpen(value)}
            >
                <DialogContent>
                    <DialogTitle>
                        {t("Switch the master of :name?", {
                            name: group.master_name,
                        })}
                    </DialogTitle>
                    <DialogDescription>
                        {t(
                            "Sentinel promotes a healthy replica to the new master and the current master :master becomes its replica. Clients are disconnected for a few seconds and writes in that time can fail. Sentinel checks everything again before it starts.",
                            { master },
                        )}
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            disabled={processing}
                            onClick={() => setOpen(false)}
                        >
                            {t("Cancel")}
                        </Button>
                        <Button
                            type="button"
                            disabled={processing}
                            onClick={start}
                            data-test="switchover-confirm"
                        >
                            {t("Switch the master")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default function Redis({
    team,
    canManage,
    servers,
    sentinels,
    generated_at,
}: Props) {
    const { t, locale } = useTranslation();

    usePoll(30000, { only: ["servers", "sentinels", "generated_at"] });

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

                {servers.length === 0 && sentinels.length === 0 ? (
                    <div className="rounded-xl border border-dashed bg-card p-10 text-center">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-muted">
                            <MemoryStick className="size-7 text-muted-foreground" />
                        </div>
                        <p className="font-medium">
                            {t("No Redis servers yet")}
                        </p>
                        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
                            {t(
                                "Add a server and choose the type Redis server.",
                            )}
                        </p>
                    </div>
                ) : (
                    <>
                        {sentinels.map((group) => {
                            const reports = group.members.map(
                                (member) => member.sentinel,
                            );
                            const problems: string[] = [];

                            if (!group.agree) {
                                problems.push(
                                    t(
                                        "The Sentinels disagree about which server is the master.",
                                    ),
                                );
                            }

                            group.members.forEach((member) => {
                                const report = member.sentinel;

                                if (report === null) {
                                    if (member.status === "offline") {
                                        problems.push(
                                            t("Server :server is offline.", {
                                                server: member.server_name,
                                            }),
                                        );
                                    }

                                    return;
                                }

                                if (!report.reachable) {
                                    problems.push(
                                        t(
                                            "Sentinel on :server does not answer: :error",
                                            {
                                                server: member.server_name,
                                                error: report.error,
                                            },
                                        ),
                                    );

                                    return;
                                }

                                if (report.master_down) {
                                    problems.push(
                                        t(
                                            "Sentinel on :server reports the master as down.",
                                            { server: member.server_name },
                                        ),
                                    );
                                }

                                if (!report.quorum_ok) {
                                    problems.push(
                                        t(
                                            "Sentinel on :server cannot reach the quorum: :message",
                                            {
                                                server: member.server_name,
                                                message: report.quorum_message,
                                            },
                                        ),
                                    );
                                }
                            });

                            const waiting = reports.every(
                                (report) => report === null,
                            );
                            const failover = reports.some(
                                (report) =>
                                    report?.reachable &&
                                    report.failover_in_progress,
                            );
                            const healthy = !waiting && problems.length === 0;
                            const firstReport = reports.find(
                                (report) => report?.reachable,
                            );
                            const hasReplica =
                                firstReport?.reachable === true &&
                                firstReport.replicas.length > 0;
                            const master =
                                hasReplica && firstReport?.reachable
                                    ? (serverAt(
                                          `${firstReport.master_ip}:${firstReport.master_port}`,
                                      ) ??
                                      `${firstReport.master_ip}:${firstReport.master_port}`)
                                    : null;

                            return (
                                <section
                                    key={group.members
                                        .map((m) => m.server_id)
                                        .join("-")}
                                    className="space-y-4 rounded-xl border bg-card p-4"
                                    data-test="sentinel-group"
                                >
                                    <div className="flex flex-wrap items-center gap-3">
                                        {healthy ? (
                                            <CheckCircle2 className="size-5 text-emerald-500" />
                                        ) : (
                                            <AlertTriangle
                                                className={cn(
                                                    "size-5",
                                                    waiting
                                                        ? "text-zinc-400"
                                                        : "text-red-500",
                                                )}
                                            />
                                        )}
                                        <div className="min-w-0 flex-1">
                                            <h2 className="font-medium">
                                                {t("Redis Sentinel")} ·{" "}
                                                {group.master_name}
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                {group.members
                                                    .map((m) => m.server_name)
                                                    .join(" · ")}
                                            </p>
                                        </div>
                                        {canManage &&
                                            healthy &&
                                            !failover &&
                                            master !== null && (
                                                <SwitchoverButton
                                                    group={group}
                                                    master={master}
                                                />
                                            )}
                                        {failover && (
                                            <Badge tone="bad">
                                                {t("Failover in progress")}
                                            </Badge>
                                        )}
                                        <Badge
                                            tone={
                                                waiting
                                                    ? "neutral"
                                                    : healthy
                                                      ? "ok"
                                                      : "bad"
                                            }
                                        >
                                            {waiting
                                                ? t(
                                                      "Waiting for the first check…",
                                                  )
                                                : healthy
                                                  ? t("Healthy")
                                                  : t("Needs attention")}
                                        </Badge>
                                    </div>

                                    {problems.length > 0 && (
                                        <ul className="space-y-1 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-700 dark:text-red-300">
                                            {problems.map((problem) => (
                                                <li key={problem}>{problem}</li>
                                            ))}
                                        </ul>
                                    )}

                                    <div className="grid gap-3 md:grid-cols-2">
                                        {group.members.map((member) => {
                                            const report = member.sentinel;

                                            return (
                                                <div
                                                    key={member.server_id}
                                                    className="space-y-3 rounded-lg border p-3"
                                                >
                                                    <p className="text-sm font-medium">
                                                        {t(
                                                            "Sentinel on :server",
                                                            {
                                                                server: member.server_name,
                                                            },
                                                        )}
                                                        <span className="ml-2 font-mono text-xs text-muted-foreground">
                                                            :{member.port}
                                                        </span>
                                                        {member.type ===
                                                            "sentinel" && (
                                                            <span className="ml-2 text-xs font-normal text-muted-foreground">
                                                                {t(
                                                                    "Sentinel only",
                                                                )}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {report === null ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            {t(
                                                                "Waiting for the first check…",
                                                            )}
                                                        </p>
                                                    ) : !report.reachable ? (
                                                        <p className="text-sm text-red-600 dark:text-red-400">
                                                            {report.error}
                                                        </p>
                                                    ) : (
                                                        <>
                                                            <dl className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                                                <Stat
                                                                    label={t(
                                                                        "Master",
                                                                    )}
                                                                    value={
                                                                        serverAt(
                                                                            `${report.master_ip}:${report.master_port}`,
                                                                        ) ??
                                                                        `${report.master_ip}:${report.master_port}`
                                                                    }
                                                                />
                                                                <Stat
                                                                    label={t(
                                                                        "Quorum",
                                                                    )}
                                                                    value={`${report.quorum ?? "–"}`}
                                                                />
                                                                <Stat
                                                                    label={t(
                                                                        "Sentinels",
                                                                    )}
                                                                    value={`${report.known_sentinels}`}
                                                                />
                                                                <Stat
                                                                    label={t(
                                                                        "Replicas",
                                                                    )}
                                                                    value={`${report.replicas.length}`}
                                                                />
                                                            </dl>
                                                            <div className="flex flex-wrap gap-1.5">
                                                                {report.master_flags.map(
                                                                    (flag) => (
                                                                        <Badge
                                                                            key={
                                                                                flag
                                                                            }
                                                                            tone={
                                                                                flag ===
                                                                                "master"
                                                                                    ? "ok"
                                                                                    : "bad"
                                                                            }
                                                                        >
                                                                            {
                                                                                flag
                                                                            }
                                                                        </Badge>
                                                                    ),
                                                                )}
                                                                <Badge
                                                                    tone={
                                                                        report.quorum_ok
                                                                            ? "ok"
                                                                            : "bad"
                                                                    }
                                                                >
                                                                    {report.quorum_ok
                                                                        ? t(
                                                                              "Quorum reachable",
                                                                          )
                                                                        : t(
                                                                              "No quorum",
                                                                          )}
                                                                </Badge>
                                                            </div>
                                                            {report.replicas
                                                                .length > 0 && (
                                                                <ul className="space-y-1 text-xs">
                                                                    {report.replicas.map(
                                                                        (
                                                                            replica,
                                                                        ) => (
                                                                            <li
                                                                                key={`${replica.ip}:${replica.port}`}
                                                                                className="flex flex-wrap items-center justify-between gap-2"
                                                                            >
                                                                                <span className="font-mono">
                                                                                    {serverAt(
                                                                                        `${replica.ip}:${replica.port}`,
                                                                                    ) ??
                                                                                        `${replica.ip}:${replica.port}`}
                                                                                </span>
                                                                                <Badge
                                                                                    tone={
                                                                                        replica.flags.some(
                                                                                            (
                                                                                                flag,
                                                                                            ) =>
                                                                                                flag.endsWith(
                                                                                                    "down",
                                                                                                ),
                                                                                        ) ||
                                                                                        replica.link_status ===
                                                                                            "err"
                                                                                            ? "bad"
                                                                                            : "ok"
                                                                                    }
                                                                                >
                                                                                    {replica.flags.join(
                                                                                        ", ",
                                                                                    )}
                                                                                    {replica.link_status
                                                                                        ? ` · ${replica.link_status}`
                                                                                        : ""}
                                                                                </Badge>
                                                                            </li>
                                                                        ),
                                                                    )}
                                                                </ul>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                </section>
                            );
                        })}

                        <ul className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
                            {servers.map((server) => {
                                const metric = server.metric;

                                return (
                                    <li
                                        key={server.id}
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
                                                    {server.host}:{server.port}
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
