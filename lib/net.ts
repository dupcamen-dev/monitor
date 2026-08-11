import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

const REDIRECT_STATUS = new Set([301, 302, 303, 307, 308]);

// Private / loopback / link-local / reserved IPv4 ranges (as [start, end] ints).
// Covers cloud metadata (169.254.169.254), localhost, RFC1918, CGNAT, TEST-NETs, multicast/reserved.
const V4_BLOCKED: ReadonlyArray<readonly [number, number]> = [
  [0x00000000, 0x00ffffff], // 0.0.0.0/8
  [0x0a000000, 0x0affffff], // 10.0.0.0/8
  [0x64400000, 0x647fffff], // 100.64.0.0/10 (CGNAT)
  [0x7f000000, 0x7fffffff], // 127.0.0.0/8 (loopback)
  [0xa9fe0000, 0xa9feffff], // 169.254.0.0/16 (link-local, includes AWS/GCP metadata)
  [0xac100000, 0xac1fffff], // 172.16.0.0/12
  [0xc0000000, 0xc00000ff], // 192.0.0.0/24 (IETF special)
  [0xc0000200, 0xc00002ff], // 192.0.2.0/24 (TEST-NET-1)
  [0xc0a80000, 0xc0a8ffff], // 192.168.0.0/16
  [0xc6120000, 0xc613ffff], // 198.18.0.0/15 (benchmarking)
  [0xc6336400, 0xc63364ff], // 198.51.100.0/24 (TEST-NET-2)
  [0xcb007100, 0xcb0071ff], // 203.0.113.0/24 (TEST-NET-3)
  [0xe0000000, 0xffffffff], // 224.0.0.0/4 multicast + 240.0.0.0/4 reserved
];

function v4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let value = 0;
  for (const part of parts) {
    if (!/^\d{1,3}$/.test(part)) return null;
    const octet = Number(part);
    if (octet > 255) return null;
    value = (value << 8) | octet;
  }
  return value >>> 0;
}

function isV4Blocked(ip: string): boolean {
  const int = v4ToInt(ip);
  if (int === null) return true;
  return V4_BLOCKED.some(([start, end]) => int >= start && int <= end);
}

function isV6Blocked(ip: string): boolean {
  const lower = ip.toLowerCase();

  // IPv4-mapped (::ffff:a.b.c.d)
  if (lower.startsWith("::ffff:")) return isV4Blocked(lower.slice(7));

  return (
    lower === "::1" || // loopback
    lower === "::" || // unspecified
    (lower.startsWith("fc") || lower.startsWith("fd")) || // fc00::/7 unique local
    ["fe8", "fe9", "fea", "feb"].some((p) => lower.startsWith(p)) // fe80::/10 link-local
  );
}

export function isIpBlocked(ip: string): boolean {
  const family = isIP(ip);
  if (family === 4) return isV4Blocked(ip);
  if (family === 6) return isV6Blocked(ip);
  return true; // not a valid IP — treat as blocked
}

export async function assertUrlAllowed(url: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error("Invalid URL");
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`Unsupported protocol: ${parsed.protocol}`);
  }

  const host = parsed.hostname;
  const family = isIP(host);

  if (family === 4 || family === 6) {
    if (isIpBlocked(host)) throw new Error("Access to this address is not allowed");
    return;
  }

  const addresses = await lookup(host, { all: true });
  if (addresses.length === 0) throw new Error("Could not resolve host");
  for (const { address } of addresses) {
    if (isIpBlocked(address)) throw new Error("Access to this address is not allowed");
  }
}

export async function fetchBlockedSafe(
  input: string,
  init: RequestInit = {},
  maxRedirects = 5
): Promise<Response> {
  await assertUrlAllowed(input);
  const res = await fetch(input, { ...init, redirect: "manual" });

  if (REDIRECT_STATUS.has(res.status)) {
    if (maxRedirects <= 0) throw new Error("Too many redirects");
    const location = res.headers.get("location");
    if (!location) throw new Error("Redirect missing Location header");
    return fetchBlockedSafe(new URL(location, input).toString(), init, maxRedirects - 1);
  }

  return res;
}
