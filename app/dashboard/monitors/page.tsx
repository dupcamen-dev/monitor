import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import { MonitorsManager } from "@/components/dashboard/monitors-manager";
import { getMonitors, getOrgPlan, planCheckIntervalSec } from "@/lib/queries";
import { secToInterval } from "@/lib/interval";
import { getUserOrg } from "@/lib/org";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monitors",
};

export default async function MonitorsPage() {
  const org = await getUserOrg();
  if (!org) redirect("/login");
  const [monitors, plan] = await Promise.all([getMonitors(org.id), getOrgPlan(org.id)]);
  const checkInterval = secToInterval(planCheckIntervalSec(plan));

  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <MonitorsManager monitors={monitors} checkInterval={checkInterval} />
      </Container>
    </div>
  );
}
