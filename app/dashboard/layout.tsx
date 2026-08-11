import { DashboardShell } from "@/components/dashboard/shell";
import { createServerClientSSR } from "@/lib/supabase/auth";
import { getUserOrg } from "@/lib/org";
import { getOrgPlanInfo } from "@/lib/queries";
import { isAdminEmail } from "@/lib/admin";

export const metadata = {
  title: "Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const org = await getUserOrg();
  const planInfo = org ? await getOrgPlanInfo(org.id) : { plan: "free" as const, expiresAt: null };

  return (
    <DashboardShell
      userEmail={user?.email}
      plan={planInfo.plan}
      planExpiresAt={planInfo.expiresAt}
      isAdmin={isAdminEmail(user?.email)}
    >
      {children}
    </DashboardShell>
  );
}
