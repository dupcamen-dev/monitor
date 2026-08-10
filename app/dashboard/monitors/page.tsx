import type { Metadata } from "next";
import { Container } from "@/components/container";
import { MonitorsManager } from "@/components/dashboard/monitors-manager";
import { dashboardMonitors } from "@/lib/data";

export const metadata: Metadata = {
  title: "Monitors",
};

export default function MonitorsPage() {
  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <MonitorsManager monitors={dashboardMonitors} />
      </Container>
    </div>
  );
}
