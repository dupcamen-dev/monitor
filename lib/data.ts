export type MonitorStatus = "up" | "degraded" | "down";
export type DayState = "up" | "partial" | "down" | "nodata";
export type MonitorKind = "website" | "api" | "database" | "dashboard";

export interface Monitor {
  id: string;
  name: string;
  kind: MonitorKind;
  url: string;
  status: MonitorStatus;
  latencyMs: number | null;
  uptime30: string;
  uptime90: string;
  history: DayState[];
  interval: string;
  paused?: boolean;
}

export type UpdateTone = "success" | "neutral" | "danger";

export interface IncidentUpdate {
  time: string;
  label: "Resolved" | "Monitoring" | "Identifying" | "Investigating" | "Update";
  tone: UpdateTone;
  message: string;
}

export interface Incident {
  id: string;
  title: string;
  dateLabel: string;
  date: string;
  impacted: string[];
  resolved: boolean;
  updates: IncidentUpdate[];
}

export interface Channel {
  id: string;
  name: string;
  color: string;
  icon: "telegram" | "whatsapp" | "email" | "slack" | "webhook";
  connected: boolean;
  description: string;
  meta: string;
}

/* Deterministic PRNG so uptime bars are stable between renders. */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function genHistory(
  seed: number,
  opts?: { down?: number[]; partial?: number[]; nodata?: number[] }
): DayState[] {
  const rand = mulberry32(seed);
  const history: DayState[] = [];
  for (let i = 0; i < 90; i++) {
    const r = rand();
    if (opts?.down?.includes(i)) history.push("down");
    else if (opts?.partial?.includes(i)) history.push("partial");
    else if (opts?.nodata?.includes(i)) history.push("nodata");
    else if (r < 0.012) history.push("partial");
    else if (r < 0.006) history.push("down");
    else history.push("up");
  }
  return history;
}

export function uptimePct(history: DayState[]): string {
  const weighted = history.reduce(
    (acc, d) => acc + (d === "up" ? 1 : d === "partial" ? 0.5 : 0),
    0
  );
  return ((weighted / history.length) * 100).toFixed(2) + "%";
}

function makeMonitor(
  id: string,
  name: string,
  kind: MonitorKind,
  url: string,
  status: MonitorStatus,
  latencyMs: number | null,
  seed: number,
  opts?: { down?: number[]; partial?: number[]; nodata?: number[] },
  interval = "1m"
): Monitor {
  const history = genHistory(seed, opts);
  return {
    id,
    name,
    kind,
    url,
    status,
    latencyMs,
    history,
    uptime30: uptimePct(history.slice(-30)),
    uptime90: uptimePct(history),
    interval,
  };
}

export const dashboardMonitors: Monitor[] = [
  makeMonitor("m1", "Main Website", "website", "https://acme.dev", "up", 124, 11, { down: [75] }, "1m"),
  makeMonitor("m2", "API Gateway", "api", "https://api.acme.dev", "up", 45, 22, {}, "1m"),
  makeMonitor("m3", "Database (Primary)", "database", "postgres://primary.acme.dev", "down", null, 33, { down: [86, 87, 88, 89] }, "1m"),
  makeMonitor("m4", "Dashboard", "dashboard", "https://app.acme.dev", "up", 88, 44, { down: [12] }, "1m"),
  makeMonitor("m5", "Webhooks Worker", "api", "https://hooks.acme.dev", "degraded", 210, 55, { partial: [58, 59, 60, 61] }, "1m"),
  makeMonitor("m6", "CDN Edge", "website", "https://cdn.acme.dev", "up", 32, 66, { partial: [20] }, "5m"),
  makeMonitor("m7", "Auth Service", "api", "https://auth.acme.dev", "up", 63, 77, {}, "1m"),
  makeMonitor("m8", "Search Index", "database", "https://search.acme.dev", "up", 152, 88, { partial: [40, 41] }, "5m"),
];

