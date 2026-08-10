import type { DayState } from "@/lib/data";

const barClass: Record<DayState, string> = {
  up: "bg-up",
  partial: "bg-tertiary",
  down: "bg-down",
  nodata: "bg-surface-variant",
};

interface UptimeBarsProps {
  history: DayState[];
  height?: number;
  label?: boolean;
}

export function UptimeBars({ history, height = 32, label = true }: UptimeBarsProps) {
  return (
    <div>
      <div className="flex w-full gap-[2px]" role="img" aria-label="Uptime history for the last 90 days">
        {history.map((day, i) => (
          <div
            key={i}
            title={`Day ${i + 1}`}
            className={`flex-1 rounded-[2px] transition-opacity hover:opacity-70 ${barClass[day]}`}
            style={{ height }}
          />
        ))}
      </div>
      {label && (
        <div className="mt-2 flex items-center justify-between font-mono text-code-label text-on-surface-variant">
          <span>90 days ago</span>
          <span className="font-mono text-code-label text-on-surface">Today</span>
        </div>
      )}
    </div>
  );
}
