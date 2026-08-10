-- UpStatus workspace settings: per-org timezone for digests and incident timestamps.

alter table public.organizations add column if not exists timezone text not null default 'Europe/Kyiv';
