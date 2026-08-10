"use client";

import { useEffect } from "react";
import { Icon } from "@/components/icon";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

const sizes = { sm: "max-w-md", md: "max-w-lg", lg: "max-w-2xl" };

export function Modal({ open, onClose, title, subtitle, children, footer, size = "md" }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-margin-mobile" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative z-10 w-full ${sizes[size]} animate-modal-in max-h-[90vh] overflow-hidden rounded-xl border border-card-border bg-surface-container-lowest shadow-2xl`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-card-border p-6 pb-4">
          <div>
            <h3 className="text-headline-md text-on-surface">{title}</h3>
            {subtitle && <p className="mt-1 text-body-sm text-on-surface-variant">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded p-1 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-6">{children}</div>
        {footer && (
          <div className="flex justify-end gap-3 border-t border-card-border bg-surface-container-lowest p-4 px-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
