import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { runCheck } from "@/lib/check";
import { getUserOrgId } from "@/lib/auth-org";
import { getOrgPlanInfo, planCheckIntervalSec } from "@/lib/queries";

export const dynamic = "force-dynamic";

/* Lazy fallback: when the dashboard is viewed, this pings monitors whose
   check is overdue. Keeps the UI fresh even if the cron scheduler is late. */
export async function POST() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const planInfo = await getOrgPlanInfo(orgId);
  const intervalMs = planCheckIntervalSec(planInfo.plan) * 1000;

  const { data: monitors } = await admin
    .from("monitors")
    .select("*")
    .eq("org_id", orgId)
    .eq("paused", false);

  const now = Date.now();
  const overdue = (monitors ?? []).filter((m) => {
    if (!m.last_checked_at) return true;
    return now - new Date(m.last_checked_at).getTime() >= intervalMs;
  });

  let checked = 0;
  for (const m of overdue.slice(0, 10)) {
    await runCheck(admin, m);
    checked += 1;
  }

  return NextResponse.json({ ok: true, checked });
}
