"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

const NAV = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
  { href: "/dashboard/integrations", label: "Integrations" },
];

function isActive(href: string, pathname: string) {
  if (href === "/#pricing" || href === "/#features") return false;
  return pathname.startsWith(href);
}

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background/80 backdrop-blur-md">
      <Container className="flex items-center justify-between py-4">
        <Logo />
        <nav className="hidden items-center gap-1 text-body-sm md:flex">
          {NAV.map((item) => {
            const active = isActive(item.href, pathname);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-lg px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-surface-container-high text-on-surface"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden text-body-sm text-on-surface-variant transition-colors hover:text-on-surface sm:block"
          >
            Log in
          </Link>
          <Link
            href="/dashboard"
            className="rounded bg-primary px-4 py-2 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
          >
            Start for free
          </Link>
        </div>
      </Container>
    </header>
  );
}
