"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/ui/toast";

export type PayablePlan = "paid" | "yearly";

export function PayPlanButton({
  plan,
  label,
  primary,
}: {
  plan: PayablePlan;
  label: string;
  primary?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const { show } = useToast();

  const pay = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/payments/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });
      const payload = await res.json().catch(() => null);
      if (res.status === 401) {
        router.push("/login");
        return;
      }
      if (!res.ok) throw new Error(payload?.error ?? "Could not start payment");
      window.location.assign(payload.invoiceUrl);
    } catch (e) {
      show(e instanceof Error ? e.message : "Could not start payment", "error");
      setBusy(false);
    }
  };

  return (
    <button
      onClick={pay}
      disabled={busy}
      className={`mt-auto inline-flex items-center justify-center gap-2 rounded-lg px-4 py-3 font-mono text-code-label transition-colors disabled:opacity-60 ${
        primary
          ? "bg-primary text-on-primary hover:bg-primary/90"
          : "border border-card-border text-on-surface hover:border-surface-variant"
      }`}
    >
      <Icon name="currency_bitcoin" size={16} />
      {busy ? "Opening checkout…" : label}
    </button>
  );
}
