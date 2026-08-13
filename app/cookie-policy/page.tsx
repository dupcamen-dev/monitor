import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Container } from "@/components/container";
import { Icon } from "@/components/icon";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "How TopStatus uses cookies and local storage — essential auth, preferences and analytics. Learn what we store, why, and how to control it.",
  alternates: { canonical: "/cookie-policy" },
  openGraph: {
    title: "Cookie Policy",
    description:
      "How TopStatus uses cookies and local storage — essential auth, preferences and analytics.",
    url: "https://topstatus.space/cookie-policy",
    siteName: "TopStatus",
    type: "website",
    locale: "en_US",
  },
};

const sections = [
  {
    title: "What we use cookies for",
    items: [
      {
        name: "Essential (authentication)",
        desc: "When you sign in, we set secure cookies that keep your session active. Without them you can't use the dashboard, monitor your services, or manage your account. These cookies are strictly necessary.",
      },
      {
        name: "Preferences (local storage)",
        desc: "We store your theme choice and cookie consent in your browser's local storage so your preferences persist between visits. This data never leaves your device.",
      },
      {
        name: "Analytics (anonymous visits)",
        desc: "We record page visits (path, date, referrer) to understand how many people use TopStatus. Signing in is not required, and we do not run third-party ad trackers or share this data with advertisers.",
      },
    ],
  },
  {
    title: "Third-party services",
    items: [
      {
        name: "Supabase",
        desc: "Our database and authentication provider. Auth cookies are issued by Supabase and are required for logged-in functionality.",
      },
      {
        name: "Google Sign-In",
        desc: "If you sign in with Google, Google sets its own cookies governed by Google's Privacy Policy. We only receive your email address to create your workspace.",
      },
    ],
  },
  {
    title: "How to control cookies",
    items: [
      {
        name: "Rejecting the banner",
        desc: "You can ignore or dismiss the cookie notice. We respect the banner's Accept button: nothing is set until you accept, and only the essential auth cookies appear when you sign in.",
      },
      {
        name: "Browser settings",
        desc: "You can block or delete cookies and site data at any time through your browser settings. Note that blocking essential auth cookies will sign you out and may break dashboard features.",
      },
    ],
  },
  {
    title: "Contact",
    items: [
      {
        name: "Questions?",
        desc: "If you have questions about this policy or your data, email us at ringoosamsungj710@gmail.com or message us on Telegram at @NothingUA. We'll respond as soon as we can.",
      },
    ],
  },
];

export default function CookiePolicyPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden pb-20 pt-16 md:pt-24">
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="animate-aurora absolute left-1/2 top-[-260px] h-[520px] w-[720px] -translate-x-1/2 rounded-full bg-primary/15 blur-[140px]" />
            <div className="bg-grid absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)]" />
          </div>
          <Container className="relative max-w-3xl">
            <div className="flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="cookie" size={24} />
              </span>
              <div>
                <h1 className="text-headline-md text-on-surface">Cookie Policy</h1>
                <p className="font-mono text-code-label text-on-surface-variant">
                  Last updated: August 13, 2026
                </p>
              </div>
            </div>

            <div className="mt-10 flex flex-col gap-8">
              <p className="text-body-lg text-on-surface-variant">
                This policy explains how TopStatus uses cookies and similar storage technologies. By
                continuing to use our site you agree to the use of cookies as described here. You can
                also read our{" "}
                <Link
                  href="/#faq"
                  className="text-on-surface underline decoration-primary/40 underline-offset-2 hover:text-primary"
                >
                  FAQ
                </Link>{" "}
                and{" "}
                <Link
                  href="/"
                  className="text-on-surface underline decoration-primary/40 underline-offset-2 hover:text-primary"
                >
                  homepage
                </Link>
                .
              </p>

              {sections.map((section) => (
                <section key={section.title}>
                  <h2 className="mb-4 text-headline-md text-on-surface">{section.title}</h2>
                  <div className="flex flex-col gap-4">
                    {section.items.map((item) => (
                      <div
                        key={item.name}
                        className="rounded-xl border border-card-border bg-card p-6"
                      >
                        <h3 className="text-body-sm font-semibold text-on-surface">{item.name}</h3>
                        <p className="mt-2 text-body-sm text-on-surface-variant">{item.desc}</p>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </Container>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
