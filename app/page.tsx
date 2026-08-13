import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Icon } from "@/components/icon";
import { AssistLoopWidget } from "@/components/assistloop-widget";
import { PayPlanButton } from "@/components/actions/pay-plan-button";
import { Reveal } from "@/components/actions/reveal";
import { HeroMockup } from "@/components/site/hero-mockup";
import { createAdminClient } from "@/lib/supabase";

const DEFAULT_SEO = {
  title: "Monitoring + Status Pages. Finally in one place.",
  description:
    "Get reliable uptime monitoring and beautiful status pages without overpaying. Save up to $399/mo compared to competitors.",
  keywords:
    "uptime monitoring, status page, website monitoring, server monitoring, api monitoring, downtime alerts, uptime checker, availability monitoring, incident management, webhook alerts, synthetic monitoring, latency, http check, sla, моніторинг аптайму, статус сторінка, моніторинг сайтів, перевірка доступності сайту, моніторинг серверів, сповіщення про збої, мониторинг аптайма, статус страница, мониторинг сайтов, проверка доступности сайта, мониторинг серверов, алерты о сбоях, monitoring uptime, strona statusu, monitoring stron, monitorowanie serwerów, powiadomienia o awarii, sprawdzanie dostępności strony",
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
    const title = s?.title || DEFAULT_SEO.title;
    const description = s?.description || DEFAULT_SEO.description;
    return {
      title,
      description,
      keywords: s?.keywords || DEFAULT_SEO.keywords,
      alternates: { canonical: "/" },
      openGraph: {
        title: s?.og_title || title,
        description: s?.og_description || description,
        url: "https://topstatus.space",
        siteName: "TopStatus",
        type: "website",
        locale: "en_US",
      },
      twitter: {
        card: "summary_large_image",
        title: s?.og_title || title,
        description: s?.og_description || description,
      },
    };
  } catch {
    return {
      title: DEFAULT_SEO.title,
      description: DEFAULT_SEO.description,
      keywords: DEFAULT_SEO.keywords,
      alternates: { canonical: "/" },
      openGraph: {
        title: DEFAULT_SEO.title,
        description: DEFAULT_SEO.description,
        url: "https://topstatus.space",
        siteName: "TopStatus",
        type: "website",
        locale: "en_US",
      },
    };
  }
}

