-- TopStatus plans: free (checks hourly) / paid (checks every 5 min)

alter table public.organizations add column if not exists plan text not null default 'free';

alter table public.monitors add column if not exists last_checked_at timestamptz;

-- the product's own workspace uses 5-minute checks (paid)
update public.organizations
set plan = 'paid'
where id = '00000000-0000-0000-0000-000000000001'
  and plan = 'free';
