"use client";

import { useState } from "react";
import type { Channel } from "@/lib/data";
import { ChannelIcon } from "@/components/channel-icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

const configFields: Record<string, { label: string; placeholder: string; hint: string }> = {
  telegram: {
    label: "CHAT ID",
    placeholder: "@upstatus_bot",
    hint: "The Telegram chat or channel that receives alerts.",
  },
  whatsapp: {
    label: "WHATSAPP NUMBER",
    placeholder: "+380 00 000 0000",
    hint: "Messages are delivered to this number via WhatsApp Business API.",
  },
  email: {
    label: "EMAIL ADDRESS",
    placeholder: "ops@acme.dev",
    hint: "Alerts and digests are sent to this inbox.",
  },
  slack: {
    label: "WEBHOOK URL",
    placeholder: "https://hooks.slack.com/services/…",
    hint: "Paste your Slack incoming webhook URL.",
  },
};

export function ChannelCard({ channel }: { channel: Channel }) {
  const [connected, setConnected] = useState(channel.connected);
  const [configOpen, setConfigOpen] = useState(false);
  const [value, setValue] = useState(channel.meta);
  const { show } = useToast();

  const field = configFields[channel.id];

  const saveConfig = () => {
    show(`${channel.name} configuration saved`);
    setConfigOpen(false);
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-lg border border-card-border bg-card p-6">
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-32 w-32 rounded-full opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        style={{ backgroundColor: `${channel.color}1A` }}
      />
      <div className="z-10 mb-6 flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className="flex h-10 w-10 items-center justify-center rounded"
            style={{ backgroundColor: `${channel.color}1A`, color: channel.color }}
          >
            <ChannelIcon channel={channel} />
          </div>
          <div>
            <h4 className="text-body-lg font-bold text-on-surface">{channel.name}</h4>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`h-2 w-2 rounded-full ${
                  connected ? "bg-up shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-card-border"
                }`}
              />
              <span className={`font-mono text-code-label ${connected ? "text-on-surface-variant" : "text-outline"}`}>
                {connected ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="z-10 mb-6 flex-1 text-body-sm text-on-surface-variant">{channel.description}</p>
      <div className="z-10 flex items-center justify-between border-t border-card-border pt-4">
        <span className="font-mono text-code-label text-on-surface-variant">{channel.meta}</span>
        {connected ? (
          <button
            onClick={() => {
              setValue(channel.meta);
              setConfigOpen(true);
            }}
            className="rounded border border-card-border px-4 py-1.5 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant hover:text-white"
          >
            Configure
          </button>
        ) : (
          <button
            onClick={() => {
              setConnected(true);
              show(`${channel.name} connected`);
            }}
            className="rounded bg-primary px-4 py-1.5 font-mono text-code-label text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container"
          >
            Connect
          </button>
        )}
      </div>

      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title={`Configure ${channel.name}`}
        subtitle={`Deliver alerts to your ${channel.name} destination.`}
        size="sm"
        footer={
          <>
            <button
              onClick={() => {
                setConnected(false);
                setConfigOpen(false);
                show(`${channel.name} disconnected`, "info");
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-error/40 px-4 py-2 font-mono text-code-label text-error transition-colors hover:bg-error/10"
            >
              <span className="material-symbols-outlined text-[14px]">link_off</span>
              Disconnect
            </button>
            <div className="flex flex-1 justify-end gap-2">
              <button onClick={() => setConfigOpen(false)} className="rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
                Cancel
              </button>
              <button onClick={saveConfig} className="rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90">
                Save
              </button>
            </div>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          {field && (
            <Field label={field.label} hint={field.hint}>
              <input
                type="text"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={field.placeholder}
                className={inputClass}
                autoFocus
              />
            </Field>
          )}
          <div className="flex items-center justify-between gap-4 rounded-lg border border-card-border bg-surface-container-lowest p-4">
            <div>
              <p className="text-body-sm font-medium text-on-surface">Test on save</p>
              <p className="mt-0.5 font-mono text-code-label text-on-surface-variant">
                Send a test alert to verify the channel works.
              </p>
            </div>
            <span className="font-mono text-code-label text-on-surface-variant">Always</span>
          </div>
        </div>
      </Modal>
    </div>
  );
}
