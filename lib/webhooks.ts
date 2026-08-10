import { createHmac } from "crypto";
import { createAdminClient } from "@/lib/supabase";

export interface WebhookRow {
  id: string;
  org_id: string;
  url: string;
  secret: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export type WebhookEvent = "monitor.down" | "monitor.up" | "monitor.degraded";

export async function getWebhook(orgId: string): Promise<WebhookRow | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("webhooks")
    .select("*")
    .eq("org_id", orgId)
    .maybeSingle();
  return data ?? null;
}

export async function saveWebhook(orgId: string, url: string, secret: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("webhooks").upsert(
    {
      org_id: orgId,
      url,
      secret: secret || "",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "org_id" }
  );
}

export async function deleteWebhook(orgId: string): Promise<void> {
  const supabase = createAdminClient();
  await supabase.from("webhooks").delete().eq("org_id", orgId);
}

function sign(secret: string, body: string): string {
  return createHmac("sha256", secret).update(body).digest("hex");
}

async function postJson(url: string, secret: string, payload: string): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10_000);
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "User-Agent": "TopStatus/1.0",
    };
    if (secret) headers["X-TopStatus-Signature"] = `sha256=${sign(secret, payload)}`;
    const res = await fetch(url, {
      method: "POST",
      headers,
      body: payload,
      signal: controller.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

interface DeliveryMonitor {
  id: string;
  name: string;
  kind: string;
  url: string;
}

export async function deliverWebhook(opts: {
  orgId: string;
  event: WebhookEvent;
  monitor: DeliveryMonitor;
  incident?: { id: string; title: string; status: string; impact: string; started_at: string } | null;
  error?: string | null;
  latencyMs?: number | null;
  responseCode?: number | null;
}): Promise<boolean> {
  const wh = await getWebhook(opts.orgId);
  if (!wh || !wh.active || !wh.url) return false;

  const payload = JSON.stringify({
    event: opts.event,
    org_id: opts.orgId,
    monitor: opts.monitor,
    incident: opts.incident ?? null,
    error: opts.error ?? null,
    latency_ms: opts.latencyMs ?? null,
    response_code: opts.responseCode ?? null,
    timestamp: new Date().toISOString(),
  });
  return postJson(wh.url, wh.secret, payload);
}

export async function sendTestWebhook(url: string, secret: string): Promise<boolean> {
  const payload = JSON.stringify({
    event: "test",
    org_id: null,
    monitor: { id: "sample", name: "Example Monitor", kind: "website", url: "https://example.com" },
    incident: null,
    error: null,
    latency_ms: 124,
    response_code: 200,
    timestamp: new Date().toISOString(),
    message: "This is a test payload from TopStatus.",
  });
  return postJson(url, secret || "", payload);
}
