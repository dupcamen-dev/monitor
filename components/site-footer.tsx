import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

const links = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/cookie-policy", label: "Cookie Policy" },
];

export function SiteFooter() {
  return (
    <footer className="w-full border-t border-outline-variant py-16">
      <Container className="flex flex-col items-center justify-between gap-8 md:flex-row">
        <Logo />
        <nav className="flex flex-wrap items-center justify-center gap-6 text-body-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-on-surface-variant transition-colors hover:text-on-surface hover:underline">
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center gap-1 text-body-sm text-on-surface-variant">
          <div>© 2026 TopStatus Monitoring. All rights reserved.</div>
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <a
              href="mailto:ringoosamsungj710@gmail.com"
              className="text-on-surface transition-colors hover:text-primary hover:underline"
            >
              ringoosamsungj710@gmail.com
            </a>
            <span aria-hidden>·</span>
            <a
              href="https://t.me/NothingUA"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface transition-colors hover:text-primary hover:underline"
            >
              @NothingUA
            </a>
          </div>
          <div>
            Designed &amp; Built by{" "}
            <a
              href="https://millionpixels.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-on-surface transition-colors hover:text-primary hover:underline"
            >
              Million Pixels
            </a>
          </div>
        </div>
      </Container>
    </footer>
  );
}
