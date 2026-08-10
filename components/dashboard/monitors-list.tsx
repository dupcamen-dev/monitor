"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { Modal } from "@/components/ui/modal";
import { Field, inputClass } from "@/components/ui/field";
import { useToast } from "@/components/ui/toast";
import type { Monitor } from "@/lib/data";

const filters: { id: MonitorStatus | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "up", label: "Up" },
  { id: "degraded", label: "Degraded" },
  { id: "down", label: "Down" },
];

type MonitorStatus = "up" | "degraded" | "down";

export function MonitorsList({ monitors }: { monitors: Monitor[] }) {
  const [filter, setFilter] = useState<MonitorStatus | "all">("all");
  const { show } = useToast();
  const router = useRouter();

  /* Row action modal state */
  const [menuFor, setMenuFor] = useState<Monitor | null>(null);
  const [view, setView] = useState<"menu" | "edit" | "delete">("menu");
  const [editDraft, setEditDraft] = useState({ name: "", url: "" });

  const filtered = filter === "all" ? monitors : monitors.filter((m) => m.status === filter);

  const openMenu = (m: Monitor) => {
    setMenuFor(m);
    setView("menu");
  };

  const togglePause = async (m: Monitor) => {
    const pausing = !m.paused;
    try {
      const res = await fetch(`/api/monitors/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paused: pausing }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to update monitor");
      show(pausing ? `${m.name} paused` : `${m.name} resumed`, pausing ? "info" : "success");
      setMenuFor(null);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update monitor", "error");
    }
  };

  const runCheck = async (m: Monitor) => {
    try {
      const res = await fetch(`/api/monitors/${m.id}/check`, { method: "POST" });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Check failed");
      if (payload?.status === "up") show(`Check OK · ${payload.latencyMs}ms`, "success");
      else if (payload?.status === "degraded") show(`Check degraded · ${payload.latencyMs}ms`, "info");
      else show(`Check failed · ${m.name} is down`, "error");
      setMenuFor(null);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not run check", "error");
    }
  };

  const deleteMonitor = async (m: Monitor) => {
    try {
      const res = await fetch(`/api/monitors/${m.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete monitor");
      show(`Monitor "${m.name}" deleted`, "info");
      setMenuFor(null);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not delete monitor", "error");
    }
  };

  const saveEdit = async (m: Monitor, fields: { name: string; url: string }) => {
    try {
      const res = await fetch(`/api/monitors/${m.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fields.name, url: fields.url }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to update monitor");
      show(`Monitor "${fields.name}" updated`);
      setMenuFor(null);
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update monitor", "error");
    }
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((f) => {
          const active = filter === f.id;
          const count =
            f.id === "all" ? monitors.length : monitors.filter((m) => m.status === f.id).length;
          return (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              className={`rounded-lg px-4 py-2 font-mono text-code-label transition-colors ${
                active
                  ? "bg-primary text-on-primary"
                  : "border border-card-border text-on-surface-variant hover:border-surface-variant hover:text-on-surface"
              }`}
            >
              {f.label} <span className={active ? "text-on-primary/70" : "text-outline"}>{count}</span>
            </button>
          );
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-card-border bg-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-card-border">
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">MONITOR</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">STATUS</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">RESPONSE</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">UPTIME</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">CHECK</th>
              <th className="p-4" />
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {filtered.map((m) => (
              <tr key={m.id} className="transition-colors hover:bg-surface-container-low/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded border border-card-border bg-surface-container">
                      <Icon name={kindIcon(m.kind)} size={18} className="text-on-surface-variant" />
                    </div>
                    <div>
                      <div className="text-body-lg font-medium text-on-surface">{m.name}</div>
                      <div className="font-mono text-code-label text-on-surface-variant">{m.url}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  {m.paused ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-surface-variant" />
                      <span className="font-mono text-code-label text-on-surface-variant">PAUSED</span>
                    </span>
                  ) : (
                    <StatusCell status={m.status} />
                  )}
                </td>
                <td className="p-4 font-mono text-code-label text-on-surface-variant">
                  {m.latencyMs !== null ? `${m.latencyMs}ms` : "—"}
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-2 font-mono text-code-label">
                    <span className="text-on-surface">{m.uptime90}</span>
                    <span className="text-on-surface-variant">/ 90d</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-code-label text-on-surface-variant">
                  every {m.interval}
                </td>
                <td className="p-4">
                  <button
                    onClick={() => openMenu(m)}
                    aria-label={`Actions for ${m.name}`}
                    className="flex items-center rounded border border-card-border px-3 py-1.5 font-mono text-code-label text-on-surface-variant transition-colors hover:border-surface-variant hover:text-on-surface"
                  >
                    <Icon name="more_horiz" size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="p-10 text-center font-mono text-code-label text-on-surface-variant">
                  No monitors match this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Row action modal */}
      <Modal
        open={menuFor !== null}
        onClose={() => setMenuFor(null)}
        title={view === "menu" ? menuFor?.name ?? "Monitor" : view === "edit" ? `Edit ${menuFor?.name}` : "Delete monitor"}
        size={view === "edit" ? "md" : "sm"}
        footer={
          <>
            <button
              onClick={() => setMenuFor(null)}
              className="inline-flex items-center gap-2 rounded-lg border border-card-border px-4 py-2 font-mono text-code-label text-on-surface transition-colors hover:border-surface-variant"
            >
              {view === "menu" ? "Close" : "Cancel"}
            </button>
            {view === "edit" && (
              <button
                onClick={() => {
                  saveEdit(menuFor!, editDraft);
                  setMenuFor(null);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 font-mono text-code-label text-on-primary transition-colors hover:bg-primary/90"
              >
                <Icon name="save" size={16} />
                Save changes
              </button>
            )}
            {view === "delete" && (
              <button
                onClick={() => deleteMonitor(menuFor!)}
                className="inline-flex items-center gap-2 rounded-lg bg-error px-4 py-2 font-mono text-code-label text-on-error transition-colors hover:bg-error-container"
              >
                <Icon name="delete" size={16} />
                Delete monitor
              </button>
            )}
          </>
        }
      >
        {menuFor && view === "menu" && (
          <div className="flex flex-col gap-1">
            <ActionRow
              icon="edit"
              label="Edit monitor"
              onClick={() => {
                setEditDraft({ name: menuFor.name, url: menuFor.url });
                setView("edit");
              }}
            />
            <ActionRow
              icon={menuFor.paused ? "play_arrow" : "pause"}
              label={menuFor.paused ? "Resume monitoring" : "Pause monitoring"}
              onClick={() => togglePause(menuFor)}
            />
            <ActionRow icon="sensors" label="Run test check now" onClick={() => runCheck(menuFor)} />
            <ActionRow icon="delete" label="Delete monitor" danger onClick={() => setView("delete")} />
          </div>
        )}
        {menuFor && view === "delete" && (
          <p className="text-body-sm text-on-surface-variant">
            This will stop checking <span className="text-on-surface">{menuFor.name}</span> and remove
            its history. This action cannot be undone.
          </p>
        )}
        {menuFor && view === "edit" && (
          <EditFields value={editDraft} onChange={setEditDraft} />
        )}
      </Modal>
    </div>
  );
}

function StatusCell({ status }: { status: MonitorStatus }) {
  const map = {
    up: { text: "UP", cls: "text-up bg-up shadow-[0_0_8px_rgba(16,185,129,0.6)]" },
    degraded: { text: "DEGRADED", cls: "bg-tertiary shadow-[0_0_8px_rgba(255,179,173,0.6)]" },
    down: { text: "DOWN", cls: "bg-down shadow-[0_0_8px_rgba(239,68,68,0.6)]" },
  }[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${map.cls}`} />
      <span className={`font-mono text-code-label ${status === "up" ? "text-up" : status === "degraded" ? "text-tertiary" : "text-down"}`}>
        {map.text}
      </span>
    </span>
  );
}

function ActionRow({
  icon,
  label,
  onClick,
  danger,
}: {
  icon: string;
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-body-sm transition-colors ${
        danger
          ? "text-error hover:bg-error/10"
          : "text-on-surface hover:bg-surface-container-high"
      }`}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  );
}

function EditFields({
  value,
  onChange,
}: {
  value: { name: string; url: string };
  onChange: (v: { name: string; url: string }) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <Field label="MONITOR NAME">
        <input type="text" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} className={inputClass} />
      </Field>
      <Field label="TARGET">
        <input type="text" value={value.url} onChange={(e) => onChange({ ...value, url: e.target.value })} className={inputClass} />
      </Field>
      <p className="font-mono text-code-label text-on-surface-variant">
        Check cadence is set by your plan.
      </p>
    </div>
  );
}

function kindIcon(kind: string): string {
  switch (kind) {
    case "api":
      return "api";
    case "database":
      return "database";
    case "dashboard":
      return "monitoring";
    default:
      return "language";
  }
}
