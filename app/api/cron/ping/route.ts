import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";
import { pingUrl } from "@/lib/ping";
import { notifySubscribers } from "@/lib/notify";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("x-cron-secret") === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*")
    .eq("org_id", DEFAULT_ORG_ID)
    .eq("paused", false);

  let checked = 0;
  let downCount = 0;
  let created = 0;
  let resolved = 0;
  const newIncidents: string[] = [];

  for (const monitor of monitors ?? []) {
    const result = await pingUrl(monitor.url);
    checked += 1;
    if (result.status !== "up") downCount += 1;

    await supabase.from("checks").insert({
      monitor_id: monitor.id,
      status: result.status,
      latency_ms: result.latencyMs,
      response_code: result.responseCode,
    });

    // Auto-create incident on transition to down
    if (result.status === "down" && monitor.status !== "down") {
      const { data: inc } = await supabase
        .from("incidents")
        .insert({
          org_id: DEFAULT_ORG_ID,
          title: `${monitor.name} is down`,
          status: "identified",
          impact: "major",
          started_at: now,
        })
        .select()
        .single();

      if (inc) {
        created += 1;
        newIncidents.push(inc.title);
        await supabase.from("incident_monitors").insert({ incident_id: inc.id, monitor_id: monitor.id });
        await supabase.from("incident_updates").insert({
          incident_id: inc.id,
          tone: "danger",
          body: `${monitor.name} is unreachable: ${result.error ?? `HTTP ${result.responseCode}`}`,
        });
      }
    }

    // Auto-resolve open incident on recovery
    if (result.status === "up" && monitor.status !== "up") {
      const { data: links } = await supabase
        .from("incident_monitors")
        .select("incident_id")
        .eq("monitor_id", monitor.id);

      if (links?.length) {
        const { data: openInc } = await supabase
          .from("incidents")
          .select("id")
          .in(
            "id",
            links.map((l) => l.incident_id)
          )
          .in("status", ["investigating", "identified", "monitoring"])
          .limit(1);

        const openId = openInc?.[0]?.id;
        if (openId) {
          resolved += 1;
          await supabase.from("incidents").update({ status: "resolved", resolved_at: now }).eq("id", openId);
          await supabase.from("incident_updates").insert({
            incident_id: openId,
            tone: "success",
            body: `${monitor.name} is back online.`,
          });
        }
      }
    }

    await supabase
      .from("monitors")
      .update({ status: result.status, latency_ms: result.latencyMs, updated_at: now })
      .eq("id", monitor.id);
  }

  if (newIncidents.length > 0) {
    await notifySubscribers("New incidents", newIncidents.join(", "));
  }

  return NextResponse.json({ ok: true, checked, down: downCount, created, resolved });
}
