"use client";

import { useEffect, useState } from "react";

export function LiveClock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return (
    <span className="inline-flex items-center gap-2 font-mono text-code-label text-on-surface-variant">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-up shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
      Live · {hh}:{mm}:{ss}
    </span>
  );
}
