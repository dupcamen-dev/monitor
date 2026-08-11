import { createAdminClient } from "@/lib/supabase";
import { createServerClientSSR } from "@/lib/supabase/auth";

// Always-admin emails — the owner account can never be locked out of the panel.
export const BASE_ADMIN_EMAILS = ["dupcamen@gmail.com"];

export async function getAdminEmails(): Promise<string[]> {
  try {
    const admin = createAdminClient();
    const { data } = await admin.from("admins").select("email");
    const db = (data ?? [])
      .map((r) => String(r.email).trim().toLowerCase())
      .filter(Boolean);
    return [...new Set([...BASE_ADMIN_EMAILS, ...db])];
  } catch {
    return [...BASE_ADMIN_EMAILS];
  }
}

export async function isAdminEmail(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const normalized = email.trim().toLowerCase();
  if (BASE_ADMIN_EMAILS.includes(normalized)) return true;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("admins")
      .select("email")
      .eq("email", normalized)
      .maybeSingle();
    return !!data;
  } catch {
    return false;
  }
}

export function isBaseAdminEmail(email?: string | null): boolean {
  return !!email && BASE_ADMIN_EMAILS.includes(email.trim().toLowerCase());
}

export async function requireAdminUser() {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return (await isAdminEmail(user?.email)) ? user : null;
}
