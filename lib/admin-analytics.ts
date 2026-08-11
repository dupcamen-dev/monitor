import { createAdminClient } from "@/lib/supabase";

const DAY_MS = 24 * 60 * 60 * 1000;

export interface AdminPayment {
  id: string;
  date: string;
  workspace: string;
  email: string;
  plan: string;
  amount: number;
  status: string;
}

export interface AdminAnalytics {
  totalRevenue: number;
  revenue30: number;
  paidCount: number;
  paidYearly: number;
  paidMonthly: number;
  statusCounts: { status: string; count: number }[];
  recentPayments: AdminPayment[];
  totalVisits: number;
  visits30: number;
  visitsByDay: { label: string; count: number }[];
  topPaths: { path: string; count: number }[];
  active24h: number;
  active7d: number;
  active30d: number;
  orgCount: number;
}

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  const admin = createAdminClient();
  const now = Date.now();

  const [{ data: payments }, { data: orgs }, { count: totalVisits }, { count: visits30 }] =
    await Promise.all([
      admin
        .from("payments")
        .select("id, org_id, plan, amount_usd, status, created_at")
        .order("created_at", { ascending: false })
        .limit(500),
      admin.from("organizations").select("id, name, owner_email"),
      admin.from("page_visits").select("id", { count: "exact", head: true }),
      admin
        .from("page_visits")
        .select("id", { count: "exact", head: true })
        .gte("created_at", new Date(now - 30 * DAY_MS).toISOString()),
    ]);

  const orgName = new Map((orgs ?? []).map((o) => [o.id, o.name ?? o.owner_email ?? "Unknown"]));
  const orgEmail = new Map((orgs ?? []).map((o) => [o.id, o.owner_email ?? "—"]));

  const paid = (payments ?? []).filter((p) => p.status === "finished");
  const totalRevenue = paid.reduce((sum, p) => sum + Number(p.amount_usd), 0);
  const cutoff30 = now - 30 * DAY_MS;
  const revenue30 = paid
    .filter((p) => new Date(p.created_at).getTime() >= cutoff30)
    .reduce((sum, p) => sum + Number(p.amount_usd), 0);
  const paidMonthly = paid.filter((p) => p.plan === "paid").length;
  const paidYearly = paid.filter((p) => p.plan === "yearly").length;

  const statusCounts = new Map<string, number>();
  for (const p of payments ?? []) statusCounts.set(p.status, (statusCounts.get(p.status) ?? 0) + 1);

  const visitsLast14 = await admin
    .from("page_visits")
    .select("created_at")
    .gte("created_at", new Date(now - 14 * DAY_MS).toISOString())
    .limit(2000);
  const visitsByDay = new Map<string, number>();
  for (const v of visitsLast14.data ?? []) {
    const key = v.created_at.slice(0, 10);
    visitsByDay.set(key, (visitsByDay.get(key) ?? 0) + 1);
  }
  const visitsByDayOut: { label: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const key = new Date(now - i * DAY_MS).toISOString().slice(0, 10);
    visitsByDayOut.push({ label: key.slice(5), count: visitsByDay.get(key) ?? 0 });
  }

  const visits30rows = await admin
    .from("page_visits")
    .select("path")
    .gte("created_at", new Date(now - 30 * DAY_MS).toISOString())
    .limit(2000);
  const pathCounts = new Map<string, number>();
  for (const v of visits30rows.data ?? []) pathCounts.set(v.path, (pathCounts.get(v.path) ?? 0) + 1);
  const topPaths = [...pathCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([path, count]) => ({ path, count }));

  const activeWindow = async (ms: number) => {
    const { data } = await admin
      .from("page_visits")
      .select("user_id")
      .not("user_id", "is", null)
      .gte("created_at", new Date(now - ms).toISOString())
      .limit(2000);
    return new Set((data ?? []).map((v) => v.user_id)).size;
  };

  const [active24h, active7d, active30d, orgResult] = await Promise.all([
    activeWindow(DAY_MS),
    activeWindow(7 * DAY_MS),
    activeWindow(30 * DAY_MS),
    admin.from("organizations").select("id", { count: "exact", head: true }),
  ]);

  const recentPayments: AdminPayment[] = (payments ?? []).slice(0, 20).map((p) => ({
    id: p.id,
    date: p.created_at,
    workspace: orgName.get(p.org_id) ?? "Unknown",
    email: orgEmail.get(p.org_id) ?? "—",
    plan: p.plan,
    amount: Number(p.amount_usd),
    status: p.status,
  }));

  return {
    totalRevenue,
    revenue30,
    paidCount: paid.length,
    paidYearly,
    paidMonthly,
    statusCounts: [...statusCounts.entries()].sort((a, b) => b[1] - a[1]).map(([status, count]) => ({ status, count })),
    recentPayments,
    totalVisits: totalVisits ?? 0,
    visits30: visits30 ?? 0,
    visitsByDay: visitsByDayOut,
    topPaths,
    active24h,
    active7d,
    active30d,
    orgCount: orgResult?.count ?? 0,
  };
}
