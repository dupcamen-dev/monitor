"use client";

import { useSyncExternalStore } from "react";
import { Toggle } from "@/components/toggle";

const STORAGE_KEY = "upstatus-theme";

type Theme = "dark" | "light";

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function getStoredTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  const v = window.localStorage.getItem(STORAGE_KEY);
  return v === "light" ? "light" : "dark";
}

function getSnapshot(): Theme {
  return getStoredTheme();
}

export function DarkModeToggle() {
  const theme = useSyncExternalStore(subscribe, getSnapshot, () => "dark");

  const toggle = (next: boolean) => {
    const value: Theme = next ? "light" : "dark";
    window.localStorage.setItem(STORAGE_KEY, value);
    document.documentElement.dataset.theme = value;
    listeners.forEach((l) => l());
  };

  return <Toggle checked={theme === "light"} onChange={toggle} label="Dark mode" />;
}
