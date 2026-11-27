# Brief WS-IA slice 3: e2e, Lighthouse, screenshots, then merge-ready (about 1 hour)

Continues the WS-IA branch after slice 2. Same ownership as `docs/briefs/ws_ia_calm_structure.md`.

## Deliverable

1. Rewrite `e2e/`: delete the year-of-degree test; home links the six industries; header reaches
   Industrias, Preparación, Recursos, Ofertas; consulting hub -> section -> next/previous; segment
   `estrategia`; `/recursos` filters by `?industria=` and `?tipo=`; theme toggle persists dark.
   `npm run test:e2e` (or the project's e2e script) passes.
2. Lighthouse on home, consulting hub and one section, light and dark: aim for 95+ performance and
   accessibility, fix what it finds, write the real numbers in the handover. If Lighthouse cannot
   run, say why and use Chrome DevTools numbers instead; do not invent figures.
3. Screenshots at 375 and 1280 px (light) of home, map, consulting hub, one section,
   `/preparacion`, `/recursos` in `docs/screenshots/v2/`; check no page is over ~4,000 px at 375 px.
4. Merge current `main` into the branch, re-run all web checks, and say it is merge-ready.

Commit after each step; no push; update the handover before stopping.
