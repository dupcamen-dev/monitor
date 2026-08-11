-- TopStatus admin panel: SEO settings + page visit tracking.

-- SEO settings (single row, id = 1) — editable from /admin/seo.
create table if not exists public.seo_settings (
  id int primary key default 1 check (id = 1),
  title text not null,
  description text not null,
  keywords text,
  og_title text,
  og_description text,
  updated_at timestamptz not null default now(),
  updated_by text
);

insert into public.seo_settings (id, title, description)
values (
  1,
  'TopStatus — Monitoring & Status Pages',
  'Uptime monitoring and status pages in one place. Get reliable monitoring and beautiful status pages without overpaying.'
)
on conflict (id) do nothing;

-- Page visit tracking (filled by POST /api/track from the client).
create table if not exists public.page_visits (
  id bigint generated always as identity primary key,
  path text not null,
  referrer text,
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists page_visits_created_idx on public.page_visits (created_at desc);
create index if not exists page_visits_user_idx on public.page_visits (user_id, created_at desc);
