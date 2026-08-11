import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getUserOrgId } from "@/lib/auth-org";
import { normalizePlan } from "@/lib/queries";
import type { OrgPlan } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("plan, plan_expires_at")
    .eq("id", orgId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const plan = normalizePlan(data?.plan);
  let expiresAt: string | null = null;
  if ((plan === "paid" || plan === "yearly") && data?.plan_expires_at) {
    expiresAt = new Date(data.plan_expires_at).getTime() < Date.now() ? null : data.plan_expires_at;
  }
  return NextResponse.json({ plan, expiresAt });
}

export async function PATCH(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  // Paid/yearly plans can only be activated through NowPayments (see /api/payments).
  // This endpoint only supports downgrading to the free plan.
  const plan = body?.plan as OrgPlan;
  if (plan !== "free") {
    return NextResponse.json(
      { error: "Paid plans must be purchased via the Plan selector." },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();
  const patch: { plan: OrgPlan; plan_expires_at: string | null } = { plan, plan_expires_at: null };

  const { data, error } = await supabase
    .from("organizations")
    .update(patch)
    .eq("id", orgId)
    .select("plan, plan_expires_at")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({
    plan: normalizePlan(data?.plan),
    expiresAt: data?.plan_expires_at ?? null,
  });
}
