import type { Incident, UpdateTone } from "@/lib/data";

const pillStyle: Record<UpdateTone, string> = {
  success: "bg-up/15 text-up",
  neutral: "bg-surface-variant text-on-surface",
  danger: "bg-error-container/25 text-error",
};

export function IncidentTimeline({ incident }: { incident: Incident }) {
  return (
    <div className="relative border-l-2 border-card-border pl-6 pb-8">
      <div className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-card-border" />
      <h3 className="text-body-lg font-semibold text-on-surface">{incident.title}</h3>
      <p className="mt-1 font-mono text-code-label text-on-surface-variant">
        {incident.dateLabel} · {incident.impacted.join(", ")}
      </p>
      <div className="mt-5 flex flex-col gap-4">
        {incident.updates.map((u, i) => (
          <div key={i}>
            <div className="mb-1 flex items-center gap-2">
              <span className="font-mono text-code-label text-on-surface-variant">{u.time}</span>
              <span className={`rounded px-2 py-0.5 font-mono text-code-label ${pillStyle[u.tone]}`}>
                {u.label}
              </span>
            </div>
            <p className="text-body-sm text-on-surface-variant">{u.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
