-- TopStatus webhooks: deliver JSON payloads to an external HTTP endpoint on status changes.
-- One webhook per organization (the integrations page configures a single URL + secret).

create table if not exists public.webhooks (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null unique references public.organizations(id) on delete cascade,
  url text not null,
  secret text not null default '',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
