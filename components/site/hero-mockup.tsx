"use client";

import { useEffect, useRef, useState } from "react";
import type { MouseEvent } from "react";
import { Icon } from "@/components/icon";

type MonitorRow = {
  name: string;
  kind: string;
  status: "up" | "down";
  latency: string;
  bars: number[];
};

const MONITORS: MonitorRow[] = [
  {
    name: "Main Website",
    kind: "website",
    status: "up",
    latency: "124ms",
    bars: [100, 96, 88, 100, 100, 92, 100],
  },
  {
    name: "API Gateway",
    kind: "api",
    status: "up",
    latency: "45ms",
    bars: [92, 100, 100, 86, 100, 96, 100],
  },
  {
    name: "Postgres (Primary)",
    kind: "database",
    status: "down",
    latency: "—",
    bars: [100, 62, 40, 18, 0, 0, 0],
  },
  {
    name: "Customer Dashboard",
    kind: "dashboard",
    status: "up",
    latency: "88ms",
    bars: [100, 100, 94, 100, 90, 100, 100],
  },
];

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

export function HeroMockup() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el || reduced) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -7, y: px * 9 });
  }

  function handleLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div className="relative" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      <div aria-hidden className="mockup-glow absolute -inset-x-16 -bottom-24 h-64" />
      <div
        ref={ref}
        className="shadow-deep relative rounded-2xl border border-card-border bg-card/95 backdrop-blur transition-transform duration-300 ease-out"
        style={{ transform: `perspective(1400px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-card-border px-5 py-3.5">
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-down/80" />
            <span className="h-3 w-3 rounded-full bg-tertiary/80" />
            <span className="h-3 w-3 rounded-full bg-up/80" />
          </div>
          <div className="mx-auto flex items-center gap-2 rounded-md border border-card-border bg-surface-container-lowest px-4 py-1.5 font-mono text-code-label text-on-surface-variant">
            <Icon name="lock" size={13} />
            topstatus.space/dashboard
          </div>
          <div className="w-16" />
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 pt-6">
          <div>
            <p className="font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
              Monitors
            </p>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="status-pulse h-2.5 w-2.5 rounded-full bg-up" />
              <span className="text-lg font-semibold text-on-surface">All systems operational</span>
            </div>
          </div>
          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-md border border-card-border px-3 py-1.5 font-mono text-code-label text-on-surface-variant">
              + Add monitor
            </span>
            <span className="btn-shine rounded-md bg-primary px-3 py-1.5 font-mono text-code-label font-medium text-on-primary">
              Run check
            </span>
          </div>
        </div>

        {/* Monitor rows */}
        <div className="flex flex-col gap-2.5 px-6 py-6">
          {MONITORS.map((m, i) => (
            <div
              key={m.name}
              className="row-in flex items-center justify-between gap-4 rounded-xl border border-card-border bg-surface-container-lowest/80 px-4 py-3"
              style={{ animationDelay: `${0.15 + i * 0.12}s` }}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                    m.status === "up" ? "bg-up status-pulse" : "bg-down"
                  }`}
                />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-medium text-on-surface">{m.name}</p>
                  <p className="font-mono text-code-label text-on-surface-variant">{m.kind}</p>
                </div>
              </div>
              <div className="hidden h-5 items-end gap-[3px] sm:flex">
                {m.bars.map((h, bi) => (
                  <span
                    key={bi}
                    className={`bar-grow w-[6px] rounded-sm ${
                      h === 0 ? "bg-down" : h < 50 ? "bg-tertiary" : m.status === "up" ? "bg-up" : "bg-down"
                    }`}
                    style={{ height: `${h}%`, animationDelay: `${0.5 + i * 0.12 + bi * 0.06}s` }}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-code-label text-on-surface-variant">{m.latency}</span>
                <span
                  className={`rounded-full px-2.5 py-1 font-mono text-code-label uppercase ${
                    m.status === "up" ? "bg-up/15 text-up" : "bg-down/15 text-down"
                  }`}
                >
                  {m.status === "up" ? "Operational" : "Down"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating cards */}
      <div className="animate-float absolute -left-8 top-14 z-10 hidden items-center gap-3 rounded-xl border border-card-border bg-surface-container-lowest px-4 py-3 shadow-premium lg:flex">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-up/15 text-up">
          <Icon name="check_circle" filled size={20} />
        </span>
        <div>
          <p className="text-body-sm font-medium text-on-surface">All systems operational</p>
          <p className="font-mono text-code-label text-on-surface-variant">Checks every minute</p>
        </div>
      </div>

      <div
        className="animate-float-slow absolute -right-10 top-1/3 z-10 hidden items-center gap-3 rounded-xl border border-card-border bg-surface-container-lowest px-4 py-3 shadow-premium lg:flex"
        style={{ animationDelay: "-3s" }}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-down/15 text-down">
          <Icon name="notification_important" size={20} />
        </span>
        <div>
          <p className="text-body-sm font-medium text-on-surface">New incident</p>
          <p className="font-mono text-code-label text-on-surface-variant">Postgres is down</p>
        </div>
      </div>

      <div
        className="animate-float absolute -left-12 bottom-10 z-10 hidden items-center gap-3 rounded-xl border border-card-border bg-surface-container-lowest px-4 py-3 shadow-premium lg:flex"
        style={{ animationDelay: "-5s" }}
      >
        <div className="flex h-9 w-12 items-end gap-[2px] pb-1">
          {[70, 90, 60, 100, 80, 100, 95].map((h, bi) => (
            <span
              key={bi}
              className="bar-grow w-[5px] rounded-sm bg-secondary"
              style={{ height: `${h}%`, animationDelay: `${1.2 + bi * 0.05}s` }}
            />
          ))}
        </div>
        <div>
          <p className="text-body-sm font-medium text-on-surface">99.98% uptime</p>
          <p className="font-mono text-code-label text-on-surface-variant">Last 90 days</p>
        </div>
      </div>
    </div>
  );
}
