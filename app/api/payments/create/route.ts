import { NextResponse } from "next/server";
import { getUserOrgId } from "@/lib/auth-org";
import { createPaymentInvoice, isPayablePlan } from "@/lib/payments";
import { getOrgPlanInfo } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  if (!process.env.NOWPAYMENTS_API_KEY) {
    return NextResponse.json({ error: "Payments are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => ({}));
  const plan = body?.plan;
  if (!isPayablePlan(plan)) {
    return NextResponse.json({ error: "Invalid plan for payment." }, { status: 400 });
  }

  const current = await getOrgPlanInfo(orgId);
  const yearlyActive =
    current.plan === "yearly" && current.expiresAt !== null && new Date(current.expiresAt).getTime() > Date.now();
  if (plan === "paid" && yearlyActive) {
    return NextResponse.json(
      { error: "You already have an active yearly plan. Upgrade is not available until it expires." },
      { status: 400 }
    );
  }

  try {
    const { invoiceUrl, orderId } = await createPaymentInvoice(orgId, plan);
    return NextResponse.json({ invoiceUrl, orderId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Could not create payment" },
      { status: 500 }
    );
  }
}
