# Handover: P11 tracker v2

Branch `claude/p11-tracker-v2` (from local `main`). Not pushed. localStorage key and Supabase sync
(`LocalTracker`, `RemoteTracker`, server actions, migration) are unchanged.

## What changed

- `src/lib/tracker/insights.ts` (+ tests): `computeStats`, `filterBySector`, `deadlineStatus`,
  `toCsv`, `nextStepsIcs`.
- Stats bar: Total, En proceso (enviada/pruebas/entrevista), Tasa de respuesta = share of sent
  entries (everything past "Me interesa") that reached pruebas, entrevista or oferta. "Descartada"
  is not counted as a response, since the user may have discarded it themselves.
- Sector filter (select), applied to the board only; stats and the 14-day strip use all entries.
- Moving: "Mover a…" select per card (keyboard path) and pointer drag between columns (HTML5 drag;
  desktop only, touch uses the select). Both go through one `moveTo` that announces
  "X movida a Y." in a polite live region.
- Deadlines: next step before today = "Vencido" (red border + text), within 7 days = "Esta semana".
  Text label as well as colour. Not shown for descartada or oferta.
- Exports (generated in the browser): `candidaturas.csv` (UTF-8 BOM, formula-injection guard) and
  `proximos-pasos.ics` (all-day events, dated steps of open entries).
- Delete from the edit panel shows an undo bar for 8 s (`UndoBar`, own component: the shared Toast
  has no action button). Undo re-adds the entry, so it gets a new id and created_at.
- e2e: `e2e/candidaturas-v2.spec.ts` (stats, filter, deadlines, move announcement, drag, CSV/ics,
  undo). The original `candidaturas.spec.ts` still passes unchanged.

## Not verified

- Signed-in (Supabase) mode: undo goes through `actions.add`; not exercised without a database.
- Touch drag and drop is not supported on purpose; screen readers use the select.

## Edits outside owned folders

None.
