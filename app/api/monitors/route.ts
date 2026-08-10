import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";
import { runCheck } from "@/lib/check";

export const dynamic = "force-dynamic";

const KINDS = ["website", "api", "database", "dashboard"];

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("org_id", DEFAULT_ORG_ID)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

export async function POST(request: Request) {
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
    .insert({ org_id: DEFAULT_ORG_ID, name, url, kind, status: "up" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = await runCheck(supabase, data);

  return NextResponse.json({ ...data, check: result }, { status: 201 });
}
