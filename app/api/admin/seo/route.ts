import { NextResponse } from "next/server";
import { createServerClientSSR } from "@/lib/supabase/auth";
import { createAdminClient } from "@/lib/supabase";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

const FIELDS = ["title", "description", "keywords", "og_title", "og_description"] as const;

async function requireAdminUser() {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return isAdminEmail(user?.email) ? user : null;
}

export async function GET() {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const admin = createAdminClient();
  const { data } = await admin.from("seo_settings").select("*").eq("id", 1).maybeSingle();
  return NextResponse.json(data ?? null);
}

export async function PUT(request: Request) {
  const adminUser = await requireAdminUser();
  if (!adminUser) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const updates: Record<string, string> = {};
  for (const field of FIELDS) {
    if (typeof body?.[field] === "string") {
      const value = body[field].trim();
      if (value || (field !== "title" && field !== "description")) updates[field] = value;
    }
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("seo_settings")
    .update({ ...updates, updated_at: new Date().toISOString(), updated_by: adminUser.email })
    .eq("id", 1)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}
