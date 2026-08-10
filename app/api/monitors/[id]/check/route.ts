import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";
import { runCheck } from "@/lib/check";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: monitor, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("org_id", DEFAULT_ORG_ID)
    .single();

  if (error || !monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  const result = await runCheck(supabase, monitor);

  return NextResponse.json({ monitor_id: id, ...result });
}
