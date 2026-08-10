import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getUserOrgId } from "@/lib/auth-org";
import type { OrgPlan } from "@/lib/queries";

export const dynamic = "force-dynamic";

const validPlans: OrgPlan[] = ["free", "paid"];

export async function GET() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("plan")
    .eq("id", orgId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data?.plan === "paid" ? "paid" : "free" });
}

export async function PATCH(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const plan = body?.plan as OrgPlan;
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan. Choose 'free' or 'paid'." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ plan })
    .eq("id", orgId)
    .select("plan")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data?.plan ?? plan });
}
