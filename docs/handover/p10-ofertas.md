# P10 handover: `/ofertas` as a product

## What changed

- `src/components/postings/` (new): `PostingsBrowser` (client), `PostingsSkeleton`, `logic.ts`
  (+ unit tests), `postings.module.css`.
- `src/app/(public)/ofertas/page.tsx` now only fetches (server, same Supabase query as before) and
  renders the browser; new `loading.tsx` shows skeleton cards.
- Cards: firm wordmark (Geist, monogram tile), level + industry chips, city, "Remoto", "Nueva"
  (first seen < 3 days), source, "Añadir a candidaturas" (writes to the local tracker store
  `path.applications.v1`, stage "Me interesa", dedupes by link, toast). Title opens a Dialog with
  "Solicitar en la web de la empresa" (company boards) or "Ver el anuncio original" (aggregators:
  Remotive/Jobicy/Adzuna keep their required attribution).
- Filters are chips (industria, nivel, ciudad, solo remoto) that are real links: the server filters,
  the URL is the state. Search (`q`) and sort (`orden=encaje`) are client-side over the loaded 60
  and mirrored into the URL with `history.replaceState`.
- Sort "Encaje con tu perfil" appears only when a local profile exists (`loadProfile`); it lazy
  loads the WASM engine and shows "es un orden, no un veredicto" (no scores shown).
- Empty states differ for no data / filters / search.

## Checks

typecheck, lint, format:check, 114 unit, build, `e2e/ofertas.spec.ts` (5 tests x desktop and 375 px)
all green.

## Not covered / notes

- e2e cannot render cards: postings are fetched server-side and the e2e server has no Supabase
  data, so card, dialog and "Añadir a candidaturas" are covered by unit tests for the logic but not
  by a browser test. Needs a seeded Supabase or a stubbed `NEXT_PUBLIC_SUPABASE_URL` in CI.
- Signed-in users: "Añadir" writes to the local store only (brief), not to Supabase sync.
- Search covers the 60 postings loaded for the current server filters, not the whole table.
- No files outside the owned folders were touched.
