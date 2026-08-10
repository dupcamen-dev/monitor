"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/client";

export function HeaderUser({ email }: { email: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const signOut = useCallback(async () => {
    setLoading(true);
    const supabase = createBrowserSupabase();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }, [router]);

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-[200px] truncate font-mono text-code-label text-on-surface-variant sm:block">
        {email}
      </span>
      <button
        onClick={signOut}
        disabled={loading}
        className="rounded-lg px-3 py-1.5 font-mono text-code-label text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface disabled:opacity-60"
      >
        {loading ? "Signing out…" : "Logout"}
      </button>
    </div>
  );
}
