"use client";

import { useCallback, useState } from "react";
import { Icon } from "@/components/icon";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function SignOutButton({ className }: { className?: string }) {
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    window.location.assign(window.location.origin);
  }, []);

  return (
    <button
      onClick={signOut}
      disabled={loading}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 font-mono text-code-label text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60 ${className ?? ""}`}
    >
      <Icon name="logout" size={18} />
      <span>{loading ? "Signing out…" : "Logout"}</span>
    </button>
  );
}
