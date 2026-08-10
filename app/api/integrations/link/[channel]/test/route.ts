import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createServerClientSSR } from "@/lib/supabase/auth";
import { sendTestAlert } from "@/lib/notify";

export const dynamic = "force-dynamic";

const VALID = new Set(["email", "discord"]);

type Ctx = { params: Promise<{ channel: string }> };

export async function POST(_request: Request, { params }: Ctx) {
  const { channel } = await params;
  if (!VALID.has(channel)) return NextResponse.json({ error: "Unknown channel" }, { status: 400 });

  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();

  const { data: sub } = await admin
    .from("subscriptions")
    .select("target")
    .eq("org_id", org?.id ?? "")
    .eq("channel", channel)
    .eq("verified", true)
    .maybeSingle();

  if (!sub) return NextResponse.json({ error: "Channel is not connected" }, { status: 400 });

  const delivered = await sendTestAlert(channel, sub.target);
  if (!delivered) {
    return NextResponse.json(
      { error: channel === "email" ? "Could not send email — check RESEND_API_KEY and EMAIL_FROM" : "Could not deliver to Discord webhook" },
      { status: 502 }
    );
  }

  return NextResponse.json({ ok: true });
}
