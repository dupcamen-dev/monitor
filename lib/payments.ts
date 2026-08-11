import { createHmac, timingSafeEqual } from "crypto";
import { createAdminClient } from "@/lib/supabase";
import { PLAN_MONTH_MS, PLAN_YEAR_MS } from "@/lib/queries";
import type { OrgPlan } from "@/lib/queries";

export const NOWPAYMENTS_PAYABLE_PLANS = ["paid", "yearly"] as const;

export type PayablePlan = (typeof NOWPAYMENTS_PAYABLE_PLANS)[number];

export function isPayablePlan(value: unknown): value is PayablePlan {
  return NOWPAYMENTS_PAYABLE_PLANS.includes(value as PayablePlan);
}

export const PLAN_PRICES_USD: Record<Exclude<OrgPlan, "free">, number> = {
  paid: 19,
  yearly: 150,
};

export function planPriceUsd(plan: OrgPlan): number {
  return PLAN_PRICES_USD[plan as Exclude<OrgPlan, "free">] ?? 0;
}

export function planDurationMs(plan: OrgPlan): number {
  return plan === "yearly" ? PLAN_YEAR_MS : PLAN_MONTH_MS;
}

function apiKey(): string {
  return process.env.NOWPAYMENTS_API_KEY ?? "";
}

function ipnSecret(): string {
  return process.env.NOWPAYMENTS_IPN_SECRET ?? "";
}

function appUrl(): string {
  return process.env.APP_URL ?? "https://topstatus.space";
}

const NOWPAYMENTS_URL = "https://api.nowpayments.io/v1";

/* ---------- invoice creation ---------- */

export async function createPaymentInvoice(orgId: string, plan: Exclude<OrgPlan, "free">): Promise<{ invoiceUrl: string; orderId: string }> {
  const supabase = createAdminClient();
  const price = planPriceUsd(plan);
  const orderId = `ts_${orgId.slice(0, 8)}_${plan}_${Date.now()}`;

  const { error: insertError } = await supabase.from("payments").insert({
    org_id: orgId,
    plan,
    amount_usd: price,
    order_id: orderId,
    status: "waiting",
  });
  if (insertError) throw new Error(`Could not record payment: ${insertError.message}`);

  const res = await fetch(`${NOWPAYMENTS_URL}/invoice`, {
    method: "POST",
    headers: {
      "x-api-key": apiKey(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      price_amount: price,
      price_currency: "usd",
      order_id: orderId,
      order_description: plan === "yearly" ? "TopStatus Yearly plan" : "TopStatus Paid plan",
      success_url: `${appUrl()}/dashboard/settings?payment=success`,
      cancel_url: `${appUrl()}/dashboard/settings?payment=cancelled`,
      ipn_callback_url: `${appUrl()}/api/payments/ipn`,
    }),
  });

  const payload = await res.json().catch(() => null);
  if (!res.ok) {
    await supabase.from("payments").update({ status: "failed" }).eq("order_id", orderId);
    throw new Error(payload?.message ?? "NowPayments could not create the invoice");
  }

  const invoiceUrl: string | undefined = payload?.invoice_url;
  if (!invoiceUrl) {
    await supabase.from("payments").update({ status: "failed" }).eq("order_id", orderId);
    throw new Error("NowPayments returned no invoice URL");
  }

  return { invoiceUrl, orderId };
}

/* ---------- IPN verification ---------- */

export function verifyIpnSignature(rawBody: string, signature: string | null): boolean {
  const secret = ipnSecret();
  if (!secret || !signature) return false;
  const digest = createHmac("sha512", secret).update(rawBody).digest("hex");
  const a = Buffer.from(digest, "hex");
  const b = Buffer.from(signature, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/* ---------- payment status handling ---------- */

const PAID_STATUSES = new Set(["confirmed", "finished"]);

export async function handleIpn(rawBody: string): Promise<void> {
  const payload = JSON.parse(rawBody) as Record<string, unknown>;
  const orderId = String(payload.order_id ?? "");
  const paymentStatus = String(payload.payment_status ?? "");

  if (!orderId) throw new Error("Missing order_id in IPN payload");

  const supabase = createAdminClient();
  const { data: payment } = await supabase
    .from("payments")
    .select("id, org_id, plan, status")
    .eq("order_id", orderId)
    .maybeSingle();

  if (!payment) throw new Error(`Unknown order_id: ${orderId}`);

  const nextStatus = isPaidStatus(paymentStatus) ? "finished" : paymentStatus;
  await supabase
    .from("payments")
    .update({
      status: nextStatus,
      payment_id: payload.payment_id as number | null ?? null,
      payload,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payment.id);

  if (isPaidStatus(paymentStatus) && payment.status !== "finished") {
    await activatePlan(payment.org_id, payment.plan as OrgPlan);
  }
}

function isPaidStatus(status: string): boolean {
  return PAID_STATUSES.has(status);
}

export async function activatePlan(orgId: string, plan: OrgPlan): Promise<void> {
  const supabase = createAdminClient();
  const ms = planDurationMs(plan);

  const { data } = await supabase
    .from("organizations")
    .select("plan, plan_expires_at")
    .eq("id", orgId)
    .maybeSingle();

  const currentExpiry = data?.plan_expires_at ? new Date(data.plan_expires_at).getTime() : 0;
  const base = currentExpiry > Date.now() ? currentExpiry : Date.now();
  const expiresAt = new Date(base + ms).toISOString();

  await supabase
    .from("organizations")
    .update({ plan, plan_expires_at: expiresAt })
    .eq("id", orgId);
}

/* ---------- payment lookup ---------- */

export interface PaymentSummary {
  plan: OrgPlan;
  status: string;
  amountUsd: number;
  createdAt: string;
}

export async function getRecentPayments(orgId: string): Promise<PaymentSummary[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("payments")
    .select("plan, status, amount_usd, created_at")
    .eq("org_id", orgId)
    .order("created_at", { ascending: false })
    .limit(10);
  return (data ?? []).map((row) => ({
    plan: row.plan as OrgPlan,
    status: row.status,
    amountUsd: Number(row.amount_usd),
    createdAt: row.created_at,
  }));
}
