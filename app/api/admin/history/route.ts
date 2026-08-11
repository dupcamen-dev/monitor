import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

const TARGETS = new Set(["payments", "visits"]);

export async function POST(request: Request) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const target = body?.target;
  if (!TARGETS.has(target)) {
    return NextResponse.json({ error: "target must be 'payments' or 'visits'" }, { status: 400 });
  }

  const admin = createAdminClient();

  if (target === "payments") {
    const { data, error } = await admin
      .from("payments")
      .delete({ count: "exact" })
      .neq("id", "00000000-0000-0000-0000-000000000000");
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true, cleared: data ?? 0 });
  }

  const { data, error } = await admin.from("page_visits").delete({ count: "exact" }).gte("id", 0);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, cleared: data ?? 0 });
}
