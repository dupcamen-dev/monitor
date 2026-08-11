import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Icon } from "@/components/icon";
import { AssistLoopWidget } from "@/components/assistloop-widget";
import { PayPlanButton } from "@/components/actions/pay-plan-button";
import { Reveal } from "@/components/actions/reveal";
import { createAdminClient } from "@/lib/supabase";

const DEFAULT_SEO = {
  title: "Monitoring + Status Pages. Finally in one place.",
  description:
    "Get reliable uptime monitoring and beautiful status pages without overpaying. Save up to $399/mo compared to competitors.",
};

export async function generateMetadata(): Promise<Metadata> {
  try {
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("seo_settings")
      .select("title, description, keywords, og_title, og_description")
      .eq("id", 1)
      .maybeSingle();
    const s = data as {
      title?: string | null;
      description?: string | null;
      keywords?: string | null;
      og_title?: string | null;
      og_description?: string | null;
    } | null;
    return {
      title: s?.title || DEFAULT_SEO.title,
      description: s?.description || DEFAULT_SEO.description,
      keywords: s?.keywords || undefined,
      openGraph: {
        title: s?.og_title || undefined,
        description: s?.og_description || undefined,
      },
    };
  } catch {
    return { title: DEFAULT_SEO.title, description: DEFAULT_SEO.description };
  }
}

const features = [
  {
    icon: "monitoring",
    color: "text-primary",
    title: "Real-time monitoring",
    text: "Check your services every 5 minutes on paid plans, hourly on free. Instant downtime detection with auto-created incidents.",
    chart: true,
  },
  {
    icon: "notifications_active",
    color: "text-primary",
    title: "Instant alerts",
    text: "Receive alerts via Telegram, Email, Discord, or Webhooks the second a service goes down.",
    chart: false,
  },
  {
    icon: "verified",
    color: "text-secondary",
    title: "Public status page",
    text: "Share live status, uptime history and incidents with your customers at your own public URL.",
    chart: false,
  },
  {
    icon: "history",
    color: "text-primary",
    title: "Incident history",
    text: "Detailed log of all events and downtime, automatically published to your status page.",
    chart: false,
  },
];

type CellValue = "check" | "cancel" | "low" | "high" | "best";

