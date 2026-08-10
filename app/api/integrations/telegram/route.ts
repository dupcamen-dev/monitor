import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/notify";

export const dynamic = "force-dynamic";

const LINKED = "✅ Linked! Alerts for your monitors will arrive in this chat.";
const LINK_FIRST =
  "To connect, open your UpStatus dashboard → Integrations → Telegram → Connect, then tap the link or send the code there.";

function cleanText(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: true });

  const update = await request.json().catch(() => null);
  const chatId = update?.message?.chat?.id;
  const text = typeof update?.message?.text === "string" ? cleanText(update.message.text) : "";

  if (typeof chatId !== "number") return NextResponse.json({ ok: true });

  const supabase = createAdminClient();

  if (text === "/start") {
    await sendTelegramMessage(String(chatId), LINK_FIRST);
    return NextResponse.json({ ok: true });
  }

  if (text.startsWith("/start ")) {
    const linkToken = text.slice("/start ".length).trim();

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("token", linkToken)
      .eq("channel", "telegram")
      .eq("verified", false)
      .maybeSingle();

    if (!sub) {
      await sendTelegramMessage(String(chatId), "This link is invalid or already used. Please connect again from your dashboard.");
      return NextResponse.json({ ok: true });
    }

    const { error } = await supabase
      .from("subscriptions")
      .update({ target: String(chatId), verified: true, token: null })
      .eq("id", sub.id);

    await sendTelegramMessage(String(chatId), error ? "Something went wrong. Please try again later." : LINKED);
    return NextResponse.json({ ok: true });
  }

  if (text === "/stop") {
    const { error } = await supabase
      .from("subscriptions")
      .delete()
      .eq("channel", "telegram")
      .eq("target", String(chatId));

    await sendTelegramMessage(String(chatId), error ? "Something went wrong." : "Unsubscribed. Alerts will stop.");
    return NextResponse.json({ ok: true });
  }

  await sendTelegramMessage(String(chatId), "Use /start to link this chat to UpStatus.");
  return NextResponse.json({ ok: true });
}
