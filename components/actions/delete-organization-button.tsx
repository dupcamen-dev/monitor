"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function DeleteOrganizationButton({ orgName }: { orgName: string }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);
  const { show } = useToast();
  const router = useRouter();

  const canDelete = confirm.trim() === "DELETE";

  const submit = async () => {
    if (!canDelete) return;
    setDeleting(true);
    try {
      const res = await fetch("/api/organization", { method: "DELETE" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to delete organization");

      const supabase = createBrowserSupabase();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not delete organization", "error");
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded border border-error/40 px-4 py-2 font-mono text-code-label text-error transition-colors hover:bg-error/10"
      >
        <Icon name="delete" size={16} />
        Delete
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Delete organization"
        subtitle="This action cannot be undone."
        size="sm"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="inline-flex items-center rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!canDelete || deleting}
              className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 font-mono text-code-label text-on-error transition-colors hover:bg-error-container disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon name="delete" size={16} />
              {deleting ? "Deleting…" : "Delete forever"}
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <p className="text-body-sm text-on-surface-variant">
            This permanently removes <span className="text-on-surface">{orgName}</span>, all of its
            monitors and 90-day history. To confirm, type{" "}
            <span className="font-mono text-code-label text-error">DELETE</span> below.
          </p>
          <Field label="TYPE TO CONFIRM">
            <input
              type="text"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              className={inputClass}
              autoFocus
            />
          </Field>
        </div>
      </Modal>
    </>
  );
}
