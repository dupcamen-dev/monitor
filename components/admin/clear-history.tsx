"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

type Target = "payments" | "visits";

const LABELS: Record<Target, { title: string; desc: string }> = {
  payments: {
    title: "Clear payment history",
    desc: "Deletes every row from the payments table — revenue figures and the payment ledger will reset to zero.",
  },
  visits: {
    title: "Clear visit history",
    desc: "Deletes every row from page_visits — traffic stats, top pages and active-user counts will reset.",
  },
};

export function ClearHistory() {
  const { show } = useToast();
  const [openFor, setOpenFor] = useState<Target | null>(null);
  const [confirm, setConfirm] = useState("");
  const [clearing, setClearing] = useState(false);

  const canClear = confirm.trim().toUpperCase() === "CLEAR";

  const submit = async () => {
    if (!openFor || !canClear) return;
    setClearing(true);
    try {
      const res = await fetch("/api/admin/history", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: openFor }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Could not clear history");
      show(`Cleared ${payload?.cleared ?? 0} rows`);
      setOpenFor(null);
      setConfirm("");
      window.location.reload();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not clear history", "error");
    } finally {
      setClearing(false);
    }
  };

  return (
    <section className="rounded-xl border border-error-container/40 bg-error-container/5 p-6">
      <h2 className="mb-4 border-b border-error-container/40 pb-3 text-headline-md text-error">
        Data
      </h2>
      <div className="flex flex-col gap-4">
        {(Object.keys(LABELS) as Target[]).map((target) => (
          <div key={target} className="flex items-center justify-between gap-4">
            <div>
              <p className="text-body-lg text-on-surface">{LABELS[target].title}</p>
              <p className="mt-1 font-mono text-code-label text-on-surface-variant">
                {LABELS[target].desc}
              </p>
            </div>
            <button
              onClick={() => {
                setConfirm("");
                setOpenFor(target);
              }}
              className="shrink-0 inline-flex items-center gap-2 rounded border border-error/40 px-4 py-2 font-mono text-code-label text-error transition-colors hover:bg-error/10"
            >
              <Icon name="delete" size={16} />
              Clear
            </button>
          </div>
        ))}
      </div>

      <Modal
        open={openFor !== null}
        onClose={() => setOpenFor(null)}
        title={openFor ? LABELS[openFor].title : ""}
        subtitle="This action cannot be undone."
        size="sm"
        footer={
          <>
            <button
              onClick={() => setOpenFor(null)}
              className="rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant"
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!canClear || clearing}
              className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 font-mono text-code-label text-on-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="delete" size={16} />
              {clearing ? "Clearing…" : "Clear forever"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-body-sm text-on-surface-variant">
            {openFor ? LABELS[openFor].desc : ""}
          </p>
          <Field label="TYPE CLEAR TO CONFIRM">
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="CLEAR"
              className={inputClass}
              autoFocus
            />
          </Field>
        </div>
      </Modal>
    </section>
  );
}
