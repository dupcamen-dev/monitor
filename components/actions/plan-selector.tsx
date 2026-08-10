"use client";

import { useState } from "react";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/ui/toast";

export type PlanKey = "free" | "paid" | "yearly";

const plans: { key: PlanKey; name: string; price: string; cadence: string; desc: string }[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    cadence: "checks every 1 hour",
    desc: "For side projects and small teams getting started.",
  },
  {
    key: "paid",
    name: "Paid",
    price: "$19/mo",
    cadence: "checks every 5 minutes",
    desc: "Faster detection with 5-minute checks and full history.",
  },
  {
    key: "yearly",
    name: "Yearly",
    price: "$150/yr",
    cadence: "checks every 5 minutes",
    desc: "One year of Pro checks. Auto-expires after 12 months.",
  },
];

export function PlanSelector({ plan }: { plan: PlanKey }) {
  const [active, setActive] = useState<PlanKey>(plan);
  const { show } = useToast();

  const select = async (key: PlanKey) => {
    setActive(key);
    try {
      const res = await fetch("/api/settings/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: key }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to update plan");
      const label = plans.find((p) => p.key === key)?.name ?? key;
      show(`Plan switched to ${label}`);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update plan", "error");
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {plans.map((p) => {
        const activePlan = active === p.key;
        return (
          <button
            key={p.key}
            onClick={() => select(p.key)}
            className={`flex flex-col gap-2 rounded-xl border p-5 text-left transition-colors ${
              activePlan
                ? "border-primary bg-primary/5"
                : "border-card-border bg-surface-container-lowest hover:border-surface-variant"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-lg font-medium text-on-surface">{p.name}</span>
              {activePlan && <Icon name="check_circle" size={18} className="text-primary" />}
            </div>
            <span className="text-display-lg-mobile text-on-surface">{p.price}</span>
            <span className="font-mono text-code-label text-primary">{p.cadence}</span>
            <span className="text-body-sm text-on-surface-variant">{p.desc}</span>
          </button>
        );
      })}
    </div>
  );
}
