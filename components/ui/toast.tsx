"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { Icon } from "@/components/icon";

type Tone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: Tone;
}

const ToastContext = createContext<{ show: (message: string, tone?: Tone) => void }>({
  show: () => {},
});

export function useToast() {
  return useContext(ToastContext);
}

const toneStyles: Record<Tone, { box: string; icon: string }> = {
  success: { box: "border-up/40", icon: "text-up" },
  error: { box: "border-error/40", icon: "text-error" },
  info: { box: "border-primary/40", icon: "text-primary" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, tone: Tone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3600);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex flex-col gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2.5 rounded-lg border bg-surface-container-lowest px-4 py-3 shadow-xl ${toneStyles[t.tone].box}`}
            style={{ animation: "toast-in 0.18s ease-out" }}
          >
            <Icon name={t.tone === "success" ? "check_circle" : t.tone === "error" ? "error" : "info"} filled size={18} className={toneStyles[t.tone].icon} />
            <span className="text-body-sm text-on-surface">{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
