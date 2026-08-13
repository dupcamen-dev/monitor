"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icon";

const STORAGE_KEY = "topstatus-cookie-consent";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
      } catch {
        setVisible(true);
      }
    }, 0);
    return () => clearTimeout(id);
  }, []);

  function accept() {
    try {
      localStorage.setItem(STORAGE_KEY, "accepted");
    } catch {
      // storage unavailable — just hide for this session
    }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie notice"
      className="reveal-up fixed inset-x-4 bottom-4 z-[60] mx-auto flex max-w-2xl flex-col gap-4 rounded-xl border border-card-border bg-card/95 p-5 shadow-deep backdrop-blur-md sm:flex-row sm:items-center sm:gap-6"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon name="cookie" size={20} />
        </span>
        <p className="text-body-sm text-on-surface-variant">
          We use cookies to keep you signed in, analyze traffic and improve TopStatus. By continuing you accept our{" "}
          <Link href="/cookie-policy" className="text-on-surface underline decoration-primary/40 underline-offset-2 hover:text-primary">
            cookie policy
          </Link>
          .
        </p>
      </div>
      <button
        onClick={accept}
        className="btn-shine shrink-0 rounded-lg bg-primary px-5 py-2.5 font-mono text-code-label font-medium text-on-primary transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
      >
        Accept
      </button>
    </div>
  );
}
