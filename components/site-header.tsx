import Link from "next/link";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { HeaderUser } from "@/components/auth/header-user";
import { createServerClientSSR } from "@/lib/supabase/auth";

const NAV = [
  { href: "/#pricing", label: "Pricing" },
  { href: "/#features", label: "Features" },
  { href: "/dashboard/integrations", label: "Integrations" },
];

export async function SiteHeader() {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-outline-variant bg-background/80 backdrop-blur-md">
      <Container className="flex items-center justify-between py-4">
        <Logo />
        <nav className="hidden items-center gap-1 text-body-sm md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <HeaderUser email={user.email ?? "Signed in"} />
              <Link
                href="/dashboard"
                className="rounded bg-primary px-4 py-2 text-body-sm font-medium text-on-primary transition-colors hover:bg-primary/90"
              >
                Dashboard
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-body-sm text-on-surface-variant transition-colors hover:text-on-surface sm:block"
              >
                Log in
              </Link>
              <Link
                href="/login"
                className="btn-shine rounded bg-primary px-4 py-2 text-body-sm font-medium text-on-primary shadow-premium transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary/90"
              >
                Start for free
              </Link>
            </>
          )}
        </div>
      </Container>
    </header>
  );
}
