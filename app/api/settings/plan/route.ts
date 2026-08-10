import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";
import type { OrgPlan } from "@/lib/queries";

export const dynamic = "force-dynamic";

const validPlans: OrgPlan[] = ["free", "paid"];

export async function GET() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .select("plan")
    .eq("id", DEFAULT_ORG_ID)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data?.plan === "paid" ? "paid" : "free" });
}

export async function PATCH(request: Request) {
  const body = await request.json().catch(() => ({}));
  const plan = body?.plan as OrgPlan;
  if (!validPlans.includes(plan)) {
    return NextResponse.json({ error: "Invalid plan. Choose 'free' or 'paid'." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ plan })
    .eq("id", DEFAULT_ORG_ID)
    .select("plan")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data?.plan ?? plan });
}
