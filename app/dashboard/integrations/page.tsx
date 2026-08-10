import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Icon } from "@/components/icon";
import { ChannelCard } from "@/components/dashboard/channel-card";
import { TelegramCard } from "@/components/dashboard/telegram-card";
import { NotificationRules } from "@/components/dashboard/notification-rules";
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
            Configure communication channels to receive critical system status alerts. Manage rules and
            webhooks.
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
                    <ChannelCard key={channel.id} channel={channel} />
                  )
                )}
              </div>
            </section>

            {/* Rules */}
            <NotificationRules />
          </div>

          {/* Right column */}
          <div className="space-y-6">
            {/* Webhooks */}
            <WebhookSettings />

            {/* Docs promo */}
            <div className="flex items-start gap-4 rounded-lg border border-card-border bg-gradient-to-br from-card to-surface p-4">
              <Icon name="book" size={20} className="text-outline" />
              <div>
                <h4 className="mb-1 text-body-sm font-bold text-on-surface">API Documentation</h4>
                <p className="mb-2 font-mono text-code-label text-on-surface-variant">
                  Explore the JSON payload format for integration with your own systems.
                </p>
                <a href="#" className="font-mono text-code-label text-primary hover:underline">
                  Read Docs →
                </a>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
