import { createClient } from "@supabase/supabase-js";

const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const since = new Date(Date.now() - 90 * 60 * 1000).toISOString();
const { data } = await sb.from("checks").select("checked_at").gte("checked_at", since).order("checked_at", { ascending: true });
const byTime = new Map();
for (const c of data ?? []) {
  const key = c.checked_at.slice(0, 19);
  byTime.set(key, (byTime.get(key) ?? 0) + 1);
}
for (const [k, v] of byTime) console.log(k, "->", v);
console.log("now (UTC):", new Date().toISOString());
