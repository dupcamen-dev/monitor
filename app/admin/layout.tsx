import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { createServerClientSSR } from "@/lib/supabase/auth";
import { isAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";

const TABS = [
  { href: "/admin", label: "Analytics" },
  { href: "/admin/seo", label: "SEO" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createServerClientSSR();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!isAdminEmail(user?.email)) redirect("/dashboard");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-30 border-b border-outline-variant bg-background/80 backdrop-blur-md">
        <Container className="flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <Logo size="sm" href="/dashboard" />
            <span className="rounded bg-primary/10 px-2 py-0.5 font-mono text-code-label text-primary">
              ADMIN
            </span>
          </div>
          <nav className="hidden items-center gap-1 text-body-sm md:flex">
            {TABS.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                className="rounded-lg px-3 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
              >
                {tab.label}
              </Link>
            ))}
            <Link
              href="/dashboard"
              className="ml-2 rounded-lg px-3 py-1.5 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
            >
              ← Back to dashboard
            </Link>
          </nav>
        </Container>
      </header>
      <main className="flex-1 py-10">
        <Container>{children}</Container>
      </main>
    </div>
  );
}
