"use client";

import { useState } from "react";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";

interface SeoSettings {
  title: string;
  description: string;
  keywords: string | null;
  og_title: string | null;
  og_description: string | null;
  updated_at: string | null;
  updated_by: string | null;
}

export function SeoForm({ initial }: { initial: SeoSettings }) {
  const { show } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: initial.title,
    description: initial.description,
    keywords: initial.keywords ?? "",
    og_title: initial.og_title ?? "",
    og_description: initial.og_description ?? "",
  });

  const set = (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/seo", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) {
        show(payload?.error ?? "Could not save", "error");
        return;
      }
      show("SEO settings saved");
    } catch {
      show("Could not save SEO settings", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-card-border bg-card p-6">
        <div className="flex flex-col gap-5">
          <Field label="TITLE" hint={`~60 chars recommended · currently ${form.title.length}`}>
            <input
              type="text"
              value={form.title}
              onChange={set("title")}
              maxLength={80}
              className={inputClass}
              placeholder="TopStatus — Monitoring & Status Pages"
            />
          </Field>
          <Field label="DESCRIPTION" hint={`~160 chars recommended · currently ${form.description.length}`}>
            <textarea
              value={form.description}
              onChange={set("description")}
              rows={3}
              maxLength={320}
              className={`${inputClass} resize-none`}
              placeholder="Uptime monitoring and status pages in one place."
            />
          </Field>
          <Field label="KEYWORDS" hint="Comma-separated">
            <input
              type="text"
              value={form.keywords}
              onChange={set("keywords")}
              className={inputClass}
              placeholder="uptime monitoring, status page, uptime checker"
            />
          </Field>
          <Field label="OG TITLE">
            <input
              type="text"
              value={form.og_title}
              onChange={set("og_title")}
              className={inputClass}
              placeholder="Optional — defaults to title"
            />
          </Field>
          <Field label="OG DESCRIPTION">
            <textarea
              value={form.og_description}
              onChange={set("og_description")}
              rows={2}
              className={`${inputClass} resize-none`}
              placeholder="Optional — defaults to description"
            />
          </Field>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={save}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-60"
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
        {initial.updated_at && (
          <span className="font-mono text-code-label text-on-surface-variant">
            Updated {new Date(initial.updated_at).toLocaleDateString("en-GB")}
            {initial.updated_by ? ` by ${initial.updated_by}` : ""}
          </span>
        )}
      </div>
    </div>
  );
}
