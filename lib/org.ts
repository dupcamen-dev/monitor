import { createAdminClient } from "@/lib/supabase";
import { createServerClientSSR } from "@/lib/supabase/auth";
import { normalizePlan } from "@/lib/queries";
import type { OrgPlan } from "@/lib/queries";

export interface UserOrg {
  id: string;
  plan: OrgPlan;
  name: string;
  slug: string;
  timezone: string;
}

function slugifyEmail(email: string): string {
  const base = (email.split("@")[0] || "workspace").toLowerCase().replace(/[^a-z0-9]+/g, "-");
  return base.replace(/^-+|-+$/g, "").slice(0, 40) || "workspace";
}

export async function getUserOrg(): Promise<UserOrg | null> {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("organizations")
    .select("id, plan, name, slug, timezone")
    .eq("owner_id", user.id)
    .maybeSingle();

  if (existing) {
    return {
      id: existing.id,
      plan: normalizePlan(existing.plan),
      name: existing.name,
      slug: existing.slug,
      timezone: existing.timezone || "Europe/Kyiv",
    };
  }

  const email = user.email ?? "";
  const base = slugifyEmail(email);

  const { data: created, error } = await admin
    .from("organizations")
    .insert({
      owner_id: user.id,
      owner_email: email,
      name: base.charAt(0).toUpperCase() + base.slice(1),
      slug: `${base}-${Math.random().toString(36).slice(2, 8)}`,
      plan: "free",
    })
    .select("id, plan, name, slug, timezone")
    .single();

  if (error || !created) return null;
  return {
    id: created.id,
    plan: normalizePlan(created.plan),
    name: created.name,
    slug: created.slug,
    timezone: created.timezone || "Europe/Kyiv",
  };
}
