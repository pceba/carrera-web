# WS-IA calm structure — hand-over (2026-11-27, stopped at usage limit)

Branch `claude/ws-ia-calm-structure-305a1a`, one WIP commit on top of bdebfef. NOT building yet.

## Done (in the WIP commit)

- Tokens v2 (`src/styles/tokens.css`): silver-grey #eceef1, slate ink, one slate-blue accent; light
  default, dark opt-in (`data-theme="dark"`). Contrast measured: text 14.1, muted 6.1, accent 6.1.
- Theme: single toggle button (`ThemeToggle`), `theme-script.ts` only applies stored "dark".
- Calmer primitives: mono/uppercase labels -> sans; buttons radius-md; quieter callout, tag,
  accordion (no A/B/C), tabs, timeline, sources (`SourceList only={[...]}` keeps numbering).
- Header nav = Industrias, Preparación, Recursos, Ofertas + Entrar. Footer simplified.
- `content/catalog.ts`: industries (6), sections, segments, prep guides, resource types,
  resources (10 real entries from consulting sources), helpers (neighbours, related, ...).
- `src/components/nav/`: Breadcrumbs, SectionNav (sticky rail desktop / <details> phone),
  PrevNext, Related, ResourceList, nav.module.css.
- Consulting migrated: `como-funciona` (mapa+funcionamiento), `el-trabajo`, `empresas`,
  `proceso` (year tabs replaced by 3 steps, same fact + Cite 6), `caso-practico`, `recursos`,
  `personas` (MessageTemplate inline), segment `estrategia`. Old page folder removed.
- Routes: `industrias/[slug]/page.tsx` (hub, live + preparing), `[slug]/[seccion]/page.tsx`,
  loader `industrias/_lib/content.ts` (dynamic MDX import + cite scan).

## Left

1. Rewrite `src/app/(public)/page.tsx` (home: hero, six industries, 3 steps, trust line) and
   `industrias/page.tsx` (map) — both still import removed `INDUSTRIES`/`PILLARS` -> build breaks.
2. `industrias.module.css` classes used by hub/section pages (hubHead, hubActions, hubMeta, block,
   blockTitle, toc*, guide, article, articleHead, articleFoot, kind) don't exist yet.
3. `/preparacion`, `/preparacion/[guia]`, `/recursos` (filter by ?industria=&tipo=).
4. Delete unused `GuideNav` + css; check `case.module.css` on light surface; `/dev/ui`; og-template.
5. e2e rewrite (year test, theme test, consulting URLs), catalog unit test in src/components/nav.
6. Checks, Lighthouse dev dep, screenshots v2 at 375/1280 light/dark, page heights <= 4000 px.
