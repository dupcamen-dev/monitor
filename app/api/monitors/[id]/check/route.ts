import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { runCheck } from "@/lib/check";
import { getUserOrgId } from "@/lib/auth-org";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  const { data: monitor, error } = await supabase
    .from("monitors")
    .select("*")
    .eq("id", id)
    .eq("org_id", orgId)
    .single();

  if (error || !monitor) return NextResponse.json({ error: "Monitor not found" }, { status: 404 });

  const result = await runCheck(supabase, monitor);

  return NextResponse.json({ monitor_id: id, ...result });
}
