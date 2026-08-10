"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/components/ui/toast";
import type { MonitorKind } from "@/lib/data";

const monitorTypes: { label: string; kind: MonitorKind }[] = [
  { label: "HTTP (Website)", kind: "website" },
  { label: "API Endpoint", kind: "api" },
  { label: "Database", kind: "database" },
  { label: "Dashboard / App", kind: "dashboard" },
];

const intervals = ["30s", "1m", "5m", "15m"];

export interface NewMonitorPayload {
  name: string;
  url: string;
  kind: MonitorKind;
  interval: string;
  notify: boolean;
}

interface AddMonitorButtonProps {
  label?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onCreated?: (monitor: NewMonitorPayload) => void;
}

export function AddMonitorButton({
  label = "New monitor",
  variant = "primary",
  className = "",
  onCreated,
}: AddMonitorButtonProps) {
  const [open, setOpen] = useState(false);
  const { show } = useToast();

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [typeLabel, setTypeLabel] = useState(monitorTypes[0].label);
  const [interval, setInterval] = useState("1m");
  const [notify, setNotify] = useState(true);
  const [error, setError] = useState("");

  const reset = () => {
    setName("");
    setUrl("");
    setTypeLabel(monitorTypes[0].label);
    setInterval("1m");
    setNotify(true);
    setError("");
  };

  const submit = () => {
    if (!name.trim()) {
      setError("Monitor name is required.");
      return;
    }
    if (!url.trim()) {
      setError("Target URL is required.");
      return;
    }
    if (!/^https?:\/\/.+/.test(url.trim())) {
      setError("Target must start with http:// or https://.");
      return;
    }
    const kind = monitorTypes.find((t) => t.label === typeLabel)!.kind;
    onCreated?.({ name: name.trim(), url: url.trim(), kind, interval, notify });
    show(`Monitor "${name.trim()}" created`);
    setOpen(false);
    reset();
  };

  const base =
    variant === "primary"
      ? "bg-primary text-on-primary hover:bg-primary/90 shadow-sm border border-transparent"
      : "border border-card-border text-on-surface hover:border-surface-variant";

  return (
    <>
      <button onClick={() => setOpen(true)} className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 font-mono text-code-label transition-colors ${base} ${className}`}>
        <Icon name="add" size={16} />
        {label}
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add monitor"
        subtitle="Start watching a website, API or database."
        size="md"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="inline-flex items-center rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            <button onClick={submit} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90">
              <Icon name="monitor_heart" size={16} />
              Create monitor
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Field label="MONITOR NAME" hint="Shown in your dashboard and on the status page.">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Main Website"
              className={inputClass}
              autoFocus
            />
          </Field>
          <Field label="TARGET" hint="The address UpStatus will check on every interval.">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://acme.dev"
              className={inputClass}
            />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="TYPE">
              <select value={typeLabel} onChange={(e) => setTypeLabel(e.target.value)} className={inputClass}>
                {monitorTypes.map((t) => (
                  <option key={t.label}>{t.label}</option>
                ))}
              </select>
            </Field>
            <Field label="CHECK INTERVAL">
              <select value={interval} onChange={(e) => setInterval(e.target.value)} className={inputClass}>
                {intervals.map((i) => (
                  <option key={i}>every {i}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-lg border border-card-border bg-surface-container-lowest p-4">
            <div>
              <p className="text-body-sm font-medium text-on-surface">Notify on downtime</p>
              <p className="mt-0.5 font-mono text-code-label text-on-surface-variant">
                Send alerts via configured channels.
              </p>
            </div>
            <Toggle checked={notify} onChange={setNotify} label="Notify on downtime" />
          </div>
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
