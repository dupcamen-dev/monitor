import { DashboardShell } from "@/components/dashboard/shell";
import { createServerClientSSR } from "@/lib/supabase/auth";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <DashboardShell userEmail={user?.email}>{children}</DashboardShell>;
}
