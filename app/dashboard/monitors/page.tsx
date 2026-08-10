import type { Metadata } from "next";
import { Container } from "@/components/container";
import { MonitorsManager } from "@/components/dashboard/monitors-manager";
import { getMonitors, getOrgPlan, planCheckIntervalSec } from "@/lib/queries";
import { secToInterval } from "@/lib/interval";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monitors",
};

export default async function MonitorsPage() {
  const [monitors, plan] = await Promise.all([getMonitors(), getOrgPlan()]);
  const checkInterval = secToInterval(planCheckIntervalSec(plan));

  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <MonitorsManager monitors={monitors} checkInterval={checkInterval} />
      </Container>
    </div>
  );
}
