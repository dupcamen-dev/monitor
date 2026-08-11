import { createAdminClient } from "@/lib/supabase";
import { getAdminEmails, isBaseAdminEmail } from "@/lib/admin";
import { UsersTable } from "@/components/admin/users-table";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const admin = createAdminClient();
  const [{ data: orgs }, admins] = await Promise.all([
    admin
      .from("organizations")
      .select("id, name, slug, owner_email, plan, plan_expires_at, created_at")
      .order("created_at", { ascending: true }),
    getAdminEmails(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-display-lg-mobile text-on-surface md:text-display-lg">Users & plans</h1>
        <p className="mt-2 text-body-lg text-on-surface-variant">
          Manage workspace plans and admin access.
        </p>
      </header>

      <UsersTable
        initialOrgs={(orgs ?? []).map((o) => ({
          id: o.id,
          name: o.name,
          slug: o.slug,
          ownerEmail: o.owner_email ?? null,
          plan: o.plan,
          planExpiresAt: o.plan_expires_at ?? null,
        }))}
        initialAdmins={admins.map((email) => ({ email, base: isBaseAdminEmail(email) }))}
      />
    </div>
  );
}
