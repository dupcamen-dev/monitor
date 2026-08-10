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
  if (channel.icon === "discord") {
    return (
      <svg fill="currentColor" height={size} viewBox="0 0 24 24" width={size}>
        <path d="M20.32 4.37a19.8 19.8 0 0 0-4.93-1.51 13.8 13.8 0 0 0-.64 1.28 18.27 18.27 0 0 0-5.5 0 13.8 13.8 0 0 0-.64-1.28 19.74 19.74 0 0 0-4.93 1.51C.53 9.05-.32 13.58.1 18.06a19.9 19.9 0 0 0 6.07 3.05 14.6 14.6 0 0 0 1.31-2.11 12.9 12.9 0 0 1-2.06-1 9.7 9.7 0 0 0 .5-.39 14.08 14.08 0 0 0 12.16 0c.17.14.34.27.5.39a12.9 12.9 0 0 1-2.07 1 14.6 14.6 0 0 0 1.31 2.11 19.88 19.88 0 0 0 6.07-3.05c.5-5.24-.84-9.72-3.58-13.69ZM8.02 15.33c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Zm7.96 0c-1.18 0-2.16-1.08-2.16-2.42 0-1.33.95-2.42 2.16-2.42 1.21 0 2.18 1.09 2.16 2.42 0 1.34-.95 2.42-2.16 2.42Z" />
      </svg>
    );
  }
  return <Icon name={channel.icon === "email" ? "mail" : "webhook"} size={size} />;
}
