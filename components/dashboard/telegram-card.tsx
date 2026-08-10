"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Channel } from "@/lib/data";
import { ChannelIcon } from "@/components/channel-icon";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/ui/toast";

type LinkState =
  | { status: "loading" }
  | { status: "notConnected" }
  | { status: "pending"; token: string; deepLink: string }
  | { status: "connected"; chatId: string };

interface LinkResponse {
  connected: boolean;
  pending?: boolean;
  token?: string;
  deepLink?: string;
  chatId?: string;
  error?: string;
}

const POLL_INTERVAL = 2500;
const POLL_TIMEOUT = 120000;

export function TelegramCard({ channel }: { channel: Channel }) {
  const [state, setState] = useState<LinkState>({ status: "loading" });
  const [busy, setBusy] = useState(false);
  const [polling, setPolling] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const { show } = useToast();

  const stopPolling = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
    setPolling(false);
  }, []);

  const applyResponse = useCallback(
    (data: LinkResponse) => {
      if (data.connected) {
        setState({ status: "connected", chatId: data.chatId ?? "" });
        stopPolling();
      } else if (data.pending && data.token) {
        setState({ status: "pending", token: data.token, deepLink: data.deepLink ?? "" });
      } else {
        setState({ status: "notConnected" });
      }
    },
    [stopPolling]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch("/api/integrations/telegram/link", { cache: "no-store" });
      if (cancelled) return;
      if (!res.ok) {
        setState({ status: "notConnected" });
        return;
      }
      applyResponse(await res.json());
    })();
    return () => {
      cancelled = true;
      stopPolling();
    };
  }, [applyResponse, stopPolling]);

  const startPolling = useCallback(() => {
    if (timer.current) return;
    setPolling(true);
    const started = Date.now();
    timer.current = setInterval(async () => {
      if (Date.now() - started > POLL_TIMEOUT) {
        stopPolling();
        show("Still waiting for Telegram… open the link in the app.", "info");
        return;
      }
      const res = await fetch("/api/integrations/telegram/link", { cache: "no-store" });
      if (!res.ok) return;
      const data: LinkResponse = await res.json();
      if (data.connected && data.chatId) {
        setState({ status: "connected", chatId: data.chatId });
        stopPolling();
        show("Telegram connected", "success");
      }
    }, POLL_INTERVAL);
  }, [show, stopPolling]);

  const connect = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/integrations/telegram/link", { method: "POST", cache: "no-store" });
      const data: LinkResponse = await res.json();
      if (!res.ok || data.error) throw new Error(data.error ?? "Could not start connection");
      if (data.connected && data.chatId) {
        setState({ status: "connected", chatId: data.chatId });
      } else if (data.token) {
        setState({ status: "pending", token: data.token, deepLink: data.deepLink ?? "" });
        startPolling();
      }
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not connect", "error");
    } finally {
      setBusy(false);
    }
  }, [show, startPolling]);

  const disconnect = useCallback(async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/integrations/telegram/link", { method: "DELETE", cache: "no-store" });
      if (!res.ok) throw new Error("Could not disconnect");
      stopPolling();
      setState({ status: "notConnected" });
      show("Telegram disconnected", "info");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not disconnect", "error");
    } finally {
      setBusy(false);
    }
  }, [show, stopPolling]);

  const copyDeepLink = useCallback(async () => {
    if (state.status !== "pending") return;
    try {
      await navigator.clipboard.writeText(state.deepLink);
      show("Link copied — open it in Telegram");
    } catch {
      show("Could not copy — tap the link below", "error");
    }
  }, [state, show]);

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
                  state.status === "connected"
                    ? "bg-up shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : state.status === "pending"
                      ? "animate-pulse bg-primary"
                      : "bg-card-border"
                }`}
              />
              <span
                className={`font-mono text-code-label ${
                  state.status === "connected"
                    ? "text-on-surface-variant"
                    : state.status === "pending"
                      ? "text-primary"
                      : "text-outline"
                }`}
              >
                {state.status === "loading"
                  ? "Checking…"
                  : state.status === "pending"
                    ? "Awaiting confirmation"
                    : state.status === "connected"
                      ? "Connected"
                      : "Not connected"}
              </span>
            </div>
          </div>
        </div>
      </div>
      <p className="z-10 mb-6 flex-1 text-body-sm text-on-surface-variant">{channel.description}</p>

      {state.status === "pending" && (
        <div className="z-10 mb-4 rounded-lg border border-primary/30 bg-primary/5 p-4">
          <p className="mb-2 font-mono text-code-label text-primary">1 · Open the link in Telegram</p>
          <p className="mb-2 font-mono text-code-label text-primary">2 · Tap “Start” in the chat</p>
          <p className="mb-3 font-mono text-code-label text-on-surface-variant">
            Or send the code{" "}
            <span className="rounded bg-surface-container-lowest px-1.5 py-0.5 text-on-surface">{state.token}</span>{" "}
            to the bot.
          </p>
          {state.deepLink ? (
            <div className="flex gap-2">
              <a
                href={state.deepLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 rounded bg-primary px-4 py-2 text-center font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90"
              >
                Open Telegram
              </a>
              <button
                onClick={copyDeepLink}
                className="rounded border border-card-border px-3 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant"
              >
                Copy
              </button>
            </div>
          ) : (
            <button
              onClick={copyDeepLink}
              className="w-full rounded bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90"
            >
              Copy code
            </button>
          )}
          <div className="mt-3 flex items-center gap-2 font-mono text-code-label text-on-surface-variant">
            <Icon name={polling ? "sync" : "refresh"} size={14} className={polling ? "animate-spin" : ""} />
            {polling ? "Waiting for confirmation…" : "Check again"}
          </div>
        </div>
      )}

      <div className="z-10 flex items-center justify-between border-t border-card-border pt-4">
        <span className="font-mono text-code-label text-on-surface-variant">
          {state.status === "connected"
            ? `@${channel.meta.replace(/^@/, "")} · chat ${state.chatId}`
            : channel.meta}
        </span>
        {state.status === "connected" ? (
          <button
            onClick={disconnect}
            disabled={busy}
            className="rounded border border-error/40 px-4 py-1.5 font-mono text-code-label text-error transition-colors hover:bg-error/10 disabled:opacity-60"
          >
            Disconnect
          </button>
        ) : state.status === "pending" ? (
          <button
            onClick={disconnect}
            disabled={busy}
            className="rounded border border-card-border px-4 py-1.5 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant disabled:opacity-60"
          >
            Cancel
          </button>
        ) : (
          <button
            onClick={connect}
            disabled={busy}
            className="rounded bg-primary px-4 py-1.5 font-mono text-code-label text-on-primary transition-colors hover:bg-primary-container hover:text-on-primary-container disabled:opacity-60"
          >
            {busy ? "Connecting…" : "Connect"}
          </button>
        )}
      </div>
    </div>
  );
}
