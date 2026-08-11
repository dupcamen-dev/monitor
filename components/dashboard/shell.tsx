"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/icon";
import { Logo } from "@/components/logo";
import { AddMonitorButton } from "@/components/actions/add-monitor-button";
import { SignOutButton } from "@/components/auth/sign-out-button";
import type { OrgPlan } from "@/lib/queries";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "dashboard" },
  { href: "/dashboard/monitors", label: "Monitors", icon: "analytics" },
  { href: "/dashboard/incidents", label: "Incidents", icon: "error" },
  { href: "/dashboard/integrations", label: "Integrations", icon: "notifications_active" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname.startsWith(href);
}

const PLAN_LABEL: Record<OrgPlan, string> = {
  free: "Free",
  paid: "Paid",
  yearly: "Yearly",
};

const PLAN_BADGE: Record<OrgPlan, string> = {
  free: "border border-card-border text-on-surface-variant",
  paid: "bg-primary/10 text-primary",
  yearly: "bg-secondary/15 text-secondary",
};

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

function PlanBadge({ plan, planExpiresAt }: { plan: OrgPlan; planExpiresAt: string | null }) {
  return (
    <Link
      href="/dashboard/settings"
      className="flex flex-col gap-2 rounded-lg border border-card-border bg-surface-container-lowest p-3 transition-colors hover:border-surface-variant"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-code-label text-on-surface-variant">Plan</span>
        <span className={`rounded px-2 py-0.5 font-mono text-code-label ${PLAN_BADGE[plan]}`}>
          {PLAN_LABEL[plan]}
        </span>
      </div>
      {planExpiresAt ? (
        <span className="font-mono text-code-label text-on-surface-variant">
          Expires {formatDate(planExpiresAt)}
        </span>
      ) : (
        <span className="font-mono text-code-label text-primary">Manage plan →</span>
      )}
    </Link>
  );
}

function SidebarContent({
  pathname,
  userEmail,
  plan,
  planExpiresAt,
  isAdmin,
  onNavigate,
}: {
  pathname: string;
  userEmail?: string | null;
  plan: OrgPlan;
  planExpiresAt: string | null;
  isAdmin?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <>
      <div className="mb-8 flex items-center gap-3 px-2">
        <Link href="/" onClick={onNavigate}>
          <Logo size="sm" />
        </Link>
      </div>

      <div className="flex flex-col gap-2 font-mono text-code-label">
        {NAV.map((item) => {
          const active = isActive(item.href, pathname);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 ${
                active ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
              }`}
            >
              <Icon name={item.icon} size={18} filled={active} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors duration-150 ${
              pathname.startsWith("/admin")
                ? "bg-primary text-on-primary"
                : "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            }`}
          >
            <Icon name="admin_panel_settings" size={18} filled={pathname.startsWith("/admin")} />
            <span>Admin</span>
          </Link>
        )}
      </div>

      <div className="mt-8">
        <AddMonitorButton label="Add Monitor" className="w-full" />
      </div>

      <div className="mt-auto flex flex-col gap-2 border-t border-outline-variant pt-4 font-mono text-code-label">
        <PlanBadge plan={plan} planExpiresAt={planExpiresAt} />
        {userEmail && (
          <div className="flex flex-col gap-1 rounded-lg px-3 py-2">
            <span className="font-mono text-code-label text-on-surface-variant">Signed in as</span>
            <div className="flex items-center gap-3">
              <Icon name="person" size={18} />
              <span className="min-w-0 flex-1 truncate font-mono text-code-label text-on-surface">
                {userEmail}
              </span>
            </div>
          </div>
        )}
        <Link
          href="#"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface"
        >
          <Icon name="description" size={18} />
          <span>Docs</span>
        </Link>
        <SignOutButton className="w-full" />
      </div>
    </>
  );
}

export function DashboardShell({
  children,
  userEmail,
  plan,
  planExpiresAt,
  isAdmin,
}: {
  children: React.ReactNode;
  userEmail?: string | null;
  plan: OrgPlan;
  planExpiresAt: string | null;
  isAdmin?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4 md:flex">
        <SidebarContent
          pathname={pathname}
          userEmail={userEmail}
          plan={plan}
          planExpiresAt={planExpiresAt}
          isAdmin={isAdmin}
        />
      </aside>

      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-outline-variant bg-surface-container-lowest p-4 transition-transform duration-200 md:hidden ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex justify-end pb-2">
          <button
            onClick={() => setOpen(false)}
            className="rounded p-1 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
            aria-label="Close menu"
          >
            <Icon name="close" size={20} />
          </button>
        </div>
        <SidebarContent
          pathname={pathname}
          userEmail={userEmail}
          plan={plan}
          planExpiresAt={planExpiresAt}
          isAdmin={isAdmin}
          onNavigate={() => setOpen(false)}
        />
      </aside>

      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-outline-variant bg-background/80 px-margin-mobile py-3 backdrop-blur-md md:hidden">
        <Logo size="sm" />
        <button
          onClick={() => setOpen(true)}
          className="rounded p-1.5 text-on-surface hover:bg-surface-container-high"
          aria-label="Open menu"
        >
          <Icon name="menu" size={22} />
        </button>
      </header>

      <main className="md:pl-64">{children}</main>
    </div>
  );
}
