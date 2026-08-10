"use client";

import { useToast } from "@/components/ui/toast";

export function SettingsSaveBar() {
  const { show } = useToast();

  return (
    <div className="sticky bottom-4 z-30">
      <div className="flex items-center justify-between gap-4 rounded-xl border border-card-border bg-surface-container-lowest/90 px-5 py-3 shadow-xl backdrop-blur-md">
        <p className="hidden font-mono text-code-label text-on-surface-variant sm:block">
          Unsaved changes in this workspace
        </p>
        <div className="flex flex-1 justify-end gap-3">
          <button
            onClick={() => show("Changes discarded", "info")}
            className="rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant"
          >
            Discard
          </button>
          <button
            onClick={() => show("Settings saved")}
            className="rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90"
          >
            Save changes
          </button>
        </div>
      </div>
    </div>
  );
}
