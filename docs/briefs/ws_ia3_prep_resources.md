# Brief WS-IA slice 2: /preparacion and /recursos (about 1 hour)

Continues the WS-IA branch after the build-green slice. Same ownership as
`docs/briefs/ws_ia_calm_structure.md`.

## Deliverable

1. `/preparacion` (index of the cross-industry prep guides in `PREP_GUIDES`, each with the
   industries it serves) and `/preparacion/[guia]` (frame: what it is, which industries use it,
   links to the industry sections that cover it, resources of that kind; "en preparación" where
   there is no content yet). Breadcrumbs and related links from `src/components/nav/`.
2. `/recursos`: the resource library from `content/catalog.ts`, filtered by `?industria=` and
   `?tipo=` with plain links (works without JS, keyboard-accessible, 375 px), empty state in Spanish.
3. Visual check in a browser of home, map, consulting hub, one section, `/preparacion` and
   `/recursos` at 375 and 1280 px; fix what looks noisy or broken. No screenshots committed yet.

All web checks pass after each step. Out of scope: e2e rewrite, Lighthouse, committed screenshots
(slice 3). Commit after each step; no push, no merge; update the handover before stopping.
