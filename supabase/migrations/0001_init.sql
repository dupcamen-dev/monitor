-- TopStatus schema (Supabase / PostgreSQL)

create extension if not exists "pgcrypto";

create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now()
);

create table if not exists public.monitors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  kind text not null default 'website', -- website | api | database | dashboard
  url text not null,
  status text not null default 'up', -- up | degraded | down
  latency_ms integer,
  interval_sec integer not null default 60,
  paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.checks (
  id bigint generated always as identity primary key,
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  checked_at timestamptz not null default now(),
  status text not null, -- up | degraded | down
  latency_ms integer,
  response_code integer
);
create index if not exists checks_monitor_time on public.checks (monitor_id, checked_at desc);

create table if not exists public.incidents (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  title text not null,
  status text not null default 'investigating', -- investigating | identified | monitoring | resolved
  impact text not null default 'none', -- none | minor | major | critical
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.incident_updates (
  id uuid primary key default gen_random_uuid(),
  incident_id uuid not null references public.incidents(id) on delete cascade,
  tone text not null default 'info', -- info | danger | success
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.incident_monitors (
  incident_id uuid not null references public.incidents(id) on delete cascade,
  monitor_id uuid not null references public.monitors(id) on delete cascade,
  primary key (incident_id, monitor_id)
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  channel text not null, -- email | telegram
  target text not null,
  token text,
  verified boolean not null default true,
  created_at timestamptz not null default now(),
  unique (channel, target)
);

-- seed default org + a few sample monitors (real HTTP targets so the cron can ping them)
insert into public.organizations (id, name, slug)
values ('00000000-0000-0000-0000-000000000001', 'TopStatus', 'topstatus')
on conflict (id) do nothing;

insert into public.monitors (id, org_id, name, kind, url, interval_sec)
values
  ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Main Website', 'website', 'https://example.com', 60),
  ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000001', 'API Gateway', 'api', 'https://example.org', 60),
  ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000001', 'Dashboard', 'dashboard', 'https://example.net', 60),
  ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000001', 'CDN Edge', 'website', 'https://vercel.com', 60)
on conflict (id) do nothing;
