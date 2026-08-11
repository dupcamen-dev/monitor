import { createAdminClient } from "@/lib/supabase";
import { fetchBlockedSafe } from "@/lib/net";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN ?? "";
const RESEND_API_KEY = process.env.RESEND_API_KEY ?? "";
const EMAIL_FROM = process.env.EMAIL_FROM ?? "TopStatus <alerts@topstatus.space>";

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

async function sendDiscord(webhookUrl: string, text: string): Promise<boolean> {
  if (!webhookUrl) return false;
  try {
    const res = await fetchBlockedSafe(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  if (!RESEND_API_KEY) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({ from: EMAIL_FROM, to, subject, text: body }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function notifySubscribers(orgId: string, title: string, body: string) {
  const supabase = createAdminClient();
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("channel, target")
    .eq("org_id", orgId)
    .eq("verified", true);

  let sent = 0;
  for (const sub of subs ?? []) {
    if (sub.channel === "telegram") {
      const text = `⚠️ ${title}\n\n${body}`;
      if (await sendTelegram(sub.target, text)) sent += 1;
    } else if (sub.channel === "discord") {
      const text = `**${title}**\n\n${body}`;
      if (await sendDiscord(sub.target, text)) sent += 1;
    } else if (sub.channel === "email") {
      if (await sendEmail(sub.target, `TopStatus · ${title}`, body)) sent += 1;
    }
  }
  return sent;
}

export async function sendTelegramMessage(chatId: string, text: string) {
  return sendTelegram(chatId, text);
}

export async function sendTestAlert(channel: string, target: string): Promise<boolean> {
  if (channel === "email") {
    return sendEmail(target, "TopStatus · Test alert", "✅ This is a test alert from TopStatus. Your channel is connected and working.");
  }
  if (channel === "discord") {
    return sendDiscord(target, "**✅ Test alert**\nThis is a test alert from TopStatus. Your channel is connected and working.");
  }
  return false;
}
