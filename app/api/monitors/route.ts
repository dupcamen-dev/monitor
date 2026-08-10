import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { runCheck } from "@/lib/check";
import { getUserOrgId } from "@/lib/auth-org";

export const dynamic = "force-dynamic";

const KINDS = ["website", "api", "database", "dashboard"];

export async function GET() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const kind = KINDS.includes(body?.kind) ? body.kind : "website";

  if (!name || !url) {
    return NextResponse.json({ error: "name and url are required" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("monitors")
    .insert({ org_id: orgId, name, url, kind, status: "up" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = await runCheck(supabase, data);

  return NextResponse.json({ ...data, check: result }, { status: 201 });
}
