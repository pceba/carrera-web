-- WS-E: junior postings collected daily by pipeline/ from official APIs.
-- Public read (active rows only); writes only with the service role, which bypasses RLS.

create table public.postings (
  id uuid primary key default gen_random_uuid(),
  source text not null check (char_length(source) <= 40),
  external_id text not null check (char_length(external_id) <= 200),
  source_url text not null check (source_url ~ '^https?://'),
  company text not null check (char_length(company) <= 200),
  title text not null check (char_length(title) <= 300),
  location text check (char_length(location) <= 300),
  city text check (char_length(city) <= 80),
  remote boolean not null default false,
  level text not null check (level in ('intern', 'trainee', 'graduate', 'junior', 'analyst')),
  industry text not null default 'other',
  posted_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  active boolean not null default true,
  unique (source, external_id)
);

create index postings_active_idx on public.postings (active, posted_at desc nulls last);
create index postings_last_seen_idx on public.postings (last_seen_at) where active;

alter table public.postings enable row level security;

-- Anyone (anon or signed in) may read live postings. No insert/update/delete policy exists, so
-- only the service role (GitHub Actions secret) can write.
create policy "postings are public" on public.postings
  for select
  to anon, authenticated
  using (active);
