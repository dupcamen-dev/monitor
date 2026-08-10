"use client";

import { useCallback, useEffect, useState } from "react";
import type { Channel } from "@/lib/data";
import { ChannelIcon } from "@/components/channel-icon";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

type CardState =
  | { status: "loading" }
  | { status: "notConnected"; suggestedTarget: string; senderConfigured: boolean }
  | { status: "connected"; target: string; senderConfigured: boolean };

interface LinkResponse {
  connected: boolean;
  target?: string;
  suggestedTarget?: string;
  senderConfigured?: boolean;
  error?: string;
}

const placeholders: Record<string, { label: string; placeholder: string; hint: string }> = {
  email: {
    label: "EMAIL ADDRESS",
    placeholder: "you@example.com",
    hint: "Alerts and digests are sent to this inbox.",
  },
  discord: {
    label: "DISCORD WEBHOOK URL",
    placeholder: "https://discord.com/api/webhooks/…",
    hint: "Paste your Discord incoming webhook URL.",
  },
};

const discordSteps = [
  {
    title: "Open Discord",
    body: "Sign in to Discord on desktop or in the browser. If you have no server, click the + icon on the left and choose “Create My Own” — it takes under a minute.",
  },
  {
    title: "Open your channel",
    body: "Go to the text channel where you want alerts (for example #alerts). You can create a new channel with the + next to “Text Channels”.",
  },
  {
    title: "Create a webhook",
    body: "Right-click the channel → Edit Channel → Integrations → Webhooks → New Webhook. Give it a name (e.g. “TopStatus Alerts”).",
  },
  {
    title: "Copy the URL",
    body: "Click “Copy Webhook URL” — it looks like https://discord.com/api/webhooks/<ID>/<TOKEN>. You need the “Manage Webhooks” permission; server owners have it by default.",
  },
  {
    title: "Paste and connect",
    body: "Paste the copied URL into the field below and click Save, then press Test to send a confirmation message to the channel.",
  },
];

