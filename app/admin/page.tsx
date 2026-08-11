import { Icon } from "@/components/icon";
import { getAdminAnalytics } from "@/lib/admin-analytics";
import { ClearHistory } from "@/components/admin/clear-history";

export const dynamic = "force-dynamic";

function StatCard({
  label,
  value,
  icon,
  iconClass,
}: {
  label: string;
  value: string;
  icon: string;
  iconClass: string;
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
    </div>
  );
}

const STATUS_TONE: Record<string, string> = {
  finished: "bg-up/15 text-up",
  waiting: "bg-surface-variant text-on-surface",
  confirming: "bg-tertiary/15 text-tertiary",
  sending: "bg-tertiary/15 text-tertiary",
  partially_paid: "bg-tertiary/15 text-tertiary",
  failed: "bg-error-container/25 text-error",
  expired: "bg-error-container/25 text-error",
};

function statusBadge(status: string) {
  return `rounded px-2 py-0.5 font-mono text-code-label ${STATUS_TONE[status] ?? "bg-surface-variant text-on-surface-variant"}`;
}

function fmtMoney(n: number) {
  return `$${n.toFixed(2)}`;
}

function fmtDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

export default async function AdminPage() {
  const a = await getAdminAnalytics();
  const maxDay = Math.max(1, ...a.visitsByDay.map((d) => d.count));

  return (
    <div className="flex flex-col gap-12">
      <header>
        <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Analytics</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Purchases, site traffic and active users.
        </p>
      </header>

      {/* Purchases */}
      <section>
        <h2 className="mb-4 border-b border-card-border pb-3 text-headline-md text-on-surface">
          Purchases
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Total revenue" value={fmtMoney(a.totalRevenue)} icon="payments" iconClass="text-secondary" />
          <StatCard label="Revenue (30 days)" value={fmtMoney(a.revenue30)} icon="trending_up" iconClass="text-primary" />
          <StatCard label="Paid purchases" value={String(a.paidCount)} icon="receipt_long" iconClass="text-on-surface-variant" />
          <StatCard label="Yearly / Monthly" value={`${a.paidYearly} / ${a.paidMonthly}`} icon="calendar_month" iconClass="text-tertiary" />
        </div>

        <div className="mt-6 overflow-x-auto rounded-xl border border-card-border bg-card">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-card-border">
                <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">DATE</th>
                <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">WORKSPACE</th>
                <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">EMAIL</th>
                <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">PLAN</th>
                <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">AMOUNT</th>
                <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {a.recentPayments.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-surface-container-low/50">
                  <td className="p-4 font-mono text-code-label text-on-surface-variant">{fmtDate(p.date)}</td>
                  <td className="p-4 text-body-sm text-on-surface">{p.workspace}</td>
                  <td className="p-4 font-mono text-code-label text-on-surface-variant">{p.email}</td>
                  <td className="p-4">
                    <span className={`rounded px-2 py-0.5 font-mono text-code-label ${p.plan === "yearly" ? "bg-secondary/15 text-secondary" : "bg-primary/10 text-primary"}`}>
                      {p.plan.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 font-mono text-code-label text-on-surface">{fmtMoney(p.amount)}</td>
                  <td className="p-4">
                    <span className={statusBadge(p.status)}>{p.status}</span>
                  </td>
                </tr>
              ))}
              {a.recentPayments.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center font-mono text-code-label text-on-surface-variant">
                    No payments yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Visits */}
      <section>
        <h2 className="mb-4 border-b border-card-border pb-3 text-headline-md text-on-surface">
          Site visits
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard label="Total visits" value={String(a.totalVisits)} icon="visibility" iconClass="text-primary" />
          <StatCard label="Visits (30 days)" value={String(a.visits30)} icon="trending_up" iconClass="text-secondary" />
          <StatCard label="Workspaces" value={String(a.orgCount)} icon="workspaces" iconClass="text-on-surface-variant" />
        </div>

        <div className="mt-6 rounded-xl border border-card-border bg-card p-6">
          <p className="mb-4 font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
            Visits per day (14 days)
          </p>
          <div className="flex h-28 items-end gap-1.5">
            {a.visitsByDay.map((d) => (
              <div key={d.label} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <span className="font-mono text-code-label text-on-surface-variant">{d.count > 0 ? d.count : ""}</span>
                <div
                  className={`w-full rounded-t-sm ${d.count > 0 ? "bg-primary" : "bg-surface-variant"}`}
                  style={{ height: `${d.count > 0 ? Math.max(8, (d.count / maxDay) * 100) : 4}%` }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between font-mono text-code-label text-on-surface-variant">
            <span>{a.visitsByDay[0]?.label}</span>
            <span>{a.visitsByDay[a.visitsByDay.length - 1]?.label}</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-card-border bg-card p-6">
            <p className="mb-4 font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
              Top pages (30 days)
            </p>
            <div className="flex flex-col gap-2.5">
              {a.topPaths.map((item) => (
                <div key={item.path} className="flex items-center justify-between gap-4">
                  <span className="truncate font-mono text-code-label text-on-surface">{item.path}</span>
                  <span className="font-mono text-code-label text-on-surface-variant">{item.count}</span>
                </div>
              ))}
              {a.topPaths.length === 0 && (
                <p className="font-mono text-code-label text-on-surface-variant">No visits yet.</p>
              )}
            </div>
          </div>
          <div className="rounded-xl border border-card-border bg-card p-6">
            <p className="mb-4 font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
              Payment statuses
            </p>
            <div className="flex flex-col gap-2.5">
              {a.statusCounts.map((item) => (
                <div key={item.status} className="flex items-center justify-between gap-4">
                  <span className="font-mono text-code-label text-on-surface">{item.status}</span>
                  <span className="font-mono text-code-label text-on-surface-variant">{item.count}</span>
                </div>
              ))}
              {a.statusCounts.length === 0 && (
                <p className="font-mono text-code-label text-on-surface-variant">No payments yet.</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Active users */}
      <section>
        <h2 className="mb-4 border-b border-card-border pb-3 text-headline-md text-on-surface">
          Active users
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          <StatCard label="Active (24h)" value={String(a.active24h)} icon="person" iconClass="text-primary" />
          <StatCard label="Active (7 days)" value={String(a.active7d)} icon="group" iconClass="text-secondary" />
          <StatCard label="Active (30 days)" value={String(a.active30d)} icon="groups" iconClass="text-tertiary" />
        </div>
      </section>

      {/* Data cleanup */}
      <ClearHistory />
    </div>
  );
}
