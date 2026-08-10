"use client";

import { useState } from "react";

interface ToggleProps {
  label?: string;
  checked?: boolean;
  onChange?: (checked: boolean) => void;
}

export function Toggle({ label, checked = false, onChange }: ToggleProps) {
  const [on, setOn] = useState(checked);

  const toggle = () => {
    const next = !on;
    setOn(next);
    onChange?.(next);
  };

  return (
    <label className="relative inline-flex cursor-pointer items-center">
      {label && <span className="sr-only">{label}</span>}
      <input type="checkbox" className="peer sr-only" checked={on} onChange={toggle} />
      <div
        className={`relative h-5 w-9 rounded-full transition-colors after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform ${
          on ? "bg-primary after:translate-x-full" : "bg-card-border"
        }`}
      />
    </label>
  );
}
