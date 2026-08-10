import type { Metadata } from "next";
import { Container } from "@/components/container";
import { MonitorsManager } from "@/components/dashboard/monitors-manager";
import { getMonitors } from "@/lib/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Monitors",
};

export default async function MonitorsPage() {
  const monitors = await getMonitors();

  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <MonitorsManager monitors={monitors} />
      </Container>
    </div>
  );
}
