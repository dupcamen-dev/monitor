"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { secToInterval } from "@/lib/interval";

function fmtDur(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

/* One shared throttle for auto-refreshes so N overdue bars don't spam router.refresh(). */
const AUTO_REFRESH_EVERY_MS = 30_000;
let lastAutoRefreshAt = 0;

export function NextCheckBar({
  lastCheckedAt,
  intervalSec,
  paused,
}: {
  lastCheckedAt: string | null;
  intervalSec: number;
  paused?: boolean;
}) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const intervalMs = intervalSec * 1000;
  const checkedAt = lastCheckedAt ? new Date(lastCheckedAt).getTime() : null;
  const elapsed = checkedAt !== null ? now - checkedAt : 0;
  const remaining = intervalMs - elapsed;
  const overdue = checkedAt !== null && elapsed >= intervalMs;

  /* While overdue, refresh the page periodically so the bar resets as soon as
     the cron lands the next check. */
  useEffect(() => {
    if (!overdue || paused) return;
    const attempt = () => {
      if (Date.now() - lastAutoRefreshAt >= AUTO_REFRESH_EVERY_MS) {
        lastAutoRefreshAt = Date.now();
        router.refresh();
      }
    };
    attempt();
    const id = setInterval(attempt, AUTO_REFRESH_EVERY_MS);
    return () => clearInterval(id);
  }, [overdue, paused, router]);

  if (paused) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-code-label text-on-surface-variant">paused · every {secToInterval(intervalSec)}</span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant" />
      </div>
    );
  }

  if (!lastCheckedAt) {
    return (
      <div className="flex flex-col gap-1.5">
        <span className="font-mono text-code-label text-tertiary">never checked · every {secToInterval(intervalSec)}</span>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant" />
      </div>
    );
  }

  const progress = Math.min(Math.max(elapsed / intervalMs, 0), 1);

  return (
    <div className="flex flex-col gap-1.5" title={new Date(lastCheckedAt).toISOString()}>
      <div className="flex items-center justify-between gap-3 font-mono text-code-label">
        <span className={overdue ? "font-medium text-down" : "text-on-surface"}>
          {overdue ? `overdue ${fmtDur(remaining * -1)}` : `next in ${fmtDur(remaining)}`}
        </span>
        <span className="text-on-surface-variant">every {secToInterval(intervalSec)}</span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-variant">
        <div
          className={`h-full rounded-full transition-[width] duration-1000 ease-linear ${
            overdue ? "bg-down" : "bg-primary"
          }`}
          style={{ width: `${progress * 100}%` }}
        />
      </div>
    </div>
  );
}
