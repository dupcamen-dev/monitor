"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/ui/toast";

export type PayablePlan = "paid" | "yearly";

type PlanState =
  | { loaded: false }
  | { loaded: true; loggedIn: boolean; yearlyActive: boolean };

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
  const [state, setState] = useState<PlanState>({ loaded: false });
  const router = useRouter();
  const { show } = useToast();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/settings/plan", { cache: "no-store" });
        if (cancelled) return;
        if (res.status === 401) {
          setState({ loaded: true, loggedIn: false, yearlyActive: false });
          return;
        }
        const data = await res.json().catch(() => null);
        if (cancelled) return;
        const yearlyActive =
          data?.plan === "yearly" &&
          data?.expiresAt !== null &&
          new Date(data.expiresAt).getTime() > Date.now();
        setState({ loaded: true, loggedIn: true, yearlyActive });
      } catch {
        if (!cancelled) setState({ loaded: true, loggedIn: false, yearlyActive: false });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locked = state.loaded && state.loggedIn && state.yearlyActive && plan === "paid";

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

  if (locked) {
    return (
      <button
        disabled
        title="Monthly is unavailable while your yearly plan is active."
        className="mt-auto inline-flex cursor-not-allowed items-center justify-center gap-2 rounded-lg border border-card-border px-4 py-3 font-mono text-code-label text-on-surface-variant opacity-70"
      >
        <Icon name="lock" size={16} />
        Unavailable
      </button>
    );
  }

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
