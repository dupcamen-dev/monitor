import type { Metadata } from "next";
import { Container } from "@/components/container";
import { Toggle } from "@/components/toggle";
import { SettingsSaveBar } from "@/components/actions/settings-save-bar";
import { DeleteOrganizationButton } from "@/components/actions/delete-organization-button";
import { PlanSelector } from "@/components/actions/plan-selector";
import { getOrgPlan } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Settings",
};

export const dynamic = "force-dynamic";

function Field({ label, hint, value }: { label: string; hint?: string; value: string }) {
  return (
    <div>
      <label className="mb-1 block font-mono text-code-label text-on-surface">{label}</label>
      <input
        type="text"
        defaultValue={value}
        className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
      />
      {hint && <p className="mt-1.5 text-body-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}

export default async function SettingsPage() {
  const plan = await getOrgPlan();

  return (
    <div className="p-margin-mobile py-10 md:p-margin-desktop">
      <Container className="!p-0">
        <header className="mb-12">
          <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Settings</h1>
          <p className="mt-2 text-body-lg text-on-surface-variant">
            Manage your workspace, status page and appearance.
          </p>
        </header>

        <div className="max-w-2xl space-y-8">
          {/* General */}
          <section className="rounded-xl border border-card-border bg-card p-6">
            <h2 className="mb-6 border-b border-card-border pb-3 text-headline-md text-on-surface">
              General
            </h2>
            <div className="flex flex-col gap-5">
              <Field label="ORGANIZATION NAME" value="Acme Corp" />
              <Field label="STATUS PAGE SLUG" value="acme" hint="Your public page will be at upstatus.dev/acme" />
              <div>
                <label className="mb-1 block font-mono text-code-label text-on-surface">TIMEZONE</label>
                <select
                  defaultValue="Europe/Kyiv"
                  className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none"
                >
                  <option>Europe/Kyiv</option>
                  <option>Europe/London</option>
                  <option>Europe/Berlin</option>
                  <option>America/New_York</option>
                  <option>Asia/Singapore</option>
                </select>
              </div>
            </div>
          </section>

          {/* Plan */}
          <section className="rounded-xl border border-card-border bg-card p-6">
            <h2 className="mb-6 border-b border-card-border pb-3 text-headline-md text-on-surface">
              Plan
            </h2>
            <div className="flex flex-col gap-5">
              <p className="text-body-sm text-on-surface-variant">
                Your plan sets how often UpStatus checks your monitors.
              </p>
              <PlanSelector plan={plan} />
            </div>
          </section>

          {/* Status page */}
          <section className="rounded-xl border border-card-border bg-card p-6">
            <h2 className="mb-6 border-b border-card-border pb-3 text-headline-md text-on-surface">
              Status Page
            </h2>
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-body-lg text-on-surface">Public status page</p>
                  <p className="mt-1 font-mono text-code-label text-on-surface-variant">
                    Share real-time status with your customers.
                  </p>
                </div>
                <Toggle checked={true} label="Public status page" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-body-lg text-on-surface">Auto-publish incidents</p>
                  <p className="mt-1 font-mono text-code-label text-on-surface-variant">
                    Downtime events appear automatically on your page.
                  </p>
                </div>
                <Toggle checked={true} label="Auto-publish incidents" />
              </div>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-body-lg text-on-surface">90-day history</p>
                  <p className="mt-1 font-mono text-code-label text-on-surface-variant">
                    Show detailed uptime bars on the public page.
                  </p>
                </div>
                <Toggle checked={true} label="90-day history" />
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-xl border border-card-border bg-card p-6">
            <h2 className="mb-6 border-b border-card-border pb-3 text-headline-md text-on-surface">
              Appearance
            </h2>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-body-lg text-on-surface">Dark mode</p>
                <p className="mt-1 font-mono text-code-label text-on-surface-variant">
                  UpStatus is built dark-first for low-light environments.
                </p>
              </div>
              <Toggle checked={true} label="Dark mode" />
            </div>
          </section>

          {/* Danger zone */}
          <section className="rounded-xl border border-error-container/40 bg-error-container/5 p-6">
            <h2 className="mb-4 text-headline-md text-error">Danger Zone</h2>
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <p className="text-body-lg text-on-surface">Delete organization</p>
                <p className="mt-1 font-mono text-code-label text-on-surface-variant">
                  This permanently removes all monitors and history.
                </p>
              </div>
              <DeleteOrganizationButton />
            </div>
          </section>
        </div>

        <SettingsSaveBar />
      </Container>
    </div>
  );
}
