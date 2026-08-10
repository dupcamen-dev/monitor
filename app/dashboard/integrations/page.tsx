import type { Metadata } from "next";
import { Container } from "@/components/container";
import { TelegramCard } from "@/components/dashboard/telegram-card";
import { LinkedChannelCard } from "@/components/dashboard/linked-channel-card";
import { WebhookSettings } from "@/components/dashboard/webhook-settings";
import { channels } from "@/lib/data";

export const metadata: Metadata = {
  title: "Integrations & Notifications",
};

export default function IntegrationsPage() {
  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <header className="mb-12">
          <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">
            Integrations &amp; Notifications
          </h1>
          <p className="mt-2 max-w-2xl text-body-lg text-on-surface-variant">
            Configure communication channels and webhooks to receive critical system status alerts.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Channels */}
            <section>
              <h2 className="mb-4 border-b border-outline-variant pb-2 text-headline-md text-on-surface">
                Notification Channels
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {channels.map((channel) =>
                  channel.id === "telegram" ? (
                    <TelegramCard key={channel.id} channel={channel} />
                  ) : (
                    <LinkedChannelCard key={channel.id} channel={channel} />
                  )
                )}
              </div>
            </section>
          </div>

          {/* Right column */}
          <div className="space-y-6">
            <WebhookSettings />
          </div>
        </div>
      </Container>
    </div>
  );
}
