# Handover: P1 application tracker

Branch `claude/p1-tracker-5e2df3` (brief said `p1/tracker`; the worktree branch was used). Not pushed.

## What exists

- `/candidaturas` (public). Without account: `localStorage` key `path.applications.v1`
  (`{version, items}`), read/written in try/catch, in-memory fallback if storage throws.
- Signed in: server page loads `public.applications` (RLS) and renders `RemoteTracker`; writes go
  through server actions in `src/lib/tracker/actions.ts` (re-validated with `validate.ts`, UUID/stage
  checked, import capped at 200). If the query fails (e.g. table not migrated yet) the page falls
  back to the local tracker.
- Import banner: shown only when signed in and the browser holds entries; explicit button, local copy
  cleared after a successful import. Invalid local entries are skipped, never fixed.
- Board: 6 columns from 900 px; below, a list grouped by stage (empty stages hidden). Stage `<select>`
  per card, edit form panel, "Próximos 14 días" strip, empty state.
- Layers: `src/lib/tracker/` (types, validate, derive, store, actions, tests),
  `src/components/tracker/` (`TrackerView` is storage-agnostic; `LocalTracker`/`RemoteTracker` plug in).

## Orchestrator TODO

- Run `npx supabase db push` after merge (`20261128090000_applications.sql`). Not run remotely.
- `rls.test.ts` has a new applications case; it skips without `SUPABASE_TEST_DB_URL`, so it was
  **not executed** here. Run it against a local DB once.
- Not verified in a browser: the signed-in path (needs Supabase). Only no-account flows are in e2e.

## Edits outside owned folders

- `src/app/(account)/cuenta/exportar/route.ts`: adds `applications` to the export.
- `src/app/(account)/cuenta/page.tsx`: one panel with a link to `/candidaturas`.
- `src/lib/supabase/rls.test.ts`: RLS case (requested by the brief) plus deletion-cascade check.
- `docs/briefs/p1_tracker.md`: only reformatted by Prettier (it failed `format:check` on main).
- Request for the redesign session (owns header/nav/`ui`/`styles`): add `/candidaturas` ("Candidaturas")
  to the header nav (`NAV_LINKS` in `src/components/ui/site-data.ts`). Not touched here.

## Gotchas

- Playwright runs against `npm run start`: rebuild before e2e after code changes.
- `consulting.spec.ts` "proceso lists…" failed once, passed on rerun (flaky, unrelated).
