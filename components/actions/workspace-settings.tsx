"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/ui/toast";
import { TIMEZONES } from "@/lib/timezones";

const inputClass =
  "w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none";

export function WorkspaceSettings({
  name: initialName,
  slug: initialSlug,
  timezone: initialTimezone,
}: {
  name: string;
  slug: string;
  timezone: string;
}) {
  const [name, setName] = useState(initialName);
  const [slug, setSlug] = useState(initialSlug);
  const [timezone, setTimezone] = useState(initialTimezone);
  const [saving, setSaving] = useState(false);
  const { show } = useToast();

  const dirty = useMemo(
    () => name !== initialName || slug !== initialSlug || timezone !== initialTimezone,
    [name, slug, timezone, initialName, initialSlug, initialTimezone]
  );

  const discard = () => {
    setName(initialName);
    setSlug(initialSlug);
    setTimezone(initialTimezone);
  };

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings/general", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug, timezone }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to save settings");
      show("Settings saved");
      window.location.reload();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <label className="mb-1 block font-mono text-code-label text-on-surface">ORGANIZATION NAME</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
      </div>
      <div>
        <label className="mb-1 block font-mono text-code-label text-on-surface">STATUS PAGE SLUG</label>
        <input
          type="text"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="acme"
          className={inputClass}
        />
        <Link
          href={`/s/${slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1.5 inline-flex items-center gap-1 text-body-sm text-primary hover:underline"
        >
          <Icon name="open_in_new" size={14} />
          Public page: topstatus.space/s/{slug}
        </Link>
      </div>
      <div>
        <label className="mb-1 block font-mono text-code-label text-on-surface">TIMEZONE</label>
        <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className={inputClass}>
          {TIMEZONES.map((tz) => (
            <option key={tz.value} value={tz.value}>
              {tz.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-end gap-3 border-t border-card-border pt-4">
        <button
          onClick={discard}
          disabled={!dirty}
          className="rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant disabled:opacity-50"
        >
          Discard
        </button>
        <button
          onClick={save}
          disabled={!dirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Icon name="save" size={16} />
          {saving ? "Saving…" : "Save changes"}
        </button>
      </div>
      {dirty && (
        <p className="-mt-2 font-mono text-code-label text-on-surface-variant">
          Unsaved changes in this workspace
        </p>
      )}
    </div>
  );
}
