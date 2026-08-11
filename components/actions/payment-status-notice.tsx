"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";

export function PaymentStatusNotice() {
  const params = useSearchParams();
  const { show } = useToast();

  useEffect(() => {
    const status = params.get("payment");
    if (!status) return;
    if (status === "success") {
      show("Payment received — your plan is being activated.");
    } else if (status === "cancelled") {
      show("Payment was cancelled.", "info");
    }
  }, [params, show]);

  return null;
}
