import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { pingUrl } from "@/lib/ping";
import { notifySubscribers } from "@/lib/notify";
import { deliverWebhook } from "@/lib/webhooks";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const authorization = request.headers.get("authorization") ?? "";
  const bearer = authorization.startsWith("Bearer ") ? authorization.slice(7) : "";
  const custom = request.headers.get("x-cron-secret") ?? "";
  return bearer === secret || custom === secret;
}

export async function POST(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const now = new Date().toISOString();
  const nowMs = Date.now();

  const { data: orgs } = await supabase.from("organizations").select("id, plan, plan_expires_at");
  const checkEveryMs = new Map<string, number>();
  const expiredOrgs: string[] = [];
  for (const org of orgs ?? []) {
    let plan = org.plan;
    if (plan === "yearly" || plan === "paid") {
      const expires = org.plan_expires_at ? new Date(org.plan_expires_at).getTime() : 0;
      if (expires && expires < nowMs) {
        expiredOrgs.push(org.id);
        plan = "free";
      }
    }
    checkEveryMs.set(org.id, (plan === "paid" || plan === "yearly" ? 1 : 60) * 60 * 1000);
  }
  if (expiredOrgs.length) {
    await supabase
      .from("organizations")
      .update({ plan: "free", plan_expires_at: null })
      .in("id", expiredOrgs);
  }

  const { data: monitors } = await supabase
    .from("monitors")
    .select("*")
    .eq("paused", false);

  let checked = 0;
  let skipped = 0;
  let downCount = 0;
  let created = 0;
  let resolved = 0;
  const incidentsByOrg = new Map<string, string[]>();

  for (const monitor of monitors ?? []) {
    const interval = checkEveryMs.get(monitor.org_id) ?? 60 * 60 * 1000;
    const last = monitor.last_checked_at ? new Date(monitor.last_checked_at).getTime() : 0;
    if (last && nowMs - last < interval) {
      skipped += 1;
      continue;
    }

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
          org_id: monitor.org_id,
          title: `${monitor.name} is down`,
          status: "identified",
          impact: "major",
          started_at: now,
        })
        .select()
        .single();

      if (inc) {
        created += 1;
        const list = incidentsByOrg.get(monitor.org_id) ?? [];
        list.push(inc.title);
        incidentsByOrg.set(monitor.org_id, list);
        await supabase.from("incident_monitors").insert({ incident_id: inc.id, monitor_id: monitor.id });
        await supabase.from("incident_updates").insert({
          incident_id: inc.id,
          tone: "danger",
          body: `${monitor.name} is unreachable: ${result.error ?? `HTTP ${result.responseCode}`}`,
        });
        await deliverWebhook({
          orgId: monitor.org_id,
          event: "monitor.down",
          monitor: { id: monitor.id, name: monitor.name, kind: monitor.kind, url: monitor.url },
          incident: { id: inc.id, title: inc.title, status: inc.status, impact: inc.impact, started_at: inc.started_at },
          error: result.error,
          latencyMs: result.latencyMs,
          responseCode: result.responseCode,
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
          await deliverWebhook({
            orgId: monitor.org_id,
            event: "monitor.up",
            monitor: { id: monitor.id, name: monitor.name, kind: monitor.kind, url: monitor.url },
            incident: { id: openId, title: `${monitor.name} is down`, status: "resolved", impact: "major", started_at: now },
            latencyMs: result.latencyMs,
            responseCode: result.responseCode,
          });
        }
      }
    }

    await supabase
      .from("monitors")
      .update({ status: result.status, latency_ms: result.latencyMs, last_checked_at: now, updated_at: now })
      .eq("id", monitor.id);
  }

  for (const [orgId, titles] of incidentsByOrg) {
    await notifySubscribers(orgId, "New incidents", titles.join(", "));
  }

  return NextResponse.json({ ok: true, checked, skipped, down: downCount, created, resolved });
}
