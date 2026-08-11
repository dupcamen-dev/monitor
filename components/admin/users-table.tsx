"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icon";
import { useToast } from "@/components/ui/toast";

const btn =
  "rounded-md px-2.5 py-1 font-mono text-code-label transition-colors disabled:cursor-not-allowed disabled:opacity-40";

interface OrgRow {
  id: string;
  name: string;
  slug: string;
  ownerEmail: string | null;
  plan: string;
  planExpiresAt: string | null;
}

interface AdminRow {
  email: string;
  base: boolean;
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(iso)
  );
}

export function UsersTable({ initialOrgs, initialAdmins }: { initialOrgs: OrgRow[]; initialAdmins: AdminRow[] }) {
  const { show } = useToast();
  const router = useRouter();
  const orgs = initialOrgs;
  const admins = initialAdmins;
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const adminEmails = new Set(admins.map((a) => a.email));

  const run = async (key: string, fn: () => Promise<void>) => {
    setBusy(key);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      show(e instanceof Error ? e.message : "Something went wrong", "error");
    } finally {
      setBusy(null);
    }
  };

  const grant = async (orgId: string, plan: "paid" | "yearly") => {
    await run(`${orgId}:grant:${plan}`, async () => {
      const res = await fetch("/api/admin/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId, plan }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Could not grant plan");
      show("Plan granted");
    });
  };

  const cancel = async (orgId: string) => {
    if (!window.confirm("Cancel this plan and downgrade the workspace to free?")) return;
    await run(`${orgId}:cancel`, async () => {
      const res = await fetch("/api/admin/plans", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ org_id: orgId }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Could not cancel plan");
      show("Plan cancelled");
    });
  };

  const addAdmin = async (rawEmail?: string) => {
    const email = (rawEmail ?? newAdminEmail).trim().toLowerCase();
    if (!email) return;
    await run("add-admin", async () => {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Could not add admin");
      setNewAdminEmail("");
      show(`Admin added: ${email}`);
    });
  };

  const removeAdmin = async (email: string) => {
    if (!window.confirm(`Revoke admin access from ${email}?`)) return;
    await run(`remove-admin:${email}`, async () => {
      const res = await fetch("/api/admin/admins", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok) throw new Error(payload?.error ?? "Could not revoke admin");
      show("Admin access revoked");
    });
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Grant admin */}
      <section className="rounded-xl border border-card-border bg-card p-6">
        <h2 className="mb-4 border-b border-card-border pb-3 text-headline-md text-on-surface">
          Admin access
        </h2>
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="email"
              value={newAdminEmail}
              onChange={(e) => setNewAdminEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addAdmin()}
              placeholder="user@example.com"
              className="w-full rounded border border-card-border bg-surface-container-lowest px-3 py-2 font-mono text-code-label text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none sm:max-w-xs"
            />
            <button
              onClick={() => addAdmin()}
              disabled={busy !== null || !newAdminEmail.trim()}
              className={`${btn} bg-primary text-on-primary hover:bg-primary/90`}
            >
              Add admin
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {admins.map((a) => (
              <span
                key={a.email}
                className="inline-flex items-center gap-2 rounded-lg border border-card-border bg-surface-container-low px-3 py-1.5 font-mono text-code-label text-on-surface"
              >
                {a.email}
                {a.base && (
                  <span className="rounded bg-secondary/15 px-1.5 py-0.5 text-code-label text-secondary">
                    OWNER
                  </span>
                )}
                {!a.base && (
                  <button
                    onClick={() => removeAdmin(a.email)}
                    disabled={busy !== null}
                    className="text-on-surface-variant transition-colors hover:text-error"
                    aria-label={`Revoke ${a.email}`}
                  >
                    <Icon name="close" size={14} />
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Workspaces / plans */}
      <section className="overflow-x-auto rounded-xl border border-card-border bg-card">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-card-border">
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">WORKSPACE</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">OWNER</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">PLAN</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">EXPIRES</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">ADMIN</th>
              <th className="p-4 font-mono text-code-label font-normal text-on-surface-variant">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-card-border">
            {orgs.map((o) => (
              <tr key={o.id} className="align-top transition-colors hover:bg-surface-container-low/50">
                <td className="p-4">
                  <p className="text-body-sm text-on-surface">{o.name}</p>
                  <p className="font-mono text-code-label text-on-surface-variant">/s/{o.slug}</p>
                </td>
                <td className="p-4 font-mono text-code-label text-on-surface-variant">
                  {o.ownerEmail ?? "—"}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded px-2 py-0.5 font-mono text-code-label ${
                      o.plan === "yearly"
                        ? "bg-secondary/15 text-secondary"
                        : o.plan === "paid"
                          ? "bg-primary/10 text-primary"
                          : "bg-surface-variant text-on-surface-variant"
                    }`}
                  >
                    {o.plan.toUpperCase()}
                  </span>
                </td>
                <td className="p-4 font-mono text-code-label text-on-surface-variant">
                  {fmtDate(o.planExpiresAt)}
                </td>
                <td className="p-4">
                  {o.ownerEmail && adminEmails.has(o.ownerEmail) ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="rounded bg-secondary/15 px-2 py-0.5 font-mono text-code-label text-secondary">
                        ADMIN
                      </span>
                      {!admins.find((a) => a.email === o.ownerEmail)?.base && (
                        <button
                          onClick={() => removeAdmin(o.ownerEmail!)}
                          disabled={busy !== null}
                          className={`${btn} border border-card-border hover:border-error/50 hover:text-error`}
                        >
                          Revoke
                        </button>
                      )}
                    </span>
                  ) : (
                    <button
                      onClick={() => addAdmin(o.ownerEmail!)}
                      disabled={busy !== null || !o.ownerEmail}
                      className={`${btn} border border-card-border hover:border-secondary/50 hover:text-secondary`}
                    >
                      Make admin
                    </button>
                  )}
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => grant(o.id, "paid")}
                      disabled={busy !== null}
                      className={`${btn} bg-primary/10 text-primary hover:bg-primary/20`}
                    >
                      Paid 30d
                    </button>
                    <button
                      onClick={() => grant(o.id, "yearly")}
                      disabled={busy !== null}
                      className={`${btn} bg-secondary/15 text-secondary hover:bg-secondary/25`}
                    >
                      Yearly 365d
                    </button>
                    {o.plan !== "free" && (
                      <button
                        onClick={() => cancel(o.id)}
                        disabled={busy !== null}
                        className={`${btn} border border-card-border text-on-surface-variant hover:border-error/50 hover:text-error`}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {orgs.length === 0 && (
              <tr>
                <td colSpan={6} className="p-6 text-center font-mono text-code-label text-on-surface-variant">
                  No workspaces yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
