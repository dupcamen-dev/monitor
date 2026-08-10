import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

const links = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
  { href: "/dashboard", label: "Dashboard" },
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
        <div className="text-body-sm text-on-surface-variant">© 2024 UpStatus Monitoring. All rights reserved.</div>
      </Container>
    </footer>
  );
}
