import type { Channel } from "@/lib/data";
import { Icon } from "@/components/icon";

export function ChannelIcon({ channel, size = 24 }: { channel: Channel; size?: number }) {
  if (channel.icon === "telegram") {
    return (
      <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </svg>
    );
  }
  if (channel.icon === "whatsapp") {
    return (
      <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
        <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
      </svg>
    );
  }
  if (channel.icon === "slack") {
    return (
      <svg fill="none" height={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" width={size}>
        <path d="M14.5 3a2 2 0 0 0-4 0v13a2 2 0 0 0 4 0V3zM19.5 10a2 2 0 1 0 0-4h-13a2 2 0 1 0 0 4h13zM9.5 21a2 2 0 0 0 4 0V8a2 2 0 0 0-4 0v13zM4.5 14a2 2 0 1 0 4 0v-13a2 2 0 1 0-4 0v13z" />
      </svg>
    );
  }
  return <Icon name={channel.icon === "email" ? "mail" : "webhook"} size={size} />;
}
