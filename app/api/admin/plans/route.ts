import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdminUser } from "@/lib/admin";
import { activatePlan, isPayablePlan } from "@/lib/payments";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("organizations")
    .select("id, name, slug, owner_email, plan, plan_expires_at, created_at")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const orgId = typeof body?.org_id === "string" ? body.org_id : "";
  const plan = body?.plan;

  if (!orgId || !isPayablePlan(plan)) {
    return NextResponse.json({ error: "org_id and a valid plan (paid|yearly) are required" }, { status: 400 });
  }

  try {
    await activatePlan(orgId, plan);
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not grant plan" },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const orgId = typeof body?.org_id === "string" ? body.org_id : "";
  if (!orgId) {
    return NextResponse.json({ error: "org_id is required" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("organizations")
    .update({ plan: "free", plan_expires_at: null })
    .eq("id", orgId);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
