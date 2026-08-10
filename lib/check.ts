import type { SupabaseClient } from "@supabase/supabase-js";
import { pingUrl, type PingResult } from "@/lib/ping";

export async function runCheck(
  supabase: SupabaseClient,
  monitor: { id: string; url: string }
): Promise<PingResult> {
  const result = await pingUrl(monitor.url);
  const now = new Date().toISOString();

  await supabase.from("checks").insert({
    monitor_id: monitor.id,
    status: result.status,
    latency_ms: result.latencyMs,
    response_code: result.responseCode,
  });

  await supabase
    .from("monitors")
    .update({
      status: result.status,
      latency_ms: result.latencyMs,
      last_checked_at: now,
      updated_at: now,
    })
    .eq("id", monitor.id);

  return result;
}
