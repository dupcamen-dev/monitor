-- UpStatus yearly plan: 12-month subscription that auto-expires back to free.
-- plan_expires_at marks when a paid/yearly subscription lapses.

alter table public.organizations add column if not exists plan_expires_at timestamptz;

create index if not exists organizations_plan_expires_idx
  on public.organizations (plan)
  where plan = 'yearly';
