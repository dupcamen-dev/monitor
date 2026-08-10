import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { getUserOrgId } from "@/lib/auth-org";

export const dynamic = "force-dynamic";

const TIMEZONES = ["Europe/Kyiv", "Europe/London", "Europe/Berlin", "America/New_York", "Asia/Singapore"];

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function PATCH(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const slug = typeof body?.slug === "string" ? body.slug.trim().toLowerCase() : "";
  const timezone = typeof body?.timezone === "string" ? body.timezone : "";

  if (!name) return NextResponse.json({ error: "Organization name is required." }, { status: 400 });
  if (!SLUG_RE.test(slug)) {
    return NextResponse.json(
      { error: "Slug may only contain lowercase letters, numbers and hyphens." },
      { status: 400 }
    );
  }
  if (!TIMEZONES.includes(timezone)) {
    return NextResponse.json({ error: "Invalid timezone." }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("organizations")
    .update({ name, slug, timezone })
    .eq("id", orgId)
    .select("name, slug, timezone")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This slug is already taken." }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ name: data?.name, slug: data?.slug, timezone: data?.timezone });
}