const faq = [
  {
    q: "How is this different from UptimeRobot + StatusPage.io?",
    a: "TopStatus combines monitoring and status pages in one product. You skip the expensive per-status-page fees and manage everything from a single dashboard.",
  },
  {
    q: "How do I pay with crypto?",
    a: "Click 'Pay via crypto' on any paid plan. You'll get an invoice with a temporary deposit address and can pay in USDT on BSC, TRON, or TON. Your plan activates automatically once the transaction confirms.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. You can downgrade to the Free plan at any time from Settings → Plan in your dashboard. No contracts, no hidden fees.",
  },
  {
    q: "What check intervals are available?",
    a: "Free plans check every 60 minutes, while Paid and Yearly plans check every 5 minutes. Faster intervals are on the roadmap.",
  },
];


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
    feature: "Telegram, email & Discord alerts",
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
        <section className="relative overflow-hidden py-20 text-center md:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-[-220px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]"
          />
          <Container className="relative space-y-8">
            <Reveal>
              <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card px-3 py-1.5 font-mono text-code-label text-on-surface-variant">
                <span className="status-pulse h-2 w-2 rounded-full bg-up" />
                Monitoring in production
              </div>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="glow-text mx-auto max-w-4xl text-display-lg-mobile leading-[1.2] tracking-[-0.02em] text-on-surface md:text-[64px] md:leading-[1.08]">
                Monitoring + Status Page.
                <br />
                Finally in one place.
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                Get reliable uptime monitoring and beautiful status pages without overpaying. Save up to{" "}
                <span className="text-on-surface">$399/mo</span> compared to competitors.
              </p>
            </Reveal>
            <Reveal delay={240}>
              <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-8 py-4 text-headline-md text-on-primary transition-all duration-200 hover:bg-primary/90 active:scale-[0.98] sm:w-auto"
                >
                  Start monitoring for free
                </Link>
                <Link
                  href="/#pricing"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-card-border px-8 py-4 text-headline-md text-on-surface transition-all duration-200 hover:border-surface-variant hover:bg-surface-container-low active:scale-[0.98] sm:w-auto"
                >
                  <Icon name="currency_bitcoin" size={18} />
                  Pay via crypto
                </Link>
              </div>
              <p className="mt-4 font-mono text-code-label text-outline">No credit card required</p>
            </Reveal>
          </Container>
        </section>

        {/* Accepted crypto */}
        <section className="border-y border-card-border py-12">
          <Container>
            <p className="mb-8 text-center font-mono text-code-label uppercase tracking-widest text-on-surface-variant">
              We accept crypto payments
            </p>
            <div className="relative overflow-hidden" style={{ maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)" }}>
              <div className="animate-marquee flex w-max items-center gap-16">
                {[0, 1].map((copy) => (
                  <div key={copy} className="flex items-center gap-16" aria-hidden={copy === 1}>
                    {[
                      { ticker: "USDT", net: "BSC", color: "text-up" },
                      { ticker: "USDT", net: "TRC-20", color: "text-up" },
                      { ticker: "USDT", net: "TON", color: "text-up" },
                      { ticker: "USDC", net: "ERC-20", color: "text-primary" },
                      { ticker: "BNB", net: "BSC", color: "text-tertiary" },
                      { ticker: "ETH", net: "Ethereum", color: "text-on-surface-variant" },
                      { ticker: "BTC", net: "Bitcoin", color: "text-secondary" },
                    ].map((c) => (
                      <span key={`${copy}-${c.ticker}-${c.net}`} className="flex items-center gap-3">
                        <span className={`flex h-8 w-14 items-center justify-center rounded-md border border-card-border bg-surface-container-lowest font-mono text-code-label ${c.color}`}>
                          {c.ticker}
                        </span>
                        <span className="text-headline-md text-on-surface-variant">{c.net}</span>
                      </span>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>

        {/* Comparison */}
        <section className="scroll-mt-24 py-16">
          <Container>
            <Reveal>
              <div className="mb-4 text-center font-mono text-code-label uppercase tracking-widest text-primary">
                Why TopStatus
              </div>
              <h2 className="mb-12 text-center text-headline-md text-on-surface">
                Perfect balance of features and price
              </h2>
            </Reveal>
            <Reveal delay={80}>
            <div className="overflow-hidden rounded-xl border border-card-border bg-card">
              <div className="grid grid-cols-4 gap-4 border-b border-card-border p-6 font-mono text-code-label text-on-surface-variant">
                <div>Feature</div>
                <div className="text-center">UptimeRobot</div>
                <div className="text-center">StatusPage</div>
                <div className="rounded-md bg-primary/5 text-center font-bold text-primary">TopStatus</div>
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
                  <div className="flex justify-center rounded-md bg-primary/5">
                    <ComparisonCell value={row.rows.us} highlight={row.feature === "Cost"} />
                  </div>
                </div>
              ))}
            </div>
            </Reveal>
          </Container>
        </section>

        {/* Features bento */}
        <section id="features" className="scroll-mt-24 py-16">
          <Container>
            <Reveal>
              <div className="mb-4 text-center font-mono text-code-label uppercase tracking-widest text-primary">
                Features
              </div>
              <h2 className="mb-12 text-center text-headline-md text-on-surface">
                Everything you need for control
              </h2>
            </Reveal>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((f, i) => (
                <Reveal key={f.title} delay={i * 80} className={f.chart || i === 2 ? "md:col-span-2" : ""}>
                  <div
                    className={`flex h-full flex-col justify-between rounded-xl border border-card-border bg-card p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-surface-variant hover:bg-surface-container-lowest`}
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
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* Pricing */}
        <section id="pricing" className="scroll-mt-24 py-16">
          <Container>
            <Reveal>
              <div className="mb-4 text-center font-mono text-code-label uppercase tracking-widest text-primary">
                Plans
              </div>
              <h2 className="mb-12 text-center text-headline-md text-on-surface">Simple, honest pricing</h2>
            </Reveal>
            <div className="mx-auto grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
              {[
                {
                  key: "free" as const,
                  name: "Free",
                  price: "$0",
                  billing: "/ month",
                  tagline: "For side projects",
                  cadence: "Checks every 1 hour",
                  cta: "Start for free",
                  features: ["Unlimited monitors", "1 status page", "Hourly checks", "Email alerts"],
                },
                {
                  key: "paid" as const,
                  name: "Paid",
                  price: "$19",
                  billing: "/ month",
                  tagline: "For teams that need speed",
                  cadence: "Checks every 5 minutes",
                  cta: "Pay via crypto",
                  features: [
                    "Unlimited monitors",
                    "1 status page",
                    "5-minute checks",
                    "Telegram & email alerts",
                    "90-day history",
                  ],
                },
                {
                  key: "yearly" as const,
                  name: "Yearly",
                  price: "$150",
                  billing: "/ year",
                  tagline: "Best value for power users",
                  cadence: "Checks every 5 minutes",
                  cta: "Pay via crypto",
                  badge: "BEST VALUE",
                  featured: true,
                  features: [
                    "Everything in Paid",
                    "5-minute checks",
                    "Telegram, email & Discord alerts",
                    "90-day history",
                    "Save $78 vs monthly",
                  ],
                },
              ].map((plan, i) => (
                <Reveal key={plan.name} delay={i * 80} className="h-full">
                <div
                  className={`flex h-full flex-col rounded-xl border p-6 transition-all duration-200 hover:-translate-y-0.5 ${
                    plan.featured
                      ? "border-primary bg-primary/5 shadow-[0_0_40px_rgba(173,198,255,0.15)]"
                      : "border-card-border bg-card hover:border-surface-variant"
                  }`}
                >
                  <div className="mb-6">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-headline-md text-on-surface">{plan.name}</span>
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
                  {plan.key === "free" ? (
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
                  ) : (
                    <PayPlanButton plan={plan.key} label={plan.cta} primary={plan.featured} />
                  )}
                </div>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 py-16">
          <Container className="max-w-3xl">
            <Reveal>
              <div className="mb-4 text-center font-mono text-code-label uppercase tracking-widest text-primary">
                FAQ
              </div>
              <h2 className="mb-12 text-center text-headline-md text-on-surface">Questions, answered</h2>
            </Reveal>
            <div className="flex flex-col gap-4">
              {faq.map((item, i) => (
                <Reveal key={item.q} delay={i * 60}>
                  <details className="group rounded-xl border border-card-border bg-card transition-colors hover:border-surface-variant">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-body-sm font-medium text-on-surface">
                      {item.q}
                      <span className="text-on-surface-variant transition-transform duration-200 group-open:rotate-45">
                        <Icon name="add" size={20} />
                      </span>
                    </summary>
                    <div className="px-6 pb-6 text-body-sm text-on-surface-variant">{item.a}</div>
                  </details>
                </Reveal>
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
