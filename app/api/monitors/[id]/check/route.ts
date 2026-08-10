import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";
import { pingUrl } from "@/lib/ping";

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

  const result = await pingUrl(monitor.url);

  const { error: insertError } = await supabase.from("checks").insert({
    monitor_id: id,
    status: result.status,
    latency_ms: result.latencyMs,
    response_code: result.responseCode,
  });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  await supabase
    .from("monitors")
    .update({ status: result.status, latency_ms: result.latencyMs, updated_at: new Date().toISOString() })
    .eq("id", id);

  return NextResponse.json({ monitor_id: id, ...result });
}
