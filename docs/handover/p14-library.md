# Handover P14: /recursos and /preparacion as a library

**Branch:** `claude/p14-library` (from local main, not pushed). 2026-11-28, Claude Sonnet 5.5.

## Done

- `src/components/library/`: `saved.ts` (localStorage `path.saved.v1`, ids `r:<id>`/`p:<slug>`, try/catch, useSyncExternalStore), `TypeIcon`, `ResourceLibrary`, `PrepLibrary`, css.
- `/recursos`: industry/type stay as URL links (server-filtered, existing `library.spec.ts` still passes); added search, cards with type icon + source domain, Guardar/Guardado, Guardados toggle with counter, empty states.
- `/preparacion`: search, industry chips, saved-only filter + counter, cards.
- e2e: `recursos-library.spec.ts`, `preparacion-library.spec.ts`.

## Not done

- Free/paid and language filters: `Resource` in `content/catalog.ts` has no such fields and the brief says data stays put. Request: add optional `free?: boolean` and `lang?: "es" | "en"` to `Resource` (catalog owner), then add two chip groups in `ResourceLibrary`.
- `src/components/nav/ResourceList.tsx` is now unused by /recursos (still used on guide pages).

## Gotchas

- Cards are server-rendered, so links are in the HTML; saved state appears after hydration.
- E2E run against `next start -p 3200` (3000/3100 used by other sessions).
