import { createAdminClient, DEFAULT_ORG_ID } from "@/lib/supabase";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";

async function sendTelegram(chatId: string, text: string): Promise<boolean> {
  if (!BOT_TOKEN) return false;
  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: Number(chatId), text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifySubscribers(title: string, body: string) {
  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("channel, target")
    .eq("org_id", DEFAULT_ORG_ID)
    .eq("verified", true);

  let sent = 0;
  for (const sub of subs ?? []) {
    if (sub.channel === "telegram") {
      const text = `⚠️ ${title}\n\n${body}`;
      if (await sendTelegram(sub.target, text)) sent += 1;
    }
  }
  return sent;
}

export async function sendTelegramMessage(chatId: string, text: string) {
  return sendTelegram(chatId, text);
}
