import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Icon } from "@/components/icon";
import { AssistLoopWidget } from "@/components/assistloop-widget";

export const metadata: Metadata = {
  title: "Monitoring + Status Pages. Finally in one place.",
};

const features = [
  {
    icon: "monitoring",
    color: "text-primary",
    title: "Real-time monitoring",
    text: "Check your services at up to 1-minute intervals. Instant downtime detection with global probe locations.",
    chart: true,
  },
  {
    icon: "notifications_active",
    color: "text-primary",
    title: "Instant alerts",
    text: "Receive alerts via WhatsApp, Telegram, Email, or Webhooks the second a service goes down.",
    chart: false,
  },
  {
    icon: "history",
    color: "text-primary",
    title: "Incident history",
    text: "Detailed log of all events and downtime, automatically published to your status page.",
    chart: false,
  },
  {
    icon: "verified",
    color: "text-secondary",
    title: "99.99% reliability",
    text: "Distributed monitoring infrastructure ensures maximum check accuracy from multiple regions.",
    chart: false,
  },
];

type CellValue = "check" | "cancel" | "low" | "high" | "best";

const comparisons: { feature: string; rows: { uptime: CellValue; statuspage: CellValue; us: CellValue } }[] = [
  {
    feature: "Uptime monitoring",
    rows: { uptime: "check", statuspage: "cancel", us: "check" },
  },
  {
    feature: "Public status page",
    rows: { uptime: "cancel", statuspage: "check", us: "check" },
  },
  {
    feature: "Telegram & WhatsApp alerts",
    rows: { uptime: "cancel", statuspage: "check", us: "check" },
  },
  {
    feature: "30-day & 90-day history",
    rows: { uptime: "check", statuspage: "check", us: "check" },
  },
  {
    feature: "Cost",
    rows: { uptime: "low", statuspage: "high", us: "best" },
  },
];

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="py-20 text-center">
          <Container className="space-y-8">
            <h1 className="glow-text mx-auto max-w-4xl text-display-lg-mobile leading-[1.2] tracking-[-0.02em] text-on-surface md:text-display-lg md:leading-[1.1]">
              Monitoring + Status Page.
              <br />
              Finally in one place.
            </h1>
            <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
              Get reliable uptime monitoring and beautiful status pages without overpaying. Save up to{" "}
              <span className="text-on-surface">$399/mo</span> compared to competitors.
            </p>
            <div className="pt-8">
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-4 text-headline-md text-on-primary transition-colors hover:bg-primary/90"
              >
                Start monitoring for free
              </Link>
            </div>
            <p className="font-mono text-code-label text-outline">No credit card required</p>
          </Container>
        </section>

        {/* Social proof */}
        <section className="border-y border-card-border py-12 text-center">
          <Container>
            <p className="mb-6 font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
              Trusted by over 1,000+ developers
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 opacity-50">
              {["TechCorp", "DevOps Inc", "CloudScale", "StartUp.io", "Vertex"].map((name) => (
                <span key={name} className="text-headline-md text-on-surface">
                  {name}
                </span>
              ))}
            </div>
          </Container>
        </section>

        {/* Comparison */}
        <section className="py-16">
          <Container>
            <h2 className="mb-12 text-center text-headline-md text-on-surface">
              Perfect balance of features and price
            </h2>
            <div className="overflow-hidden rounded-xl border border-card-border bg-card">
              <div className="grid grid-cols-4 gap-4 border-b border-card-border p-6 font-mono text-code-label text-on-surface-variant">
                <div>Feature</div>
                <div className="text-center">UptimeRobot</div>
                <div className="text-center">StatusPage</div>
                <div className="text-center font-bold text-primary">UpStatus</div>
              </div>
              {comparisons.map((row, i) => (
                <div
                  key={row.feature}
                  className={`grid grid-cols-4 gap-4 p-6 transition-colors hover:bg-surface-container-low ${
                    i < comparisons.length - 1 ? "border-b border-card-border" : ""
                  }`}
                >
                  <div className="text-body-sm text-on-surface">{row.feature}</div>
                  <div className="flex justify-center">
                    <ComparisonCell value={row.rows.uptime} />
                  </div>
                  <div className="flex justify-center">
                    <ComparisonCell value={row.rows.statuspage} />
                  </div>
                  <div className="flex justify-center">
                    <ComparisonCell value={row.rows.us} highlight={row.feature === "Cost"} />
                  </div>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Features bento */}
        <section id="features" className="py-16">
          <Container>
            <h2 className="mb-12 text-headline-md text-on-surface">Everything you need for control</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className={`flex flex-col justify-between rounded-xl border border-card-border bg-card p-6 ${
                    f.chart || i === 3 ? "md:col-span-2" : ""
                  }`}
                >
                  <div>
                    <Icon name={f.icon} filled size={32} className={`mb-4 ${f.color}`} />
                    <h3 className="mb-2 text-headline-md text-on-surface">{f.title}</h3>
                    <p className="text-body-sm text-on-surface-variant">{f.text}</p>
                  </div>
                  {f.chart && (
                    <div className="mt-8 flex h-24 items-end gap-1 opacity-70">
                      <div className="h-full w-full rounded-t-sm bg-up" />
                      <div className="h-5/6 w-full rounded-t-sm bg-up" />
                      <div className="h-2/6 w-full rounded-t-sm bg-down" />
                      <div className="h-full w-full rounded-t-sm bg-up" />
                      <div className="h-full w-full rounded-t-sm bg-up" />
                      <div className="h-4/6 w-full rounded-t-sm bg-up" />
                      <div className="h-full w-full rounded-t-sm bg-up" />
                      <div className="h-1/6 w-full rounded-t-sm bg-tertiary" />
                      <div className="h-full w-full rounded-t-sm bg-up" />
                      <div className="h-full w-full rounded-t-sm bg-up" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing */}
        <section id="pricing" className="py-16">
          <Container>
            <h2 className="mb-12 text-center text-headline-md text-on-surface">Simple, honest pricing</h2>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  name: "Free",
                  price: "$0",
                  billing: "/ month",
                  tagline: "For side projects",
                  cadence: "Checks every 1 hour",
                  cta: "Start for free",
                  features: ["Unlimited monitors", "1 status page", "Hourly checks", "Email alerts"],
                },
                {
                  name: "Paid",
                  price: "$19",
                  billing: "/ month",
                  tagline: "For teams that need speed",
                  cadence: "Checks every 5 minutes",
                  cta: "Start 14-day trial",
                  features: [
                    "Unlimited monitors",
                    "1 status page",
                    "5-minute checks",
                    "Telegram & email alerts",
                    "90-day history",
                  ],
                  featured: true,
                },
                {
                  name: "Yearly",
                  price: "$150",
                  billing: "/ year",
                  tagline: "Best value for power users",
                  cadence: "Checks every 5 minutes",
                  cta: "Go yearly",
                  badge: "BEST VALUE",
                  features: [
                    "Everything in Paid",
                    "5-minute checks",
                    "Telegram, email & Discord alerts",
                    "90-day history",
                    "Save $78 vs monthly",
                  ],
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`flex flex-col rounded-xl border p-6 ${
                    plan.featured
                      ? "border-primary bg-primary/5"
                      : "border-card-border bg-card"
                  }`}
                >
                  <div className="mb-6">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-headline-md text-on-surface">{plan.name}</span>
                      {plan.featured && (
                        <span className="rounded bg-primary px-2 py-0.5 font-mono text-code-label text-on-primary">
                          POPULAR
                        </span>
                      )}
                      {plan.badge && (
                        <span className="rounded bg-secondary/15 px-2 py-0.5 font-mono text-code-label text-secondary">
                          {plan.badge}
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-display-lg-mobile font-bold text-on-surface">{plan.price}</span>
                      <span className="font-mono text-code-label text-on-surface-variant">{plan.billing}</span>
                    </div>
                    <p className="mt-1 text-body-sm text-on-surface-variant">{plan.tagline}</p>
                    <p className="mt-3 inline-flex items-center gap-2 rounded bg-surface-container-lowest px-3 py-1.5 font-mono text-code-label text-primary">
                      <Icon name="sensors" size={16} />
                      {plan.cadence}
                    </p>
                  </div>
                  <ul className="mb-8 flex flex-col gap-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-body-sm text-on-surface-variant">
                        <Icon name="check_circle" filled size={18} className="text-secondary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/dashboard"
                    className={`mt-auto rounded-lg px-4 py-3 text-center font-mono text-code-label transition-colors ${
                      plan.featured
                        ? "bg-primary text-on-primary hover:bg-primary/90"
                        : "border border-card-border text-on-surface hover:border-surface-variant"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
      <AssistLoopWidget />
    </div>
  );
}

function ComparisonCell({
  value,
  highlight,
}: {
  value: CellValue;
  highlight?: boolean;
}) {
  if (value === "check")
    return <Icon name="check_circle" filled size={20} className="text-secondary-container" />;
  if (value === "cancel") return <Icon name="cancel" size={20} className="text-error" />;
  if (value === "best") return <span className="font-bold text-primary">Optimal</span>;
  if (value === "high") return <span className="text-error">Very high</span>;
  return <span className={highlight ? "font-bold text-primary" : "text-on-surface"}>Low</span>;
}
