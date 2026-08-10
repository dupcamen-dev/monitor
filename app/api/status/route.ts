import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";

const DAYS = 90;
const DAY_MS = 24 * 60 * 60 * 1000;

type DayState = "up" | "degraded" | "down" | "nodata";

export async function GET() {
  const supabase = createAdminClient();

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*")
    .eq("org_id", DEFAULT_ORG_ID)
    .order("created_at", { ascending: true });

  const since = new Date(Date.now() - DAYS * DAY_MS).toISOString();
  const { data: checks } = await supabase
    .from("checks")
    .select("monitor_id, checked_at, status")
    .gte("checked_at", since);

  const historyDays: string[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    historyDays.push(new Date(Date.now() - i * DAY_MS).toISOString().slice(0, 10));
  }

  const byMonitor = new Map<string, Map<string, DayState>>();
  for (const c of checks ?? []) {
    const day = c.checked_at.slice(0, 10);
    const status: DayState = c.status === "down" ? "down" : c.status === "degraded" ? "degraded" : "up";
    const map = byMonitor.get(c.monitor_id) ?? new Map<string, DayState>();
    const current = map.get(day);
    if (!current || status === "down" || (status === "degraded" && current === "up")) {
      map.set(day, status);
    }
    byMonitor.set(c.monitor_id, map);
  }

  const monitorsRows = (monitors ?? []).map((m) => {
    const map = byMonitor.get(m.id) ?? new Map<string, DayState>();
    const history = historyDays.map((day) => map.get(day) ?? "nodata");
    const withData = history.filter((s) => s !== "nodata");
    const up = withData.filter((s) => s === "up").length;
    const uptime90 = withData.length > 0 ? `${Math.round((up / withData.length) * 1000) / 10}%` : "—";

    return {
      id: m.id,
      name: m.name,
      kind: m.kind,
      url: m.url,
      status: m.status,
      latency_ms: m.latency_ms,
      interval_sec: m.interval_sec,
      paused: m.paused,
      uptime90,
      history,
    };
  });

  const overall = monitorsRows.some((m) => m.status === "down")
    ? "disruption"
    : monitorsRows.some((m) => m.status === "degraded")
      ? "degraded"
      : "operational";

  const { data: incidents } = await supabase
    .from("incidents")
    .select("*, updates:incident_updates(*), monitors:incident_monitors(monitor_id)")
    .eq("org_id", DEFAULT_ORG_ID)
    .order("started_at", { ascending: false });

  return NextResponse.json({
    overall,
    monitors: monitorsRows,
    incidents: incidents ?? [],
    generated_at: new Date().toISOString(),
  });
}
