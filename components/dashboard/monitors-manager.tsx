"use client";

import { AddMonitorButton } from "@/components/actions/add-monitor-button";
import { MonitorsList } from "@/components/dashboard/monitors-list";
import type { Monitor } from "@/lib/data";

export function MonitorsManager({
  monitors,
  checkInterval,
}: {
  monitors: Monitor[];
  checkInterval: string;
}) {
  return (
    <div>
      <div className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Monitors</h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Websites, APIs and databases you are watching.
          </p>
        </div>
        <AddMonitorButton label="Add monitor" checkInterval={checkInterval} />
      </div>
      <MonitorsList monitors={monitors} />
    </div>
  );
}
