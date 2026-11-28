# Handover P9: industry comparison on `/industrias`

**Branch:** `claude/p9-compare-90e711` (not pushed). Updated 2026-11-28, Claude Sonnet 5.5.

## What exists

- `src/lib/compare/data.ts`: 7 dimensions x 6 industries. A value exists only if the guide page in
  `source` (`<industry>/<page>`, under `content/industrias/`) states and cites it; otherwise
  `null` + reason, rendered "—". PE, data science and IA are all "Guía en preparación".
- `data.test.ts`: every non-empty value has an existing source file in its own industry, gaps have a
  reason, preparing industries are empty, pay always comes from a `sueldos` page (by level, never
  per firm).
- `src/components/compare/`: `CompareView` (chips, 2-3 selected; desktop table with sticky header
  row, 375 px swipeable scroll-snap cards; CSS shows one of the two), `CompareButton` (Dialog).
- `/industrias`: "Comparar" button under each card + comparison section + "Haz el test"
  (`/diagnostico`). "Ver la guía" links to the first reading page (not the hub) so hub links stay
  unique on the map (existing e2e in `home.spec.ts` / `home-product.spec.ts` rely on that).
- `e2e/industrias-compare.spec.ts`: table, dialog, 375 px cards.

## Gotchas

- Compare markup avoids `<ul>`/`role="status"`: `home-product.spec.ts` counts `main ul a` and the
  single `main` status line. Keep it that way or update those specs.
- Values are paraphrased from the guides; when a guide changes (e.g. new sueldos), update `data.ts`.
- Gaps worth filling when sources exist: horario (no Spanish hours survey), consultoría sueldo and
  idiomas, big law perfil.
- E2E was run against `next start -p 3200` (3000/3100 were used by other sessions).
