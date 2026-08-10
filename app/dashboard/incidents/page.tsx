import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import { IncidentTimeline } from "@/components/incident-timeline";
import { NewIncidentButton } from "@/components/actions/new-incident-button";
import { getIncidents, getMonitorOptions } from "@/lib/queries";
import { getUserOrg } from "@/lib/org";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Incidents",
};

export default async function IncidentsPage() {
  const org = await getUserOrg();
  if (!org) redirect("/login");
  const [incidents, monitors] = await Promise.all([
    getIncidents(org.id),
    getMonitorOptions(org.id),
  ]);
  const resolved = incidents.filter((i) => i.resolved).length;
  const open = incidents.length - resolved;

  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <header className="mb-10 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Incidents</h1>
            <p className="mt-2 text-body-lg text-on-surface-variant">
              {resolved} resolved · {open} open — all events across your monitors.
            </p>
          </div>
          <NewIncidentButton monitors={monitors} />
        </header>

        <div className="flex flex-col gap-10">
          {incidents.map((incident) => (
            <div key={incident.id} className="rounded-xl border border-card-border bg-card p-6">
              <IncidentTimeline incident={incident} />
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
