export function telegramBotUsername(): string {
  return (process.env.TELEGRAM_BOT_USERNAME ?? "").replace(/^@/, "").trim();
}
