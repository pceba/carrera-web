-- WS-F1: daily alert digest. One row per person. The profile fields are the ones `cw-match` reads,
-- and nothing else (no CV, no languages, no education): data minimisation, AGENTS.md rule 5.

create table public.alert_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users (id) on delete cascade,
  -- Consent is recorded through the existing append-only `consents` table: the row must belong to
  -- the same user and carry marketing_opt_in (see the insert policy). Keeping the FK makes the
  -- proof of consent travel with the subscription.
  consent_id uuid not null references public.consents (id),
  -- The six industries of ADR-004, in order of preference (first = most wanted).
  industries text[] not null default '{}'
    check (cardinality(industries) <= 6
      and industries <@ array['consulting', 'ai', 'data-science', 'private-equity', 'investment-banking', 'big-law']),
  roles text[] not null default '{}' check (cardinality(roles) <= 10),
  skills text[] not null default '{}' check (cardinality(skills) <= 20),
  locations text[] not null default '{}' check (cardinality(locations) <= 10),
  remote text not null default 'any' check (remote in ('any', 'remote', 'onsite')),
  active boolean not null default true,
  -- Written only by the digest job (service role). Postings first seen after this are "new".
  last_sent_at timestamptz,
  -- Secret in the unsubscribe link of every email; 122 random bits.
  unsubscribe_token uuid not null unique default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index alert_subscriptions_active_idx on public.alert_subscriptions (last_sent_at nulls first) where active;

create trigger alert_subscriptions_touch before update on public.alert_subscriptions
  for each row execute function public.touch_updated_at();

alter table public.alert_subscriptions enable row level security;

create policy alert_subscriptions_select_own on public.alert_subscriptions
  for select to authenticated using ((select auth.uid()) = user_id);

-- Subscribing needs a fresh consent of the same user that opted in to email.
create policy alert_subscriptions_insert_own on public.alert_subscriptions
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.consents c
      where c.id = consent_id and c.user_id = (select auth.uid()) and c.marketing_opt_in
    )
  );

create policy alert_subscriptions_update_own on public.alert_subscriptions
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy alert_subscriptions_delete_own on public.alert_subscriptions
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Grants: anon gets nothing. Column-level, so a user can edit their preferences but never
-- last_sent_at (which would replay or suppress digests) or the token.
revoke all on public.alert_subscriptions from anon, authenticated;
grant select, delete on public.alert_subscriptions to authenticated;
grant insert (user_id, consent_id, industries, roles, skills, locations, remote, active)
  on public.alert_subscriptions to authenticated;
grant update (industries, roles, skills, locations, remote, active)
  on public.alert_subscriptions to authenticated;

-- One-click unsubscribe from the email link, for someone who is not signed in. The unguessable
-- token is the credential. Returns whether a subscription was switched off.
create function public.unsubscribe_alerts(token uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  changed integer;
begin
  update public.alert_subscriptions set active = false
    where unsubscribe_token = token and active;
  get diagnostics changed = row_count;
  return changed > 0;
end;
$$;
revoke all on function public.unsubscribe_alerts(uuid) from public;
grant execute on function public.unsubscribe_alerts(uuid) to anon, authenticated;

-- What the digest job reads: active subscriptions with the address, which lives in `auth.users`
-- and is not exposed by the REST API. Service role only; longest-waiting first so a daily cap on
-- emails stays fair.
create function public.alert_recipients()
returns table (
  subscription_id uuid,
  email text,
  industries text[],
  roles text[],
  skills text[],
  locations text[],
  remote text,
  last_sent_at timestamptz,
  unsubscribe_token uuid
)
language sql
security definer
set search_path = ''
as $$
  select s.id, u.email::text, s.industries, s.roles, s.skills, s.locations, s.remote,
         s.last_sent_at, s.unsubscribe_token
  from public.alert_subscriptions s
  join auth.users u on u.id = s.user_id
  where s.active and u.email is not null
  order by s.last_sent_at nulls first, s.created_at;
$$;
revoke all on function public.alert_recipients() from public, anon, authenticated;
grant execute on function public.alert_recipients() to service_role;
-- The job also marks digests as sent. The service role bypasses RLS but still needs the grant.
grant select, update (last_sent_at) on public.alert_subscriptions to service_role;
