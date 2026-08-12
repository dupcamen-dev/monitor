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
    .order("created_at", { ascending: true })
    .limit(1)
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

  if (created) {
    return {
      id: created.id,
      plan: normalizePlan(created.plan),
      name: created.name,
      slug: created.slug,
      timezone: created.timezone || "Europe/Kyiv",
    };
  }

  if (error) {
    // A concurrent request probably created the org first (unique owner_id).
    // Fall back to the row it inserted instead of failing.
    const { data: raced } = await admin
      .from("organizations")
      .select("id, plan, name, slug, timezone")
      .eq("owner_id", user.id)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (raced) {
      return {
        id: raced.id,
        plan: normalizePlan(raced.plan),
        name: raced.name,
        slug: raced.slug,
        timezone: raced.timezone || "Europe/Kyiv",
      };
    }
  }

  return null;
}
