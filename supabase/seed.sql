-- Fictional data only. Runs on `supabase db reset` (local). Never put real people here.
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data, created_at, updated_at)
values
  ('00000000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'ana.ficticia@example.test', '{"birth_year": 2004}', now(), now()),
  ('00000000-0000-0000-0000-0000000000b2', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
   'beto.ficticio@example.test', '{"birth_year": 2003}', now(), now());

update public.profiles set display_name = 'Ana (demo)', degree = 'ADE', study_year = 3,
  target_industries = array['consultoria']
where id = '00000000-0000-0000-0000-0000000000a1';
