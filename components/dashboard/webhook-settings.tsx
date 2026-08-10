"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function WebhookSettings() {
  const [configured, setConfigured] = useState(false);
  const [url, setUrl] = useState("");
  const [secret, setSecret] = useState("");
  const [draftUrl, setDraftUrl] = useState("");
  const [draftSecret, setDraftSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const { show } = useToast();

  useEffect(() => {
    fetch("/api/webhooks")
      .then((res) => res.json())
      .then((data) => {
        if (data && data.url) {
          setConfigured(true);
          setUrl(data.url);
          setSecret(data.secret ?? "");
          setDraftUrl(data.url);
          setDraftSecret(data.secret ?? "");
        }
      })
      .catch(() => show("Could not load webhook settings", "error"))
      .finally(() => setLoading(false));
  }, [show]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret || draftSecret);
      show("Secret key copied to clipboard");
    } catch {
      show("Could not copy — select the key manually", "error");
    }
  };

  const openEdit = () => {
    setDraftUrl(url);
    setDraftSecret(secret);
    setEditOpen(true);
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/webhooks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: draftUrl, secret: draftSecret }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to save webhook");
      setUrl(draftUrl);
      setSecret(draftSecret);
      setConfigured(true);
      setEditOpen(false);
      show("Webhook settings saved");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not save webhook", "error");
    } finally {
      setSaving(false);
    }
  };

  const test = async () => {
    if (!configured) {
      openEdit();
      show("Configure a webhook URL first");
      return;
    }
    setTesting(true);
    try {
      const res = await fetch("/api/webhooks/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, secret }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Test failed");
      if (!payload?.ok) throw new Error("Endpoint did not confirm the delivery");
      show("Test payload delivered · 200 OK", "success");
    } catch (e) {
      show(e instanceof Error ? e.message : "Test failed", "error");
    } finally {
      setTesting(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/webhooks", { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to remove webhook");
      setConfigured(false);
      setUrl("");
      setSecret("");
      setEditOpen(false);
      show("Webhook removed");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not remove webhook", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section>
      <h2 className="mb-4 border-b border-outline-variant pb-2 text-headline-md text-on-surface">
        Webhooks
      </h2>
      <div className="rounded-lg border border-card-border bg-card p-6">
        <p className="mb-4 text-body-sm text-on-surface-variant">
          Send HTTP POST requests to an external server when a monitor goes down or recovers.
        </p>

        {loading ? (
          <p className="font-mono text-code-label text-on-surface-variant">Loading…</p>
        ) : !configured ? (
          <button
            onClick={openEdit}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-card-border py-3 font-mono text-code-label text-primary transition-colors hover:border-surface-variant"
          >
            <Icon name="add" size={16} />
            Configure webhook
          </button>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block font-mono text-code-label text-on-surface">URL Endpoint</label>
                <input
                  type="text"
                  readOnly
                  value={url}
                  className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-1 block font-mono text-code-label text-on-surface">Secret Key</label>
                <div className="relative flex">
                  <input
                    type="password"
                    readOnly
                    value={secret}
                    className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 pr-10 font-mono text-code-label text-on-surface focus:outline-none"
                  />
                  <button
                    onClick={copy}
                    aria-label="Copy secret key"
                    className="absolute right-2 top-2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    <Icon name="content_copy" size={18} />
                  </button>
                </div>
              </div>
            </div>
            <div className="mt-4 flex gap-2 border-t border-card-border pt-4">
              <button
                onClick={test}
                disabled={testing}
                className="flex-1 rounded border border-card-border bg-transparent py-1.5 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant disabled:opacity-50"
              >
                {testing ? "Sending…" : "Test"}
              </button>
              <button
                onClick={openEdit}
                className="flex-1 rounded bg-surface-container-high py-1.5 font-mono text-code-label text-on-surface transition-colors hover:bg-surface-variant"
              >
                Edit
              </button>
            </div>
          </>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={configured ? "Edit webhook" : "Configure webhook"}
        subtitle="Receive JSON payloads when monitor status changes."
        size="md"
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="inline-flex items-center rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            {configured && (
              <button onClick={remove} disabled={saving} className="inline-flex items-center rounded-lg border border-error/30 px-4 py-2 font-mono text-code-label text-error transition-colors hover:border-error disabled:opacity-50">
                Remove
              </button>
            )}
            <button onClick={saveEdit} disabled={saving} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-50">
              <Icon name="save" size={16} />
              {saving ? "Saving…" : "Save"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Field label="URL ENDPOINT" hint="Example: https://your-server.com/upstatus-hook or a Make.com webhook URL.">
            <input
              type="text"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              placeholder="https://hook.us1.make.com/…"
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field label="SECRET KEY (optional)" hint="Sent as an X-UpStatus-Signature header (SHA-256 HMAC) on every request.">
            <input
              type="text"
              value={draftSecret}
              onChange={(e) => setDraftSecret(e.target.value)}
              placeholder="sk_…"
              className={inputClass}
            />
          </Field>
        </div>
      </Modal>
    </section>
  );
}
