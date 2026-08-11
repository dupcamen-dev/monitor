import { fetchBlockedSafe } from "@/lib/net";

export type PingStatus = "up" | "degraded" | "down";

export type PingResult = {
  status: PingStatus;
  latencyMs: number | null;
  responseCode: number | null;
  error: string | null;
};

const TIMEOUT_MS = 10_000;
const SLOW_THRESHOLD_MS = 1500;

export async function pingUrl(url: string): Promise<PingResult> {
  if (!/^https?:\/\//i.test(url)) {
    return {
      status: "down",
      latencyMs: null,
      responseCode: null,
      error: `Unsupported protocol (only http/https): ${url}`,
    };
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const start = performance.now();

  try {
    const res = await fetchBlockedSafe(url, {
      signal: controller.signal,
      cache: "no-store",
    });
    const latencyMs = Math.round(performance.now() - start);
    const status: PingStatus =
      !res.ok || latencyMs > SLOW_THRESHOLD_MS ? (res.ok ? "degraded" : "down") : "up";
    return { status, latencyMs, responseCode: res.status, error: null };
  } catch (err) {
    return {
      status: "down",
      latencyMs: null,
      responseCode: null,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  } finally {
    clearTimeout(timer);
  }
}
