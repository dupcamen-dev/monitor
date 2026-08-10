import { NextResponse } from "next/server";
import { getUserOrgId } from "@/lib/auth-org";
import { sendTestWebhook } from "@/lib/webhooks";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const secret = typeof body?.secret === "string" ? body.secret.trim() : "";

  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "Enter a valid HTTP(S) endpoint URL." }, { status: 400 });
  }

  const ok = await sendTestWebhook(url, secret);
  return NextResponse.json({ ok });
}
