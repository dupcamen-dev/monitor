import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase";
import { getUserOrgId } from "@/lib/auth-org";
import { telegramBotUsername } from "@/lib/telegram";

export const dynamic = "force-dynamic";

function deepLink(token: string): string {
  const bot = telegramBotUsername();
  return bot ? `https://t.me/${bot}?start=${token}` : "";
}

export async function GET() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("subscriptions")
    .select("id, target, token, verified")
    .eq("org_id", orgId)
    .eq("channel", "telegram")
    .maybeSingle();

  if (!data) {
    return NextResponse.json({ connected: false, botUsername: telegramBotUsername() });
  }

  if (data.verified) {
    return NextResponse.json({
      connected: true,
      chatId: data.target,
      botUsername: telegramBotUsername(),
    });
  }

  return NextResponse.json({
    connected: false,
    pending: true,
    token: data.token,
    deepLink: data.token ? deepLink(data.token) : "",
    botUsername: telegramBotUsername(),
  });
}

export async function POST() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("subscriptions")
    .select("id, target, token, verified")
    .eq("org_id", orgId)
    .eq("channel", "telegram")
    .maybeSingle();

  if (existing?.verified) {
    return NextResponse.json({ connected: true, chatId: existing.target, botUsername: telegramBotUsername() });
  }

  if (existing?.token) {
    return NextResponse.json({
      connected: false,
      pending: true,
      token: existing.token,
      deepLink: deepLink(existing.token),
      botUsername: telegramBotUsername(),
    });
  }

  const token = randomBytes(12).toString("hex");
  const { data: created, error } = await supabase
    .from("subscriptions")
    .insert({ org_id: orgId, channel: "telegram", target: "", token, verified: false })
    .select("id, target, token, verified")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    connected: false,
    pending: true,
    token: created.token,
    deepLink: deepLink(created.token),
    botUsername: telegramBotUsername(),
  });
}

export async function DELETE() {
  const orgId = await getUserOrgId();
  if (!orgId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("subscriptions")
    .delete()
    .eq("org_id", orgId)
    .eq("channel", "telegram");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
