# Handover P8: public Encaje (`/encaje`)

Branch `claude/p8-encaje` (from local `main`), not pushed.

## Done

- `/encaje` is public (`src/app/(public)/encaje/page.tsx`): same CV-in-browser flow, profile in
  `localStorage` (`carrera-web.profile.v1`, unchanged), ranked postings. Works without Supabase.
- `/cuenta/encaje` now `permanentRedirect("/encaje")`.
- `ROUTES.fit` is `/encaje` (one line in `src/components/ui/site-data.ts`); header, home, bands and
  bento all use `ROUTES.fit`, so no marketing file needed edits.
- After the results: signed out -> "Crea una cuenta para guardarlo y recibir alertas"
  (`/entrar?modo=crear`); signed in -> a note that the profile lives in this browser.
- Each ranked posting has "Añadir a candidaturas" (local tracker, stage `interes`, toast, no
  duplicate by URL): `src/components/match/tracker.ts`.
- Tests: `e2e/encaje-public.spec.ts` (public page, redirect, add to tracker on `/dev/encaje`).
  No existing e2e used the old route.

## Not done / for others

- **"Guardar en tu cuenta" is not built.** There is no table for the Encaje profile (only
  `profiles.birth_year`) and the brief forbids new migrations here. It needs a migration plus a
  server action; the signed-in note says "llegará pronto".
- The redirect answers 307, not 308: a page-level `permanentRedirect` does not give a real 308.
  For a true permanent redirect add `redirects()` in `next.config` (shared file, not touched).
- `src/app/dev/encaje/page.tsx` still mentions `/cuenta/encaje` in a comment (not my folder).
- On prod without postings the results list is empty; the add-to-tracker test uses `/dev/encaje`
  (sample postings), which only exists under `next dev`.
