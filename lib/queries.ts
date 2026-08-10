import { createAdminClient } from "@/lib/supabase";
import { secToInterval } from "@/lib/interval";
import type { Monitor, Incident, DayState, IncidentUpdate, UpdateTone } from "@/lib/data";

const DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

/* ---------- data access ---------- */

type DbMonitor = {
  id: string;
  name: string;
  kind: string;
  url: string;
  status: string;
  latency_ms: number | null;
  interval_sec: number;
  paused: boolean;
  created_at: string;
};

export type OrgPlan = "free" | "paid" | "yearly";

export const PLAN_YEAR_MS = 365 * 24 * 60 * 60 * 1000;

export function normalizePlan(value: unknown): OrgPlan {
  return value === "paid" || value === "yearly" ? value : "free";
}

export function planCheckIntervalSec(plan: OrgPlan): number {
  return plan === "free" ? 3600 : 300;
}

export interface OrgPlanInfo {
  plan: OrgPlan;
  expiresAt: string | null;
}

export async function getOrgPlanInfo(orgId: string): Promise<OrgPlanInfo> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("plan, plan_expires_at")
    .eq("id", orgId)
    .single();

  if (data?.plan === "yearly") {
    const expires = data.plan_expires_at ? new Date(data.plan_expires_at).getTime() : 0;
    if (expires && expires < Date.now()) {
      await supabase
        .from("organizations")
        .update({ plan: "free", plan_expires_at: null })
        .eq("id", orgId);
      return { plan: "free", expiresAt: null };
    }
    return { plan: "yearly", expiresAt: data.plan_expires_at ?? null };
  }
  return { plan: normalizePlan(data?.plan), expiresAt: data?.plan_expires_at ?? null };
}

export async function getOrgPlan(orgId: string): Promise<OrgPlan> {
  return (await getOrgPlanInfo(orgId)).plan;
}

async function fetchMonitorRows(orgId: string): Promise<DbMonitor[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: true });
  if (error) return [];
  return data ?? [];
}

function aggregateByDay(checks: { monitor_id: string; checked_at: string; status: string }[]) {
  const byMonitor = new Map<string, Map<string, DayState>>();
  for (const c of checks ?? []) {
    const day = c.checked_at.slice(0, 10);
    const status: DayState = c.status === "down" ? "down" : c.status === "degraded" ? "partial" : "up";
    const map = byMonitor.get(c.monitor_id) ?? new Map<string, DayState>();
    const current = map.get(day);
    if (!current || status === "down" || (status === "partial" && current === "up")) {
      map.set(day, status);
    }
    byMonitor.set(c.monitor_id, map);
  }
  return byMonitor;
}

async function fetchHistoryByMonitor(): Promise<Map<string, Map<string, DayState>>> {
  const supabase = createAdminClient();
  const since = new Date(Date.now() - DAYS * DAY_MS).toISOString();
  const { data } = await supabase
    .from("checks")
    .select("monitor_id, checked_at, status")
    .gte("checked_at", since);
  return aggregateByDay(data ?? []);
}

const historyDays: string[] = [];
for (let i = DAYS - 1; i >= 0; i--) {
  historyDays.push(new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10));
}

function buildMonitor(
  r: DbMonitor,
  map: Map<string, DayState>,
  cadenceSec: number
): Monitor {
  const history = historyDays.map((day) => map.get(day) ?? "nodata");
  const withData = history.filter((s) => s !== "nodata");
  const uptime = (slice: DayState[]) => {
    if (slice.length === 0) return "—";
    const up = slice.filter((s) => s === "up").length;
    return `${Math.round((up / slice.length) * 1000) / 10}%`;
  };

  return {
    id: r.id,
    name: r.name,
    kind: r.kind as Monitor["kind"],
    url: r.url,
    status: (["up", "degraded", "down"].includes(r.status) ? r.status : "up") as Monitor["status"],
    latencyMs: r.latency_ms,
    uptime30: uptime(withData.slice(-30)),
    uptime90: uptime(withData),
    history,
    interval: secToInterval(cadenceSec),
    paused: r.paused,
  };
}

export async function getMonitors(orgId: string): Promise<Monitor[]> {
  const [rows, byMonitor, plan] = await Promise.all([fetchMonitorRows(orgId), fetchHistoryByMonitor(), getOrgPlan(orgId)]);
  const cadenceSec = planCheckIntervalSec(plan);
  return rows.map((r) => buildMonitor(r, byMonitor.get(r.id) ?? new Map(), cadenceSec));
}

export async function getMonitorOptions(orgId: string): Promise<{ id: string; name: string }[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("monitors")
    .select("id, name")
    .eq("org_id", orgId)
    .order("name", { ascending: true });
  return data ?? [];
}

/* ---------- incidents ---------- */

type DbIncident = {
  id: string;
  title: string;
  status: string;
  impact: string;
  started_at: string;
  resolved_at: string | null;
  updates?: { tone: string; body: string; created_at: string }[];
  monitors?: { monitor_id: string }[];
};

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(d);
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export async function getIncidents(orgId: string): Promise<Incident[]> {
  const supabase = createAdminClient();

  const { data } = await supabase
    .from("incidents")
    .select("*, updates:incident_updates(*), monitors:incident_monitors(monitor_id)")
    .eq("org_id", orgId)
    .order("started_at", { ascending: false });

  const { data: monitorRows } = await supabase
    .from("monitors")
    .select("id, name")
    .eq("org_id", orgId);
  const nameById = new Map((monitorRows ?? []).map((m) => [m.id, m.name]));

  return (data ?? []).map((inc: DbIncident) => {
    const updates: IncidentUpdate[] = (inc.updates ?? [])
      .slice()
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
      .map((u) => {
        const tone: UpdateTone =
          u.tone === "danger" ? "danger" : u.tone === "success" ? "success" : "neutral";
        const label: IncidentUpdate["label"] =
          tone === "danger" ? "Investigating" : tone === "success" ? "Resolved" : "Update";
        return { time: formatTime(u.created_at), label, tone, message: u.body };
      });

    return {
      id: inc.id,
      title: inc.title,
      dateLabel: formatDate(new Date(inc.started_at)),
      date: inc.started_at,
      impacted: (inc.monitors ?? []).map((m) => nameById.get(m.monitor_id) ?? "Unknown"),
      resolved: inc.status === "resolved",
      updates,
    };
  });
}

/* ---------- combined status ---------- */

export type OverallStatus = "operational" | "degraded" | "disruption";

export interface StatusData {
  overall: OverallStatus;
  monitors: Monitor[];
  incidents: Incident[];
  incidents30: number;
  generated_at: string;
}

export async function getStatus(orgId: string): Promise<StatusData> {
  const [monitors, incidents] = await Promise.all([getMonitors(orgId), getIncidents(orgId)]);

  const overall: OverallStatus = monitors.some((m) => m.status === "down")
    ? "disruption"
    : monitors.some((m) => m.status === "degraded")
      ? "degraded"
      : "operational";

  const cutoff = Date.now() - 30 * DAY_MS;
  const incidents30 = incidents.filter((i) => new Date(i.date).getTime() >= cutoff).length;

  return { overall, monitors, incidents, incidents30, generated_at: new Date().toISOString() };
}