/* Public status page components (customer-facing, e.g. Acme Corp). */
export const statusPageMonitors: Monitor[] = [
  makeMonitor("s1", "API", "api", "https://api.acme.dev", "up", 45, 22, { down: [75] }, "1m"),
  makeMonitor("s2", "Website", "website", "https://acme.dev", "up", 124, 11, {}, "1m"),
  makeMonitor("s3", "Database", "database", "postgres://primary.acme.dev", "up", 88, 33, { nodata: [80, 81, 82] }, "1m"),
  makeMonitor("s4", "Dashboard", "dashboard", "https://app.acme.dev", "up", 88, 44, { down: [12] }, "1m"),
];

export const incidents: Incident[] = [
  {
    id: "inc-1",
    title: "API Connection Issues",
    dateLabel: "October 24, 2023",
    date: "2023-10-24",
    impacted: ["API", "Dashboard"],
    resolved: true,
    updates: [
      {
        time: "14:30 EEST",
        label: "Resolved",
        tone: "success",
        message: "This incident has been resolved. All systems are functioning normally.",
      },
      {
        time: "14:00 EEST",
        label: "Monitoring",
        tone: "neutral",
        message: "A fix has been implemented and we are monitoring the results.",
      },
      {
        time: "13:45 EEST",
        label: "Investigating",
        tone: "danger",
        message: "We are investigating reports of elevated latency on our API endpoints.",
      },
    ],
  },
  {
    id: "inc-2",
    title: "Elevated Database Latency",
    dateLabel: "October 18, 2023",
    date: "2023-10-18",
    impacted: ["Database", "API"],
    resolved: true,
    updates: [
      {
        time: "09:12 EEST",
        label: "Resolved",
        tone: "success",
        message: "Connection pool has been scaled up. Latency is back to baseline.",
      },
      {
        time: "08:40 EEST",
        label: "Monitoring",
        tone: "neutral",
        message: "We deployed additional replicas and are monitoring query performance.",
      },
      {
        time: "08:15 EEST",
        label: "Identifying",
        tone: "danger",
        message: "Increased p95 latency detected on primary database cluster.",
      },
    ],
  },
  {
    id: "inc-3",
    title: "CDN Routing Outage",
    dateLabel: "September 30, 2023",
    date: "2023-09-30",
    impacted: ["Website", "CDN Edge"],
    resolved: true,
    updates: [
      {
        time: "20:02 EEST",
        label: "Resolved",
        tone: "success",
        message: "Edge routing restored globally.",
      },
      {
        time: "19:30 EEST",
        label: "Investigating",
        tone: "danger",
        message: "Traffic in EMEA region rerouted due to upstream provider degradation.",
      },
    ],
  },
  {
    id: "inc-4",
    title: "Webhook Delivery Failures",
    dateLabel: "September 22, 2023",
    date: "2023-09-22",
    impacted: ["Webhooks Worker"],
    resolved: true,
    updates: [
      {
        time: "16:45 EEST",
        label: "Resolved",
        tone: "success",
        message: "Retry queue drained, all pending webhooks delivered.",
      },
      {
        time: "16:00 EEST",
        label: "Update",
        tone: "neutral",
        message: "Webhook retry backoff increased to reduce load on downstream consumers.",
      },
      {
        time: "15:20 EEST",
        label: "Investigating",
        tone: "danger",
        message: "Outbound webhook deliveries failing intermittently.",
      },
    ],
  },
];

export const channels: Channel[] = [
  {
    id: "telegram",
    name: "Telegram",
    color: "#229ED9",
    icon: "telegram",
    connected: true,
    description: "Get instant downtime and recovery alerts directly to your Telegram bot.",
    meta: "@upstatus_bot",
  },
  {
    id: "whatsapp",
    name: "WhatsApp",
    color: "#25D366",
    icon: "whatsapp",
    connected: false,
    description: "Business notifications for your team via WhatsApp Business API.",
    meta: "+380 00 000 0000",
  },
  {
    id: "email",
    name: "Email",
    color: "#e4e2e2",
    icon: "email",
    connected: true,
    description: "Plain-text and rich summary digests to any inbox.",
    meta: "ops@acme.dev",
  },
  {
    id: "slack",
    name: "Slack",
    color: "#E01E5A",
    icon: "slack",
    connected: false,
    description: "Post alerts to channels with custom emoji and mentions.",
    meta: "#incidents",
  },
];
