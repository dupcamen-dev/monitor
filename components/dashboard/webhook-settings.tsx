"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function WebhookSettings() {
  const [url, setUrl] = useState("https://hook.us1.make.com/…");
  const [secret, setSecret] = useState("sk_test_1234567890abcdef");
  const [draftUrl, setDraftUrl] = useState(url);
  const [draftSecret, setDraftSecret] = useState(secret);
  const [editOpen, setEditOpen] = useState(false);
  const [testing, setTesting] = useState(false);
  const { show } = useToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(secret);
      show("Secret key copied to clipboard");
    } catch {
      show("Could not copy — select the key manually", "error");
    }
  };

  const test = () => {
    setTesting(true);
    setTimeout(() => {
      setTesting(false);
      show("Test payload sent · 200 OK", "success");
    }, 1200);
  };

  const saveEdit = () => {
    setUrl(draftUrl);
    setSecret(draftSecret);
    setEditOpen(false);
    show("Webhook settings saved");
  };

  return (
    <section>
      <h2 className="mb-4 border-b border-outline-variant pb-2 text-headline-md text-on-surface">
        Webhooks
      </h2>
      <div className="rounded-lg border border-card-border bg-card p-6">
        <p className="mb-4 text-body-sm text-on-surface-variant">
          Send HTTP POST requests to external servers when monitor statuses change.
        </p>
        <div className="space-y-4">
          <div>
            <label className="mb-1 block font-mono text-code-label text-on-surface">URL Endpoint</label>
            <input
              type="text"
              readOnly
              value={url}
              className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface placeholder-outline-variant focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block font-mono text-code-label text-on-surface">Secret Key</label>
            <div className="relative flex">
              <input
                type="password"
                readOnly
                value={secret}
                className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 pr-10 font-mono text-code-label text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
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
            onClick={() => {
              setDraftUrl(url);
              setDraftSecret(secret);
              setEditOpen(true);
            }}
            className="flex-1 rounded bg-surface-container-high py-1.5 font-mono text-code-label text-on-surface transition-colors hover:bg-surface-variant"
          >
            Edit
          </button>
        </div>
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit webhook"
        subtitle="Update where UpStatus delivers event payloads."
        size="md"
        footer={
          <>
            <button onClick={() => setEditOpen(false)} className="inline-flex items-center rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            <button onClick={saveEdit} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90">
              <Icon name="save" size={16} />
              Save
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Field label="URL ENDPOINT">
            <input
              type="text"
              value={draftUrl}
              onChange={(e) => setDraftUrl(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field label="SECRET KEY" hint="Sent as an X-UpStatus-Signature header on every request.">
            <input
              type="text"
              value={draftSecret}
              onChange={(e) => setDraftSecret(e.target.value)}
              className={inputClass}
            />
          </Field>
        </div>
      </Modal>
    </section>
  );
}
