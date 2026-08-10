import { NextResponse } from "next/server";
import { getUserOrgId } from "@/lib/auth-org";
import { getWebhook, saveWebhook, deleteWebhook } from "@/lib/webhooks";

export const dynamic = "force-dynamic";

function validUrl(value: string): boolean {
  return /^https?:\/\//i.test(value);
}

export async function GET() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const wh = await getWebhook(orgId);
  return NextResponse.json(wh ? { url: wh.url, secret: wh.secret, active: wh.active } : null);
}

export async function PUT(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const secret = typeof body?.secret === "string" ? body.secret.trim() : "";

  if (!validUrl(url)) {
    return NextResponse.json({ error: "Enter a valid HTTP(S) endpoint URL." }, { status: 400 });
  }

  await saveWebhook(orgId, url, secret);
  return NextResponse.json({ ok: true, url, secret });
}

export async function DELETE() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteWebhook(orgId);
  return NextResponse.json({ ok: true });
}
