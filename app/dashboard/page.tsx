import { Container } from "@/components/container";
import { Icon } from "@/components/icon";
import { StatusCode } from "@/components/status-badge";
import { LiveClock } from "@/components/live-clock";
import { AddMonitorButton } from "@/components/actions/add-monitor-button";
import { dashboardMonitors, incidents, uptimePct } from "@/lib/data";

function StatCard({
  label,
  value,
  icon,
  iconClass,
  glow,
}: {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
  glow?: string;
}) {
  return (
    <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-card-border bg-card p-6">
      <div className="relative z-10 mb-4 flex items-start justify-between">
        <span className="font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
          {label}
        </span>
        <Icon name={icon} filled size={20} className={iconClass} />
      </div>
      <div className="relative z-10 text-display-lg-mobile text-on-surface">{value}</div>
      {glow && <div className={`pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rounded-full blur-3xl ${glow}`} />}
    </div>
  );
}

export default function DashboardPage() {
  const overallHistory = dashboardMonitors.map((m) => m.history).flat();
  const overall = uptimePct(overallHistory);

  const anyDown = dashboardMonitors.some((m) => m.status === "down");
  const anyPartial = dashboardMonitors.some((m) => m.status === "degraded");
  const banner = anyDown
    ? {
        icon: "error",
        title: "Service disruption",
        sub: "One or more monitors are down right now.",
        iconClass: "text-error",
        border: "border-error/20",
        bg: "bg-error-container/10",
      }
    : anyPartial
      ? {
          icon: "warning",
          title: "Partially degraded",
          sub: "Some monitors are experiencing slow responses.",
          iconClass: "text-tertiary",
          border: "border-tertiary/20",
          bg: "bg-tertiary-container/10",
        }
      : {
          icon: "check_circle",
          title: "All systems operational",
          sub: "No incidents reported in the last 24 hours.",
          iconClass: "text-secondary",
          border: "border-secondary/20",
          bg: "bg-secondary-container/10",
        };

  return (
    <div className="flex flex-col gap-12 p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <header className="flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Dashboard</h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">
              Overview of your services and monitors.
            </p>
          </div>
          <AddMonitorButton />
        </header>

        {/* Overall status banner */}
        <section
          className={`mt-10 flex flex-col gap-4 rounded-xl border p-gutter md:flex-row md:items-center md:justify-between ${banner.border} ${banner.bg}`}
        >
          <div className="flex items-center gap-4">
            <Icon name={banner.icon} filled size={32} className={`shrink-0 ${banner.iconClass}`} />
            <div>
              <h2 className={`text-headline-md ${banner.iconClass}`}>{banner.title}</h2>
              <p className="mt-1 text-body-sm text-on-surface-variant">{banner.sub}</p>
            </div>
          </div>
          <LiveClock />
        </section>

        <section className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          <StatCard
            label="Overall Uptime"
            value={overall}
            icon="check_circle"
            iconClass="text-secondary"
            glow="bg-secondary/10"
          />
          <StatCard
            label="Active Monitors"
            value={String(dashboardMonitors.length)}
            icon="analytics"
            iconClass="text-primary"
          />
          <StatCard
            label="Incidents (30 days)"
            value="2"
            icon="warning"
            iconClass="text-error"
            glow="bg-error/10"
          />
        </section>

        <section className="mt-10">
          <h2 className="border-b border-card-border pb-4 text-headline-md text-on-surface">
            Monitor Status
          </h2>
          <div className="mt-4 overflow-x-auto rounded-xl border border-card-border bg-card">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">NAME</th>
                  <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">STATUS</th>
                  <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">RESPONSE</th>
                  <th className="p-4 text-right font-mono text-code-label font-normal text-on-surface-variant">
                    HISTORY (30 DAYS)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {dashboardMonitors.map((m) => (
                  <tr key={m.id} className="transition-colors hover:bg-surface-container-low/50">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded border border-card-border bg-surface-container">
                          <Icon name={kindIcon(m.kind)} size={16} className="text-on-surface-variant" />
                        </div>
                        <span className="text-body-lg font-medium text-on-surface">{m.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <StatusCode status={m.status} />
                    </td>
                    <td className="p-4 font-mono text-code-label text-on-surface-variant">
                      {m.latencyMs !== null ? `${m.latencyMs}ms` : "—"}
                    </td>
                    <td className="p-4">
                      <div className="flex h-6 items-center justify-end gap-[2px]">
                        {m.history.slice(-30).map((day, i) => (
                          <div
                            key={i}
                            className={`w-1.5 rounded-sm ${
                              day === "up"
                                ? "bg-up"
                                : day === "down"
                                  ? "bg-down"
                                  : day === "partial"
                                    ? "bg-tertiary"
                                    : "bg-surface-variant"
                            }`}
                            style={{ height: "100%", opacity: day === "down" ? 0.8 : 1 }}
                          />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Recent incidents */}
        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-headline-md text-on-surface">Recent Incidents</h2>
            <a href="/dashboard/incidents" className="font-mono text-code-label text-primary hover:underline">
              View all →
            </a>
          </div>
          <div className="flex flex-col divide-y divide-card-border rounded-xl border border-card-border bg-card">
            {incidents.slice(0, 3).map((inc) => {
              const latest = inc.updates[0];
              const danger = latest.tone === "danger";
              return (
                <div key={inc.id} className="flex items-center justify-between gap-4 p-4 transition-colors hover:bg-surface-container-low">
                  <div className="flex items-center gap-4">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded ${
                        inc.resolved ? "bg-up/10 text-up" : "bg-error-container/25 text-error"
                      }`}
                    >
                      <Icon name={inc.resolved ? "check_circle" : "warning"} filled size={18} />
                    </div>
                    <div>
                      <p className="text-body-lg text-on-surface">{inc.title}</p>
                      <p className="font-mono text-code-label text-on-surface-variant">
                        {inc.dateLabel} · {inc.impacted.join(", ")}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`hidden rounded px-2 py-0.5 font-mono text-code-label sm:inline-block ${
                      danger ? "bg-error-container/25 text-error" : "bg-up/15 text-up"
                    }`}
                  >
                    {inc.resolved ? "RESOLVED" : "IN PROGRESS"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </Container>
    </div>
  );
}

function kindIcon(kind: string): string {
  switch (kind) {
    case "api":
      return "api";
    case "database":
      return "database";
    case "dashboard":
      return "monitoring";
    default:
      return "language";
  }
}
