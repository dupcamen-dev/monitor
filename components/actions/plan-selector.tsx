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
    cadence: "checks every minute",
    desc: "Faster detection with 1-minute checks. Crypto checkout via NowPayments.",
  },
  {
    key: "yearly",
    name: "Yearly",
    price: "$150/yr",
    cadence: "checks every minute",
    desc: "One year of Pro checks. Crypto checkout via NowPayments.",
  },
];

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(iso));
}

export function PlanSelector({ plan, expiresAt }: { plan: PlanKey; expiresAt: string | null }) {
  const [paying, setPaying] = useState<PlanKey | null>(null);
  const { show } = useToast();

  const downgradeToFree = async () => {
    try {
      const res = await fetch("/api/settings/plan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "free" }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Failed to update plan");
      show("Plan switched to Free");
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not update plan", "error");
    }
  };

  const startPayment = async (key: PlanKey) => {
    if (key === "free") return;
    setPaying(key);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: key }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Could not start payment");
      window.location.assign(payload.invoiceUrl);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not start payment", "error");
      setPaying(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      {plans.map((p) => {
        const isActive = plan === p.key;
        const isPaying = paying === p.key;
        const yearlyLocked = plan === "yearly" && p.key === "paid" && expiresAt !== null;
        return (
          <div
            key={p.key}
            className={`flex flex-col gap-3 rounded-xl border p-5 transition-colors ${
              isActive
                ? "border-primary bg-primary/5"
                : "border-card-border bg-surface-container-lowest hover:border-surface-variant"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-body-lg font-medium text-on-surface">{p.name}</span>
              {isActive && <Icon name="check_circle" size={18} className="text-primary" />}
            </div>
            <span className="text-display-lg-mobile text-on-surface">{p.price}</span>
            <span className="font-mono text-code-label text-primary">{p.cadence}</span>
            <span className="text-body-sm text-on-surface-variant">{p.desc}</span>

            {isActive ? (
              <div className="mt-auto text-body-sm text-on-surface-variant">
                {expiresAt
                  ? `Active until ${formatDate(expiresAt)}`
                  : p.key === "free"
                    ? "You are on the free plan."
                    : "Active"}
              </div>
            ) : yearlyLocked ? (
              <div className="mt-auto flex flex-col gap-1.5">
                <div className="text-body-sm text-on-surface-variant">Included in your yearly plan.</div>
                <button
                  onClick={() => show("Monthly is unavailable while your yearly plan is active.", "info")}
                  className="inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-body-sm text-on-surface-variant"
                  disabled
                >
                  <Icon name="lock" size={16} />
                  Unavailable
                </button>
              </div>
            ) : p.key === "free" ? (
              <button
                onClick={downgradeToFree}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg border border-border px-4 py-2 text-body-sm text-on-surface transition-colors hover:bg-surface-container-low"
              >
                Switch to Free
              </button>
            ) : (
              <button
                onClick={() => startPayment(p.key)}
                disabled={isPaying}
                className="mt-auto inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-body-sm font-medium text-on-primary transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                <Icon name="currency_bitcoin" size={16} />
                {isPaying ? "Opening checkout…" : `Pay ${p.price.split("/")[0]} via crypto`}
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}
