"use client";

import { useLayoutEffect } from "react";

const STORAGE_KEY = "upstatus-theme";

export function ThemeHydration() {
  useLayoutEffect(() => {
    let t: string | null = null;
    try {
      t = window.localStorage.getItem(STORAGE_KEY);
    } catch {
      t = null;
    }
    if (t !== "light" && t !== "dark") t = "dark";
    document.documentElement.dataset.theme = t;
  }, []);

  return null;
}
