"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

export function SubscribeButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const { show } = useToast();

  const submit = () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }
    setDone(true);
    show("Subscription confirmed");
  };

  return (
    <>
      <button
        onClick={() => {
          setDone(false);
          setError("");
          setOpen(true);
        }}
        className="rounded bg-primary px-4 py-2 text-body-sm text-on-primary transition-colors hover:bg-primary/90"
      >
        Subscribe to updates
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Get status updates" subtitle="Be the first to know about outages and maintenance." size="sm">
        {done ? (
          <div className="flex flex-col items-center gap-3 py-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-up/15">
              <Icon name="check_circle" filled size={26} className="text-up" />
            </div>
            <p className="text-body-lg font-semibold text-on-surface">You&apos;re subscribed</p>
            <p className="max-w-xs text-body-sm text-on-surface-variant">
              We&apos;ll send updates for <span className="text-on-surface">Acme Corp</span> to{" "}
              <span className="font-mono text-code-label text-primary">{email}</span>.
            </p>
            <button
              onClick={() => setOpen(false)}
              className="mt-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90"
            >
              Done
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <Field label="EMAIL ADDRESS">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                placeholder="you@company.com"
                className={inputClass}
                autoFocus
              />
            </Field>
            {error && (
              <p className="flex items-center gap-2 font-mono text-code-label text-error">
                <Icon name="error" size={16} />
                {error}
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setOpen(false)} className="flex-1 rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
                Cancel
              </button>
              <button onClick={submit} className="flex-1 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90">
                Subscribe
              </button>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