export function LinkedChannelCard({ channel }: { channel: Channel }) {
  const [state, setState] = useState<CardState>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { show } = useToast();

  const field = placeholders[channel.id];

  const applyResponse = useCallback((data: LinkResponse) => {
    if (data.connected) {
      setState({ status: "connected", target: data.target ?? "", senderConfigured: data.senderConfigured ?? true });
    } else {
      setState({
        status: "notConnected",
        suggestedTarget: data.suggestedTarget ?? "",
        senderConfigured: data.senderConfigured ?? true,
      });
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/integrations/link/${channel.id}`, { cache: "no-store" });
      if (cancelled) return;
      if (!res.ok) {
        setState({ status: "notConnected", suggestedTarget: "", senderConfigured: true });
        return;
      }
      applyResponse(await res.json());
    })();
    return () => {
      cancelled = true;
    };
  }, [channel.id, applyResponse]);

  const openConfig = useCallback(() => {
    setDraft(
      state.status === "connected" ? state.target : state.status === "notConnected" ? state.suggestedTarget : ""
    );
    setConfigOpen(true);
  }, [state]);

  const saveConfig = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/integrations/link/${channel.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: draft }),
        cache: "no-store",
      });
      const data: LinkResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Could not connect");
      setState({ status: "connected", target: data.target ?? draft, senderConfigured: true });
      setConfigOpen(false);
      show(`${channel.name} connected`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not connect", "error");
    } finally {
      setBusy(false);
    }
  }, [channel.id, channel.name, draft, show]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/integrations/link/${channel.id}`, { method: "DELETE", cache: "no-store" });
      if (!res.ok) throw new Error("Could not disconnect");
      setConfigOpen(false);
      setState((prev) =>
        prev.status === "connected"
          ? { status: "notConnected", suggestedTarget: "", senderConfigured: prev.senderConfigured }
          : prev
      );
      show(`${channel.name} disconnected`, "info");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not disconnect", "error");
    } finally {
      setBusy(false);
    }
  }, [channel.id, channel.name, show]);

  const sendTest = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch(`/api/integrations/link/${channel.id}/test`, { method: "POST", cache: "no-store" });
      const data: LinkResponse = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Test failed");
      show(`Test alert sent to ${channel.name}`, "success");
    } catch (e) {
      show(e instanceof Error ? e.message : "Test failed", "error");
    } finally {
      setBusy(false);
    }
  }, [channel.id, channel.name, show]);

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
                  state.status === "connected" ? "bg-up shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-card-border"
                }`}
              />
              <span
                className={`font-mono text-code-label ${state.status === "connected" ? "text-on-surface-variant" : "text-outline"}`}
              >
                {state.status === "loading" ? "Checking…" : state.status === "connected" ? "Connected" : "Not connected"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="z-10 mb-6 flex-1 text-body-sm text-on-surface-variant">{channel.description}</p>

      {state.status === "connected" && !state.senderConfigured && (
        <div className="z-10 mb-4 flex items-start gap-2 rounded-lg border border-tertiary/30 bg-tertiary/5 p-3">
          <Icon name="info" size={16} className="mt-0.5 text-tertiary" />
          <p className="font-mono text-code-label text-on-surface-variant">
            Emails won&apos;t be delivered until RESEND_API_KEY is configured.
          </p>
        </div>
      )}

      <div className="z-10 flex items-center justify-between gap-3 border-t border-card-border pt-4">
        <span className="min-w-0 flex-1 truncate font-mono text-code-label text-on-surface-variant">
          {state.status === "connected" ? state.target : channel.meta}
        </span>
        {state.status === "connected" ? (
          <div className="flex shrink-0 gap-2">
            <button
              onClick={sendTest}
              disabled={busy}
              className="rounded border border-card-border px-3 py-1.5 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant disabled:opacity-60"
            >
              {busy ? "Sending…" : "Test"}
            </button>
            <button
              onClick={openConfig}
              className="rounded border border-card-border px-3 py-1.5 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant"
            >
              Configure
            </button>
            <button
              onClick={disconnect}
              disabled={busy}
              className="rounded border border-error/40 px-3 py-1.5 font-mono text-code-label text-error transition-colors hover:bg-error/10 disabled:opacity-60"
            >
              Disconnect
            </button>
          </div>
        ) : (
          <button
            onClick={openConfig}
            disabled={busy}
            className="shrink-0 rounded bg-primary px-4 py-1.5 font-mono text-code-label text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-60"
          >
            Connect
          </button>
        )}
      </div>

      <Modal
        open={configOpen}
        onClose={() => setConfigOpen(false)}
        title={state.status === "connected" ? `Configure ${channel.name}` : `Connect ${channel.name}`}
        subtitle={`Deliver alerts to your ${channel.name} destination.`}
        size="sm"
        footer={
          <>
            <button onClick={() => setConfigOpen(false)} className="rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            <button
              onClick={saveConfig}
              disabled={busy}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-60"
            >
              {busy ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        {field && (
          <Field label={field.label} hint={field.hint}>
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder={field.placeholder}
              className={inputClass}
              autoFocus
            />
          </Field>
        )}

        {channel.id === "discord" && (
          <details className="group rounded-lg border border-card-border bg-surface-container-lowest">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3 font-mono text-code-label text-on-surface transition-colors hover:text-primary">
              <span className="flex items-center gap-2">
                <Icon name="help_outline" size={16} />
                How to get a Discord webhook URL
              </span>
              <Icon name="expand_more" size={16} className="transition-transform group-open:rotate-180" />
            </summary>
            <ol className="flex flex-col gap-3 border-t border-card-border px-4 py-4">
              {discordSteps.map((step, i) => (
                <li key={step.title} className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-code-label text-primary">
                    {i + 1}
                  </span>
                  <p className="font-mono text-code-label text-on-surface-variant">
                    <span className="text-on-surface">{step.title}.</span> {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </details>
        )}
      </Modal>
    </div>
  );
}
