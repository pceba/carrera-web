-- WS-C: accounts and first schema. Every table has RLS: a user touches only their own rows.

-- Minimum age for accounts (AGENTS.md rule 5). Birth YEAR only, to collect the minimum data.
-- Coarse by design: year difference >= 16. The sign-up form also asks for an explicit 16+ declaration.
create function public.is_old_enough(birth_year integer)
returns boolean
language sql
immutable
as $$
  select birth_year is not null
    and birth_year >= 1900
    and extract(year from now())::integer - birth_year >= 16;
$$;

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text check (char_length(display_name) <= 80),
  degree text check (char_length(degree) <= 120),
  study_year smallint check (study_year between 1 and 8),
  target_industries text[] not null default '{}' check (cardinality(target_industries) <= 12),
  birth_year smallint not null check (public.is_old_enough(birth_year)),
  onboarded_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.consents (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  privacy_version text not null,
  terms_version text not null,
  marketing_opt_in boolean not null default false,
  accepted_at timestamptz not null default now()
);
create index consents_user_idx on public.consents (user_id, accepted_at desc);

-- Placeholder for saved postings / progress. No CV, no AI keys, ever.
create table public.saved_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('posting', 'progress')),
  ref text not null check (char_length(ref) <= 200),
  data jsonb not null default '{}'::jsonb check (pg_column_size(data) <= 16384),
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref)
);

-- updated_at maintenance
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();

-- Age gate at sign-up: the form sends birth_year in user metadata; creating the auth user fails if
-- it is missing or under 16, so the gate holds even if someone calls the Auth API directly.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_birth_year integer;
begin
  begin
    v_birth_year := (new.raw_user_meta_data ->> 'birth_year')::integer;
  exception when others then
    v_birth_year := null;
  end;
  if not public.is_old_enough(v_birth_year) then
    raise exception 'age_gate: accounts require age 16 or over';
  end if;
  insert into public.profiles (id, birth_year) values (new.id, v_birth_year);
  return new;
end;
$$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.consents enable row level security;
alter table public.saved_items enable row level security;

create policy profiles_select_own on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy profiles_update_own on public.profiles
  for update to authenticated
  using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
-- No insert policy (the trigger creates the row) and no delete policy (use delete_my_account()).

-- Consents are an append-only audit trail for the user: select + insert only.
create policy consents_select_own on public.consents
  for select to authenticated using ((select auth.uid()) = user_id);
create policy consents_insert_own on public.consents
  for insert to authenticated with check ((select auth.uid()) = user_id);

create policy saved_items_select_own on public.saved_items
  for select to authenticated using ((select auth.uid()) = user_id);
create policy saved_items_insert_own on public.saved_items
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy saved_items_update_own on public.saved_items
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy saved_items_delete_own on public.saved_items
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Grants: anon gets nothing.
revoke all on public.profiles, public.consents, public.saved_items from anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select, insert on public.consents to authenticated;
grant select, insert, update, delete on public.saved_items to authenticated;

-- GDPR erasure (art. 17): deleting the auth user cascades to every table above.
-- security definer so no service-role key is ever needed in the web app.
create function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;
revoke all on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
