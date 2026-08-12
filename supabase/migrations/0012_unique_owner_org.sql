-- One workspace per auth user.
-- Guards against a race that created duplicate organizations for the same
-- owner (concurrent getUserOrg() calls during dashboard render), which broke
-- API routes that relied on .maybeSingle() (returned 401 "Unauthorized").
--
-- The demo/public workspace stays ownerless (owner_id NULL), which a partial
-- unique index allows.

-- Safety net: collapse any existing duplicates, keeping one row per owner.
delete from public.organizations a
using public.organizations b
where a.owner_id = b.owner_id
  and a.owner_id is not null
  and a.id > b.id;

create unique index if not exists organizations_owner_id_unique
  on public.organizations (owner_id)
  where owner_id is not null;
