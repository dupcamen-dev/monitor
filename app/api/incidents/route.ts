import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getUserOrgId } from "@/lib/auth-org";

export const dynamic = "force-dynamic";

const INCIDENT_STATUSES = ["investigating", "identified", "monitoring", "resolved"];
const IMPACTS = ["none", "minor", "major", "critical"];

export async function GET() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("incidents")
    .select("*, updates:incident_updates(*), monitors:incident_monitors(monitor_id)")
    .eq("org_id", orgId)
    .order("started_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  if (!title) return NextResponse.json({ error: "title is required" }, { status: 400 });

  const status = INCIDENT_STATUSES.includes(body?.status) ? body.status : "investigating";
  const impact = IMPACTS.includes(body?.impact) ? body.impact : "minor";
  const message = typeof body?.message === "string" && body.message.trim() ? body.message.trim() : "";
  const monitorIds: string[] = Array.isArray(body?.monitorIds) ? body.monitorIds.filter((m: unknown) => typeof m === "string") : [];
  const startedAt = typeof body?.startedAt === "string" ? body.startedAt : new Date().toISOString();

  const supabase = createAdminClient();

  const { data: incident, error } = await supabase
    .from("incidents")
    .insert({ org_id: orgId, title, status, impact, started_at: startedAt })
    .select()
    .single();

  if (error || !incident) return NextResponse.json({ error: error?.message ?? "Failed" }, { status: 500 });

  if (monitorIds.length > 0) {
    await supabase.from("incident_monitors").insert(
      monitorIds.map((monitorId) => ({ incident_id: incident.id, monitor_id: monitorId }))
    );
  }

  await supabase.from("incident_updates").insert({
    incident_id: incident.id,
    tone: "danger",
    body: message || `Incident "${title}" created.`,
  });

  return NextResponse.json(incident, { status: 201 });
}
