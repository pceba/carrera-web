-- Personal application tracker (roadmap item 1). Signed-in users keep their entries here;
-- visitors without an account keep them in localStorage and can import them after sign-in.
-- Same shape and limits as src/lib/tracker (types.ts / validate.ts): keep both in sync.
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  firm text not null check (char_length(firm) between 1 and 120),
  industry text check (
    industry is null
    or industry in ('consulting', 'ai', 'data-science', 'private-equity', 'investment-banking', 'big-law')
  ),
  role text check (role is null or char_length(role) <= 120),
  stage text not null default 'interes' check (
    stage in ('interes', 'enviada', 'pruebas', 'entrevista', 'oferta', 'descartada')
  ),
  applied_on date,
  next_step text check (next_step is null or char_length(next_step) <= 80),
  next_step_on date,
  url text check (url is null or (char_length(url) <= 500 and url ~ '^https://')),
  notes text check (notes is null or char_length(notes) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index applications_user_stage_idx on public.applications (user_id, stage);

-- touch_updated_at() is defined in 20261127000000_init_accounts.sql
create trigger applications_touch before update on public.applications
  for each row execute function public.touch_updated_at();

alter table public.applications enable row level security;

create policy applications_select_own on public.applications
  for select to authenticated using ((select auth.uid()) = user_id);
create policy applications_insert_own on public.applications
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy applications_update_own on public.applications
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy applications_delete_own on public.applications
  for delete to authenticated using ((select auth.uid()) = user_id);

-- Grants: anon gets nothing. Account deletion cascades through user_id.
revoke all on public.applications from anon, authenticated;
grant select, insert, update, delete on public.applications to authenticated;
