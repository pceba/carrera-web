# Brief P1: application tracker (about 1 hour)

Product roadmap item 1 (content is paused; see `docs/ORCHESTRATOR_PROMPT.md`). Read `AGENTS.md`,
`docs/naming.md` (identity) and only the files named here. Branch `p1/tracker`, no push.

## Owned

`src/app/(public)/candidaturas/`, `src/components/tracker/`, `src/lib/tracker/`,
`supabase/migrations/<new>_applications.sql`, `e2e/candidaturas.spec.ts`,
`docs/handover/p1-tracker.md`. Tiny edits allowed (say so in the handover):
`src/app/(account)/cuenta/exportar/route.ts` (add the table), `src/app/(account)/cuenta/page.tsx`
(one link), the site nav if it has a list of tools.

## Decisions (do not reopen)

- Route **`/candidaturas`** in `(public)`, not under `/cuenta`: `src/lib/supabase/session.ts`
  redirects every `/cuenta*` path to sign-in, and the tracker must work without an account.
- Stages, in order (slug: label): `interes` Me interesa, `enviada` Enviada, `pruebas` Pruebas,
  `entrevista` Entrevista, `oferta` Oferta, `descartada` Descartada.
- An entry: firm (required, ≤120), industry (optional, one of the six slugs from the existing
  taxonomy in `src/lib/generated/`), programme/role (≤120), stage, applied_on (date), next step
  label (≤80) + date, posting URL (https only, ≤500), notes (≤2000). No other personal data.
- Without account: `localStorage` key `path.applications.v1`, JSON array with a `version` field;
  every read/write in try/catch; the page renders (empty) when storage throws.
- Signed in: Supabase is the source of truth. If the browser also holds entries, show one calm
  banner "Tienes N candidaturas guardadas en este navegador" with a button to import them
  (explicit, never a silent merge); after import, clear the local copy.
- Migration `public.applications`: `id uuid pk default gen_random_uuid()`, `user_id uuid not null
default auth.uid() references auth.users(id) on delete cascade`, the fields above with `check`
  constraints (lengths, stage list, industry list or null, `url ~ '^https://'`), `created_at`,
  `updated_at` (trigger). RLS on; select/insert/update/delete policies `user_id = auth.uid()`,
  same style as `saved_items` in `20261127000000_init_accounts.sql`. Index on `(user_id, stage)`.
  Add it to the account export; account deletion already cascades. Add an RLS case to
  `src/lib/supabase/rls.test.ts` (it skips without a local DB).
- Writes via server actions; validate on the server with the same limits.
- UI: desktop (≥ 900 px) a board, one column per stage with counts; at 375 px a list grouped by
  stage. No drag and drop: each card has a stage `<select>` and an edit button; add/edit in a
  form panel. Upcoming next steps (next 14 days) in a small strip at the top. Empty state that
  explains the tool in two lines with an "Añadir la primera" button. Tokens and UI primitives
  only, AA, keyboard-complete. Copy in Spanish (tú, direct).
- Page states what is stored where: "Sin cuenta, se guarda solo en este navegador."

## Deliverable

1. Lib (types, validation, local store) with Vitest tests. Commit.
2. Page and components working without account. Commit.
3. Migration + server actions + import banner + export. Commit. Do not run it on the remote DB:
   the orchestrator runs `npx supabase db push` after merge.
4. e2e (no account): add, move stage, edit, reload persists, 375 px. Commit.

All checks pass (`typecheck`, `lint`, `format:check`, `test`, `build`, Playwright). Kill orphan
`next start` on :3000/:3100 before e2e. Write `docs/handover/p1-tracker.md` (≤30 lines).
