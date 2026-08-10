import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { createServerClientSSR } from "@/lib/supabase/auth";

export const dynamic = "force-dynamic";

const VALID = new Set(["email", "discord"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isDiscordWebhook(url: string): boolean {
  return /^https:\/\/(discord\.com|discordapp\.com)\/api\/webhooks\//.test(url);
}

type Ctx = { params: Promise<{ channel: string }> };

export async function GET(_request: Request, { params }: Ctx) {
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
    .maybeSingle();

  return NextResponse.json({
    connected: Boolean(sub),
    target: sub?.target ?? "",
    suggestedTarget: channel === "email" ? (user.email ?? "") : "",
    senderConfigured: channel === "email" ? Boolean(process.env.RESEND_API_KEY) : true,
  });
}

export async function POST(request: Request, { params }: Ctx) {
  const { channel } = await params;
  if (!VALID.has(channel)) return NextResponse.json({ error: "Unknown channel" }, { status: 400 });

  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json().catch(() => ({}));
  const rawTarget = typeof body?.target === "string" ? body.target.trim() : "";
  const target = rawTarget || (channel === "email" ? (user.email ?? "") : "");

  if (channel === "email" && !EMAIL_RE.test(target)) {
    return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
  }
  if (channel === "discord" && !isDiscordWebhook(target)) {
    return NextResponse.json(
      { error: "Paste a valid Discord webhook URL (https://discord.com/api/webhooks/…)" },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { data: org } = await admin
    .from("organizations")
    .select("id")
    .eq("owner_id", user.id)
    .maybeSingle();
  if (!org) return NextResponse.json({ error: "No workspace found" }, { status: 500 });

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("org_id", org.id)
    .eq("channel", channel)
    .maybeSingle();

  if (existing) {
    const { error } = await admin
      .from("subscriptions")
      .update({ target, verified: true })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await admin.from("subscriptions").insert({
      org_id: org.id,
      channel,
      target,
      verified: true,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ connected: true, target });
}

export async function DELETE(_request: Request, { params }: Ctx) {
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

  const { error } = await admin
    .from("subscriptions")
    .delete()
    .eq("org_id", org?.id ?? "")
    .eq("channel", channel);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
