import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icon";
import { StatusPill } from "@/components/status-badge";
import { UptimeBars } from "@/components/uptime-bars";
import { IncidentTimeline } from "@/components/incident-timeline";
import { createAdminClient } from "@/lib/supabase";
import { getStatus } from "@/lib/queries";
import type { OverallStatus } from "@/lib/queries";

export const dynamic = "force-dynamic";

const OVERALL: Record<OverallStatus, { title: string; sub: string; icon: string; iconClass: string; border: string; bg: string }> = {
  operational: {
    title: "All systems operational",
    sub: "No incidents reported.",
    icon: "check_circle",
    iconClass: "text-secondary",
    border: "border-secondary/20",
    bg: "bg-secondary-container/10",
  },
  degraded: {
    title: "Some systems degraded",
    sub: "One or more services are experiencing degraded performance.",
    icon: "warning",
    iconClass: "text-tertiary",
    border: "border-tertiary/20",
    bg: "bg-tertiary-container/10",
  },
  disruption: {
    title: "Service disruption",
    sub: "One or more services are down right now.",
    icon: "error",
    iconClass: "text-error",
    border: "border-error/20",
    bg: "bg-error-container/10",
  },
};

async function getPublicOrg(slug: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("organizations")
    .select("id, name, slug")
    .eq("slug", slug)
    .maybeSingle();
  return data ?? null;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const org = await getPublicOrg(slug);
  return {
    title: org ? `${org.name} Status` : "Status",
    description: `Live status of ${org?.name ?? "this workspace"} — uptime and incidents.`,
    alternates: { canonical: `/s/${slug}` },
    openGraph: {
      title: org ? `${org.name} Status` : "Status",
      description: `Live status of ${org?.name ?? "this workspace"} — uptime and incidents.`,
      url: `https://topstatus.space/s/${slug}`,
      siteName: "TopStatus",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: org ? `${org.name} Status` : "Status",
      description: `Live status of ${org?.name ?? "this workspace"} — uptime and incidents.`,
    },
  };
}

export default async function StatusPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const org = await getPublicOrg(slug);
  if (!org) notFound();

  const status = await getStatus(org.id);
  const banner = OVERALL[status.overall];

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background/80 backdrop-blur-md">
        <Container className="flex items-center justify-between py-3">
          <Logo size="sm" href="/" />
          <div className="flex items-center gap-2 font-mono text-code-label text-on-surface-variant">
            <Icon name="sensors" size={16} className="text-primary" />
            {org.name} Status
          </div>
        </Container>
      </header>

      <main className="flex-1 py-10 md:py-16">
        <Container className="max-w-3xl">
          <section className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">{org.name}</h1>
              <StatusPill status={status.overall === "disruption" ? "down" : status.overall === "degraded" ? "degraded" : "up"} />
            </div>
            <div
              className={`flex items-center gap-4 rounded-xl border p-6 ${banner.border} ${banner.bg}`}
            >
              <Icon name={banner.icon} filled size={32} className={`shrink-0 ${banner.iconClass}`} />
              <div>
                <h2 className={`text-headline-md ${banner.iconClass}`}>{banner.title}</h2>
                <p className="mt-1 text-body-sm text-on-surface-variant">{banner.sub}</p>
              </div>
            </div>
          </section>

          {/* Monitors */}
          <section className="mt-10">
            <h2 className="border-b border-card-border pb-4 text-headline-md text-on-surface">
              Services
            </h2>
            <div className="mt-4 flex flex-col divide-y divide-card-border rounded-xl border border-card-border bg-card">
              {status.monitors.length === 0 && (
                <p className="p-6 text-body-sm text-on-surface-variant">No services configured yet.</p>
              )}
              {status.monitors.map((m) => (
                <div key={m.id} className="flex flex-col gap-3 p-6">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded border border-card-border bg-surface-container">
                        <Icon
                          name={m.kind === "api" ? "api" : m.kind === "database" ? "database" : m.kind === "dashboard" ? "monitoring" : "language"}
                          size={16}
                          className="text-on-surface-variant"
                        />
                      </div>
                      <div>
                        <p className="text-body-lg font-medium text-on-surface">{m.name}</p>
                        <p className="font-mono text-code-label text-on-surface-variant">
                          {m.latencyMs !== null ? `${m.latencyMs}ms` : "checking…"} · {m.uptime90} uptime
                        </p>
                      </div>
                    </div>
                    <StatusPill status={m.status} />
                  </div>
                  <UptimeBars history={m.history} height={24} />
                </div>
              ))}
            </div>
          </section>

          {/* Incidents */}
          <section className="mt-10">
            <h2 className="border-b border-card-border pb-4 text-headline-md text-on-surface">
              Recent Incidents
            </h2>
            {status.incidents.length === 0 ? (
              <p className="mt-6 text-body-sm text-on-surface-variant">
                No incidents reported in the last 30 days. Everything is running smoothly.
              </p>
            ) : (
              <div className="mt-6">
                {status.incidents.slice(0, 10).map((inc) => (
                  <IncidentTimeline key={inc.id} incident={inc} />
                ))}
              </div>
            )}
          </section>
        </Container>
      </main>

      <footer className="border-t border-card-border py-8">
        <Container className="flex items-center justify-center">
          <Link href="/" className="flex items-center gap-2 font-mono text-code-label text-on-surface-variant transition-colors hover:text-on-surface">
            <Icon name="monitor_heart" size={16} className="text-primary" />
            Powered by TopStatus
          </Link>
        </Container>
      </footer>
    </div>
  );
}
