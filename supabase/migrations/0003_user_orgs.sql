-- Per-user workspaces: each auth user owns their own organization.

alter table public.organizations
  add column if not exists owner_id uuid references auth.users(id) on delete cascade,
  add column if not exists owner_email text;

create index if not exists organizations_owner_id on public.organizations (owner_id);

-- Keep the seeded demo workspace (public status page) ownerless.
update public.organizations
  set owner_email = null
  where id = '00000000-0000-0000-0000-000000000001';
