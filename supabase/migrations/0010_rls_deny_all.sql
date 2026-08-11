-- TopStatus: enable RLS (deny all) on every public table.
-- The service-role key (server-side, used by all API routes) bypasses RLS,
-- so the app keeps working. The browser anon key is used ONLY for auth
-- operations (sign in / sign out), never for table access.

alter table public.organizations     enable row level security;
alter table public.monitors          enable row level security;
alter table public.checks            enable row level security;
alter table public.incidents         enable row level security;
alter table public.incident_updates  enable row level security;
alter table public.incident_monitors enable row level security;
alter table public.subscriptions     enable row level security;
alter table public.webhooks          enable row level security;
alter table public.payments          enable row level security;
alter table public.seo_settings      enable row level security;
alter table public.page_visits       enable row level security;

-- No policies are created, so anon / authenticated are denied all access.

-- Defense in depth: strip default grants on public tables from anon/authenticated.
revoke all on table public.organizations, public.monitors, public.checks,
  public.incidents, public.incident_updates, public.incident_monitors,
  public.subscriptions, public.webhooks, public.payments,
  public.seo_settings, public.page_visits
from anon, authenticated;

-- Prevent future tables in public from auto-granting to anon/authenticated.
alter default privileges in schema public revoke all on tables from anon, authenticated;
