import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { requireAdminUser, getAdminEmails, isBaseAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET() {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const emails = await getAdminEmails();
  return NextResponse.json(
    emails.map((email) => ({ email, base: isBaseAdminEmail(email) }))
  );
}

export async function POST(request: Request) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("admins").insert({ email }).select().single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "This user is already an admin" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, email });
}

export async function DELETE(request: Request) {
  if (!(await requireAdminUser())) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";

  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }
  if (isBaseAdminEmail(email)) {
    return NextResponse.json({ error: "The owner account cannot be un-admin'd" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin.from("admins").delete().eq("email", email);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
