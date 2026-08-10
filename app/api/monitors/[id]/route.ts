import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("org_id", DEFAULT_ORG_ID)
    .single();

  if (error || !data) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function PATCH(request: Request, { params }: Ctx) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  const updates: Record<string, unknown> = {};
  if (typeof body.name === "string" && body.name.trim()) updates.name = body.name.trim();
  if (typeof body.url === "string" && body.url.trim()) updates.url = body.url.trim();
  if (typeof body.intervalSec === "number") updates.interval_sec = body.intervalSec;
  if (typeof body.paused === "boolean") updates.paused = body.paused;
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("monitors")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", id)
    .eq("org_id", DEFAULT_ORG_ID)
    .select()
    .single();

  if (error || !data) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });
  return NextResponse.json(data);
}

export async function DELETE(_request: Request, { params }: Ctx) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { error } = await supabase.from("monitors").delete().eq("id", id).eq("org_id", DEFAULT_ORG_ID);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
