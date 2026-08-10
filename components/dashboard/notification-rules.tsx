"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { Toggle } from "@/components/toggle";
import { useToast } from "@/components/ui/toast";

interface Rule {
  id: string;
  icon: string;
  iconClass: string;
  title: string;
  meta: string;
  on: boolean;
}

const initialRules: Rule[] = [
  {
    id: "r1",
    icon: "warning",
    iconClass: "bg-error/10 text-error",
    title: "Notify immediately on DOWN",
    meta: "Applies to: All monitors",
    on: true,
  },
  {
    id: "r2",
    icon: "check_circle",
    iconClass: "bg-secondary-container/10 text-secondary-container",
    title: "Notify on recovery (UP)",
    meta: "Delay: 1 minute for confirmation",
    on: true,
  },
  {
    id: "r3",
    icon: "history_toggle_off",
    iconClass: "bg-surface-container text-on-surface-variant",
    title: "Daily digest summary",
    meta: "Every day at 09:00 (Europe/Kyiv)",
    on: false,
  },
];

const rulePresets = [
  {
    label: "Notify on degraded performance",
    meta: "Latency above 500ms for 2 consecutive checks",
    icon: "speed",
  },
  {
    label: "Escalate after 15 minutes",
    meta: "Re-alert if a DOWN state lasts longer than 15 minutes",
    icon: "priority_high",
  },
  {
    label: "Quiet hours",
    meta: "Suppress non-critical alerts between 23:00 and 07:00",
    icon: "bedtime",
  },
];

const iconStyles = [
  "bg-primary/10 text-primary",
  "bg-secondary-container/10 text-secondary-container",
  "bg-tertiary/10 text-tertiary",
];

export function NotificationRules() {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [open, setOpen] = useState(false);
  const [preset, setPreset] = useState(rulePresets[0]);
  const [scope, setScope] = useState("All monitors");
  const { show } = useToast();

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, on: !r.on } : r)));
  };

  const addRule = () => {
    const iconClass = iconStyles[rules.length % iconStyles.length];
    setRules((prev) => [
      ...prev,
      {
        id: `r${Date.now()}`,
        icon: preset.icon,
        iconClass,
        title: preset.label,
        meta: `${scope} · ${preset.meta}`,
        on: true,
      },
    ]);
    show(`Rule "${preset.label}" added`);
    setOpen(false);
  };

  return (
    <section>
      <h2 className="mb-4 mt-8 border-b border-outline-variant pb-2 text-headline-md text-on-surface">
        Notification Rules
      </h2>
      <div className="overflow-hidden rounded-lg border border-card-border bg-card">
        {rules.map((rule, i) => (
          <div
            key={rule.id}
            className={`flex items-center justify-between p-4 transition-colors hover:bg-surface-container-low ${
              i < rules.length - 1 ? "border-b border-card-border" : ""
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded ${rule.iconClass}`}>
                <Icon name={rule.icon} size={18} />
              </div>
              <div>
                <p className="text-body-lg text-on-surface">{rule.title}</p>
                <p className="font-mono text-code-label text-on-surface-variant">{rule.meta}</p>
              </div>
            </div>
            <Toggle checked={rule.on} onChange={() => toggleRule(rule.id)} label={rule.title} />
          </div>
        ))}
        <div className="bg-surface-container-lowest p-4">
          <button
            onClick={() => setOpen(true)}
            className="flex items-center gap-2 font-mono text-code-label text-primary transition-colors hover:text-primary-container"
          >
            <Icon name="add" size={16} />
            Add Rule
          </button>
        </div>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Add notification rule"
        subtitle="Automate when and how your team gets alerted."
        size="md"
        footer={
          <>
            <button onClick={() => setOpen(false)} className="inline-flex items-center rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant">
              Cancel
            </button>
            <button onClick={addRule} className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90">
              <Icon name="add" size={16} />
              Add rule
            </button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <Field label="TRIGGER">
            <div className="flex flex-col gap-2">
              {rulePresets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => setPreset(p)}
                  className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                    preset.label === p.label
                      ? "border-primary bg-primary/5"
                      : "border-card-border hover:border-surface-variant"
                  }`}
                >
                  <Icon name={p.icon} size={20} className={preset.label === p.label ? "text-primary" : "text-on-surface-variant"} />
                  <span>
                    <span className="block text-body-sm font-medium text-on-surface">{p.label}</span>
                    <span className="block font-mono text-code-label text-on-surface-variant">{p.meta}</span>
                  </span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="APPLIES TO">
            <select value={scope} onChange={(e) => setScope(e.target.value)} className={inputClass}>
              <option>All monitors</option>
              <option>API monitors</option>
              <option>Website monitors</option>
              <option>Database monitors</option>
            </select>
          </Field>
        </div>
      </Modal>
    </section>
  );
}
