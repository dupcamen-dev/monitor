-- TopStatus: dynamic admin list.
-- Grants/revokes are managed from the admin panel. The owner email is seeded
-- as a base admin so the panel can never lock itself out.

create table if not exists public.admins (
  email text primary key,
  created_at timestamptz not null default now()
);

insert into public.admins (email) values ('dupcamen@gmail.com')
on conflict (email) do nothing;

alter table public.admins enable row level security;

revoke all on table public.admins from anon, authenticated;