const features = [
  {
    icon: "monitoring",
    color: "text-primary",
    title: "Real-time monitoring",
    text: "Check your services every minute on paid plans, hourly on free. Instant downtime detection with auto-created incidents.",
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
    a: "Free plans check every 60 minutes, while Paid and Yearly plans check every minute.",
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
        <section className="relative overflow-hidden pb-10 pt-20 text-center md:pt-28">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="animate-aurora absolute left-1/2 top-[-280px] h-[640px] w-[840px] rounded-full bg-primary/15 blur-[140px]" />
            <div
              className="animate-aurora-drift absolute left-[8%] top-[36%] h-[340px] w-[340px] rounded-full bg-secondary/10 blur-[120px]"
              style={{ animationDelay: "-6s" }}
            />
            <div
              className="animate-aurora-drift absolute right-[4%] top-[18%] h-[420px] w-[420px] rounded-full bg-tertiary/10 blur-[120px]"
              style={{ animationDelay: "-11s" }}
            />
            <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_65%_55%_at_50%_0%,black,transparent)]" />
          </div>
          <Container className="relative space-y-8">
            <Reveal variant="blur">
              <div className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card/80 px-4 py-2 font-mono text-code-label text-on-surface-variant shadow-premium backdrop-blur">
                <span className="status-pulse h-2 w-2 rounded-full bg-up" />
                Monitoring in production
                <Icon name="sparkles" size={14} className="text-secondary" />
              </div>
            </Reveal>
            <Reveal delay={80} variant="blur">
              <h1 className="glow-text mx-auto max-w-4xl text-display-lg-mobile leading-[1.2] tracking-[-0.02em] text-on-surface md:text-[64px] md:leading-[1.08]">
                Monitoring + Status Page.
                <br />
                <span className="text-gradient">Finally in one place.</span>
              </h1>
            </Reveal>
            <Reveal delay={160} variant="blur">
              <p className="mx-auto max-w-2xl text-body-lg text-on-surface-variant">
                Get reliable uptime monitoring and beautiful status pages without overpaying. Save up to{" "}
                <span className="font-semibold text-on-surface">$399/mo</span> compared to competitors.
              </p>
            </Reveal>
            <Reveal delay={240} variant="blur">
              <div className="flex flex-col items-center justify-center gap-4 pt-8 sm:flex-row">
                <Link
                  href="/dashboard"
                  className="btn-shine group inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-8 py-4 text-headline-md font-semibold text-on-primary shadow-deep transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 sm:w-auto"
                >
                  Start monitoring for free
                  <Icon
                    name="arrow_forward"
                    size={20}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </Link>
                <Link
                  href="/#pricing"
                  className="card-lift inline-flex w-full items-center justify-center gap-2 rounded-lg border border-card-border bg-card px-8 py-4 text-headline-md text-on-surface sm:w-auto"
                >
                  <Icon name="currency_bitcoin" size={18} className="text-secondary" />
                  Pay via crypto
                </Link>
              </div>
              <p className="mt-4 font-mono text-code-label text-outline">No credit card required</p>
            </Reveal>
            <Reveal variant="scale" delay={320} className="relative z-10 mx-auto mt-16 max-w-4xl">
              <HeroMockup />
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
                        <span className={`flex h-8 w-14 items-center justify-center rounded-md border border-card-border bg-surface-container-lowest shadow-premium font-mono text-code-label transition-transform duration-200 hover:-translate-y-0.5 ${c.color}`}>
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
            <Reveal delay={80} variant="scale">
            <div className="card-lift overflow-hidden rounded-xl border border-card-border bg-card">
              <div className="relative">
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-y-0 left-3/4 right-0 bg-gradient-to-r from-transparent to-primary/5"
                />
                <div className="relative grid grid-cols-4 gap-4 border-b border-card-border p-6 font-mono text-code-label text-on-surface-variant">
                  <div>Feature</div>
                  <div className="text-center">UptimeRobot</div>
                  <div className="text-center">StatusPage</div>
                  <div className="rounded-md bg-primary/10 text-center font-bold text-primary shadow-[0_0_24px_rgba(173,198,255,0.25)]">
                    TopStatus
                  </div>
                </div>
                {comparisons.map((row, i) => (
                  <div
                    key={row.feature}
                    className={`group relative grid grid-cols-4 gap-4 p-6 transition-colors hover:bg-surface-container-low ${
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
                    <div className="flex justify-center rounded-md bg-primary/10">
                      <ComparisonCell value={row.rows.us} highlight={row.feature === "Cost"} />
                    </div>
                  </div>
                ))}
              </div>
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
                <Reveal
                  key={f.title}
                  delay={i * 80}
                  variant={i % 2 === 0 ? "left" : "right"}
                  className={f.chart || i === 2 ? "md:col-span-2" : ""}
                >
                  <div className="card-lift group relative flex h-full flex-col justify-between overflow-hidden rounded-xl border border-card-border bg-card p-6">
                    <div
                      aria-hidden
                      className="pointer-events-none absolute -right-24 -top-24 h-52 w-52 rounded-full bg-primary/0 blur-3xl transition-colors duration-500 group-hover:bg-primary/10"
                    />
                    <div className="relative">
                      <div
                        className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl ${
                          f.color === "text-secondary" ? "bg-secondary/10" : "bg-primary/10"
                        }`}
                      >
                        <Icon name={f.icon} filled size={24} className={f.color} />
                      </div>
                      <h3 className="mb-2 text-headline-md text-on-surface">{f.title}</h3>
                      <p className="text-body-sm text-on-surface-variant">{f.text}</p>
                    </div>
                    {f.chart && (
                      <div className="relative mt-8">
                        <div className="absolute right-0 top-0 z-10 flex items-center gap-1.5 rounded-full bg-up/10 px-2.5 py-1 font-mono text-code-label text-up">
                          <span className="status-pulse h-1.5 w-1.5 rounded-full bg-up" />
                          LIVE
                        </div>
                        <div className="flex h-24 items-end gap-1.5">
                          {[100, 95, 38, 100, 100, 72, 100, 18, 100, 100].map((h, bi) => (
                            <div
                              key={bi}
                              className={`bar-grow w-full rounded-t-sm ${
                                h === 38 ? "bg-tertiary" : h === 18 ? "bg-down" : "bg-up"
                              }`}
                              style={{ height: `${h}%`, animationDelay: `${0.4 + bi * 0.07}s` }}
                            />
                          ))}
                        </div>
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
                  cadence: "Checks every minute",
                  cta: "Pay via crypto",
                  features: [
                    "Unlimited monitors",
                    "1 status page",
                    "1-minute checks",
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
                  cadence: "Checks every minute",
                  cta: "Pay via crypto",
                  badge: "BEST VALUE",
                  featured: true,
                  features: [
                    "Everything in Paid",
                    "1-minute checks",
                    "Telegram, email & Discord alerts",
                    "90-day history",
                    "Save $78 vs monthly",
                  ],
                },
              ].map((plan, i) => (
                <Reveal key={plan.name} delay={i * 80} variant={i === 1 ? "scale" : "up"} className="h-full">
                <div
                  className={`relative flex h-full flex-col rounded-xl p-6 ${
                    plan.featured
                      ? "gradient-border shadow-deep md:-translate-y-2"
                      : "card-lift border border-card-border bg-card"
                  }`}
                >
                  {plan.featured && (
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 overflow-hidden rounded-xl"
                    >
                      <div className="absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
                    </div>
                  )}
                  <div className="relative mb-6">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="text-headline-md text-on-surface">{plan.name}</span>
                      {plan.badge && (
                        <span className="animate-float rounded bg-secondary/15 px-2 py-0.5 font-mono text-code-label text-secondary">
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
                  <ul className="relative mb-8 flex flex-col gap-3">
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
                          ? "btn-shine bg-primary text-on-primary hover:bg-primary/90"
                          : "border border-card-border text-on-surface hover:border-surface-variant hover:bg-surface-container-low"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                  ) : (
                    <div className="relative mt-auto">
                      <PayPlanButton plan={plan.key} label={plan.cta} primary={plan.featured} />
                    </div>
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
                <Reveal key={item.q} delay={i * 60} variant="blur">
                  <details className="card-lift group grid grid-rows-[0fr] rounded-xl border border-card-border bg-card transition-[grid-template-rows,border-color] duration-300 ease-out hover:border-surface-variant open:grid-rows-[1fr]">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6 text-body-sm font-medium text-on-surface">
                      {item.q}
                      <span className="text-on-surface-variant transition-transform duration-200 group-open:rotate-45">
                        <Icon name="add" size={20} />
                      </span>
                    </summary>
                    <div className="overflow-hidden">
                      <div className="px-6 pb-6 text-body-sm text-on-surface-variant">{item.a}</div>
                    </div>
                  </details>
                </Reveal>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@graph": [
              {
                "@type": "WebSite",
                "@id": "https://topstatus.space/#website",
                url: "https://topstatus.space",
                name: "TopStatus",
                description: DEFAULT_SEO.description,
              },
              {
                "@type": "Organization",
                "@id": "https://topstatus.space/#organization",
                url: "https://topstatus.space",
                name: "TopStatus",
                description: DEFAULT_SEO.description,
              },
              {
                "@type": "SoftwareApplication",
                name: "TopStatus",
                applicationCategory: "WebApplication",
                operatingSystem: "Any",
                url: "https://topstatus.space",
                description: DEFAULT_SEO.description,
                offers: [
                  { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Free plan" },
                  { "@type": "Offer", price: "19", priceCurrency: "USD", description: "Paid plan (monthly)" },
                  { "@type": "Offer", price: "150", priceCurrency: "USD", description: "Yearly plan" },
                ],
              },
              {
                "@type": "FAQPage",
                mainEntity: faq.map((f) => ({
                  "@type": "Question",
                  name: f.q,
                  acceptedAnswer: { "@type": "Answer", text: f.a },
                })),
              },
            ],
          }),
        }}
      />
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
