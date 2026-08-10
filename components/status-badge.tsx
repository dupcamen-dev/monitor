import type { MonitorStatus } from "@/lib/data";

const config: Record<MonitorStatus, { label: string; dot: string; text: string }> = {
  up: { label: "Operational", dot: "bg-up shadow-[0_0_8px_rgba(16,185,129,0.5)]", text: "text-up" },
  degraded: { label: "Degraded", dot: "bg-tertiary shadow-[0_0_8px_rgba(255,179,173,0.5)]", text: "text-tertiary" },
  down: { label: "Down", dot: "bg-down shadow-[0_0_8px_rgba(239,68,68,0.5)]", text: "text-down" },
};

export function StatusPill({ status }: { status: MonitorStatus }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-2 text-body-sm">
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      <span className={c.text}>{c.label}</span>
    </span>
  );
}

export function StatusCode({ status }: { status: MonitorStatus }) {
  const c = config[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${c.dot}`} />
      <span className={`font-mono text-code-label ${c.text}`}>{status === "down" ? "DOWN" : status === "degraded" ? "DEGRADED" : "UP"}</span>
    </span>
  );
}
