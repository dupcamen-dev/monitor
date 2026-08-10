"use client";

import { useState } from "react";
import { AddMonitorButton } from "@/components/actions/add-monitor-button";
import { MonitorsList } from "@/components/dashboard/monitors-list";
import type { Monitor } from "@/lib/data";
import { uptimePct, genHistory } from "@/lib/data";

export function MonitorsManager({ monitors: initial }: { monitors: Monitor[] }) {
  const [monitors, setMonitors] = useState(initial);

  return (
    <div>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Monitors</h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Websites, APIs and databases you are watching.
          </p>
        </div>
        <AddMonitorButton
          label="Add monitor"
          onCreated={(m) => {
            const history = genHistory(Date.now() % 1000);
            const monitor: Monitor = {
              id: `m${Date.now()}`,
              name: m.name,
              kind: m.kind,
              url: m.url,
              status: "up",
              latencyMs: Math.floor(20 + Math.random() * 180),
              history,
              uptime30: uptimePct(history.slice(-30)),
              uptime90: uptimePct(history),
              interval: m.interval.replace("every ", ""),
            };
            setMonitors((prev) => [monitor, ...prev]);
          }}
        />
      </div>
      <MonitorsList monitors={monitors} />
    </div>
  );
}
