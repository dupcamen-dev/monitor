-- TopStatus payments: NowPayments crypto invoices that activate paid/yearly plans.
-- A row is created when the user requests an invoice; the IPN webhook updates status
-- and, on a confirmed/finished payment, activates the plan on the organization.

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  plan text not null check (plan in ('paid', 'yearly')),
  amount_usd numeric(10, 2) not null,
  order_id text not null unique,
  payment_id bigint,
  status text not null default 'waiting', -- waiting | confirming | confirmed | sending | finished | failed | expired
  payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists payments_org_idx on public.payments (org_id, created_at desc);
create index if not exists payments_order_idx on public.payments (order_id);
