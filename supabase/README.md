# supabase

**Owner:** WS-C Auth + data (M1)

Migrations, policies and seed data. No schema yet.

Only the owning stream edits this folder. Anything else is a request in the PR description. See `docs/ownership.md`.

## Schema (M1)

`profiles`, `consents`, `saved_items`, all with RLS (own rows only). `delete_my_account()` erases the user
(cascade). Sign-up is age-gated by a trigger on `auth.users` (needs `birth_year` in user metadata).

## Local development

Needs Docker. `npx supabase start`, then
`SUPABASE_TEST_DB_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres npm test` runs the RLS tests
(they are skipped when the variable is unset). Hosted project: `npx supabase link` then `npx supabase db push`.
