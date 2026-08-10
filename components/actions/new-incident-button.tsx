"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import { statusPageMonitors } from "@/lib/data";

const incidentStates = [
  { label: "Investigating", tone: "danger" },
  { label: "Identified", tone: "danger" },
  { label: "Monitoring", tone: "neutral" },
  { label: "Resolved", tone: "success" },
] as const;

export function NewIncidentButton() {
  const [open, setOpen] = useState(false);
  const { show } = useToast();

  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [state, setState] = useState<(typeof incidentStates)[number]["label"]>("Investigating");
  const [impacted, setImpacted] = useState<string[]>(["API"]);
  const [error, setError] = useState("");

  const toggleImpact = (name: string) => {
    setImpacted((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  };

  const submit = () => {
    if (!title.trim()) {
      setError("Incident title is required.");
      return;
    }
    if (!message.trim()) {
      setError("Incident message is required.");
      return;
    }
    show(`Incident "${title.trim()}" published to status page`);
    setOpen(false);
    setTitle("");
    setMessage("");
    setError("");
    setState("Investigating");
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90"
      >
        <Icon name="add" size={16} />
        New incident
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Declare incident"
        subtitle="This will appear on your public status page."
        size="md"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="inline-flex items-center rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            <button onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90">
              <Icon name="bolt" size={16} />
              Declare incident
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Field label="TITLE">
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setError("");
              }}
              placeholder="API Connection Issues"
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field label="CURRENT STATUS">
            <div className="flex flex-wrap gap-2">
              {incidentStates.map((s) => (
                <button
                  key={s.label}
                  onClick={() => setState(s.label)}
                  className={`rounded px-3 py-1.5 font-mono text-code-label transition-colors ${
                    state === s.label
                      ? s.tone === "danger"
                        ? "bg-error-container/30 text-error"
                        : s.tone === "success"
                          ? "bg-up/20 text-up"
                          : "bg-surface-container-high text-on-surface"
                      : "border border-card-border text-on-surface-variant hover:border-surface-variant hover:text-on-surface"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label="IMPACTED COMPONENTS">
            <div className="flex flex-wrap gap-2">
              {statusPageMonitors.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleImpact(m.name)}
                  className={`rounded px-3 py-1.5 font-mono text-code-label transition-colors ${
                    impacted.includes(m.name)
                      ? "bg-primary text-on-primary"
                      : "border border-card-border text-on-surface-variant hover:border-surface-variant hover:text-on-surface"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </Field>
          <Field label="MESSAGE">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="We are investigating reports of elevated latency on our API endpoints."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </Field>
          {error && (
            <p className="flex items-center gap-2 font-mono text-code-label text-error">
              <Icon name="error" size={16} />
              {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
