-- Telegram linking: per-org uniqueness + unique deep-link tokens

alter table public.subscriptions
  drop constraint if exists subscriptions_channel_target_key;

alter table public.subscriptions
  add constraint subscriptions_org_channel_target_key unique (org_id, channel, target);

create unique index if not exists subscriptions_token_key
  on public.subscriptions (token)
  where token is not null;
