# Handover P2a: recruiting calendar (`/calendario`)

Branch `claude/p2a-calendar-68efb7`, not pushed. Owner folders: `src/app/(public)/calendario/`,
`src/components/calendar/`, `src/lib/calendar/`, `content/calendario/`, `e2e/calendario.spec.ts`.

## What exists

- `content/calendario/programas.yaml`: 12 rows (consulting 5, IB 3, Big Law 4), review front matter
  (`reviewer: "pendiente"`).
- **Every `opens`/`closes` is `null`.** On 2026-11-28 I fetched each firm's official page; none
  states opening or closing dates (programme names only). The UI says "Fechas aún no publicadas ·
  ver la web oficial". Nothing was inferred from blogs or past years.
- Not covered (below the 15-25 target, on purpose): McKinsey (page timed out), Oliver Wyman (no
  programme named), Rothschild (HTTP 403), Freshfields/Pérez-Llorca/Clifford Chance (no programme
  or dates readable), and PE / data science / AI (no firm named in `content/` with an official page
  fetched). Add rows only after reading the official page.
- UI: industry chips, status chips (computed on the client from today), 12-month timeline (>= 900 px,
  only dated rows), list grouped by month on phones, "Añadir a candidaturas" (local tracker, stage
  `interes`, toast, no duplicates), "Añadir al calendario" (.ics, disabled while there are no dates).
- Tests: `src/lib/calendar/calendar.test.ts` (schema, https, closes >= opens, status, ics, parser);
  `e2e/calendario.spec.ts` (empty dates, filter, tracker add, 375 px).

## Decisions and gotchas

- No YAML dependency (js-yaml is only transitive): `parse.ts` reads a restricted YAML subset and
  throws on anything else. If you add a YAML lib later, swap it in `programmes.ts` only.
- "Añadir a candidaturas" writes to `localStorage` only. Signed-in users use the remote tracker, so
  their calendar adds do not reach their account yet (needs a server action call; not in scope).
- The timeline and month list were never exercised with real dates (there are none); the unit tests
  cover the logic. Check visually when the first date lands.

## Requests for other owners

- Nav/palette link to `/calendario`: not added. `ROUTES` and `TOOLS` live in
  `src/components/ui/site-data.ts` (P3 owner): add `calendar: "/calendario"` and a TOOLS entry.
