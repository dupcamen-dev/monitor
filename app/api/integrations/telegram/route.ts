import { NextResponse } from "next/server";
import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";
import { sendTelegramMessage } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) return NextResponse.json({ ok: true, message: "Telegram bot not configured" });

  const update = await request.json().catch(() => null);
  const chatId = update?.message?.chat?.id;
  const text = typeof update?.message?.text === "string" ? update.message.text : "";

  if (typeof chatId !== "number") return NextResponse.json({ ok: true });

  const target = String(chatId);
  const supabase = createAdminClient();

  if (text.startsWith("/start")) {
    const { error } = await supabase
      .from("subscriptions")
      .upsert({ org_id: DEFAULT_ORG_ID, channel: "telegram", target, verified: true }, { onConflict: "channel,target" });

    await sendTelegramMessage(
      target,
      error ? "Something went wrong. Please try again later." : "Thanks for subscribing! You'll get notified about incidents."
    );
  } else {
    await sendTelegramMessage(target, "Use /start to subscribe to incident alerts.");
  }

  return NextResponse.json({ ok: true });
}
